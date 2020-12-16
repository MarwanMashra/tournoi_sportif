<?php
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    session_start();
    
    include 'pdo.php';
    if (isset($_POST['function']) && $_POST['function'] != '')
    {   
        echo $_POST['function']($pdo,$_POST['params']);
        $pdo=null;

    }

    function f($params){
        return json_encode(array('res'=>($params['x']+$params['y'])));
    }

    function getSession($pdo,$params){
        if(isset($_SESSION['login']))
            return json_encode(array('login'=>$_SESSION['login']));
        else
            return json_encode(array('login'=>null));
    }


    function getAllEvents($pdo,$params){
        
        $q_events= $pdo->query('SELECT * from Evenement;');
        
        $res = array();
        foreach($q_events as $row){
            $res[] = $row;
        }
        return json_encode($res);
    }

    function getTournoiById($pdo,$params){
        $q_events=$pdo->prepare('SELECT * from Tournoi where IdTournoi=?');

        $q_events->execute(array($params["id"]));
        $res = $q_events->fetch();
        return json_encode($res);
    }

    function getNbJoueurByIdTournoi($pdo,$params){
        $q_events=$pdo->prepare('SELECT NbJoueur from Tournoi T,Evenement E where T.IdEvenement=E.IdEvenement and IdTournoi=?');
        $q_events->execute(array($params["id"]));
        $res = $q_events->fetch();
        return json_encode($res);
    }

    function getAllSports($pdo,$params){
        $q_events=$pdo->query('SELECT TypeJeu from Sport order by TypeJeu');
        $res = array();
        foreach($q_events as $row){
            $res[] = $row['TypeJeu'];
        }
        return json_encode($res);
    }

    function searchEvents($pdo,$params){

        $startDate=$params['start'];
        $endDate=$params['end'];
        $sport=$params['sport'];
        $statue=$params['statue'];
     
        $q="SELECT * from Evenement E join Tournoi T on T.IdEvenement=E.IdEvenement where TypeTournoi='principal' and DateEvenement>=:startDate and DateEvenement<=:endDate";
        $listParams= array('startDate'=>$startDate,'endDate'=>$endDate);
        if($sport!="all"){
            $q.=" and TypeJeu=:sport";
            $listParams['sport']=$sport;
        }
        if($statue!="all"){
            $q.=" and Statue=:statue";
            $listParams['statue']=$statue;
        }
        $q.=" order by DateEvenement,Statue,NomEvenement";
        $q_events= $pdo->prepare($q);
        $q_events->execute($listParams);
        $res = array();
        foreach($q_events as $row){
            $res[] = $row;
        }

        return json_encode($res);
    }
    

    function insertEvent($pdo,$params){
        $NomEvenement=$params['NomEvenement'];
        $LieuEvenement=$params['LieuEvenement'];
        $DateEvenement=$params['DateEvenement'];
        $TypeJeu=$params['TypeJeu'];
        $NbJoueur=$params['NbJoueur'];
        $listTournoi=$params['listTournoi'];
        $pseudo=$params['pseudo'];

        
        if($NomEvenement!="" && $LieuEvenement!="" && $DateEvenement!="" && $TypeJeu!="" && $NbJoueur!="" && count($listTournoi)>0){
            try{   //je démarre une transaction
                
                $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
                $pdo->beginTransaction();
            
                $q_event= $pdo->prepare("INSERT into Evenement values (null,:nomE,:lieuE,:dateE,:sport,:nbJ,:pseudo,'bientot');");
                $data=array('nomE'=>$NomEvenement,'lieuE'=>$LieuEvenement,'dateE'=>$DateEvenement,'sport'=>$TypeJeu,'nbJ'=>$NbJoueur,'pseudo'=>$pseudo);
                $q_event->execute($data);
                

                $q_IdEvenement= $pdo->query('SELECT IdEvenement FROM Evenement WHERE IdEvenement=LAST_INSERT_ID();');
                $IdEvenement= $q_IdEvenement->fetch()['IdEvenement'];

                $q_tournoi= $pdo->prepare("INSERT into Tournoi values (null,:categorie,'principal',:IdEvenement);");
                foreach($listTournoi as $categorie){
                    $q_tournoi->execute(array('categorie'=>$categorie,'IdEvenement'=>$IdEvenement));
                }

                $pdo->commit();
                return json_encode(array('message'=>"L'événement a bien été créé",'class'=>"succes"));

            }
            catch(PDOException $e){
                $pdo->rollBack();
                return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error"));
            }
        }      

    }

    
    function getFreeTerrain($pdo,$params){

        $q_terrain= $pdo->prepare("SELECT Trr.NumTerrain from Terrain Trr join Evenement E on E.TypeJeu=Trr.TypeJeu 
                                    join Tournoi Tr on Tr.IdEvenement=E.IdEvenement where Tr.IdTournoi=? 
                                    and Trr.NumTerrain not in (SELECT Trr2.NumTerrain from Terrain Trr2 
                                    join Poule P on P.NumTerrain=Trr2.NumTerrain join Tour T on T.IdTour=P.IdTour 
                                    and T.Statue='encours');");

        $q_terrain->execute(array($params['idTournoi']));
        
        $res = array();
        foreach($q_terrain as $row){
            $res[] = $row['NumTerrain'];
        }
        return json_encode($res);
    }
    
    function getEquipeByIdTournoi($pdo,$params){
        
        $q_equipe= $pdo->prepare("SELECT * from Equipe where IdTournoi=? and InscriptionValidee=true;");
        $q_equipe->execute(array($params['idTournoi']));
        
        $res = array();
        foreach($q_equipe as $row){
            $res[] = $row;
        }
        return json_encode($res);
    }

    function getDecisionTour($pdo,$params){
        /*
        la décision est prise selon trois cas:
            1) un tour est ecnours => chercher le plus grand tour tel que statue = encours             [encours]
            2) y a déjà un tour créé => chercher le plus petit tour bientot mais aussi le dernier      [bientot]
            3) il faut créer un nouveau tour => chercher le plus grand tour termine                    [termine] ou null (premier tour)
             
            si un tour est en cours => (1), sinon s'il y a des cours bientot (2), sinon (3)
        */
        $res=array();
        $res['tour']=null;
        $res['lastTour']= null;

        //cas 1
        $q_tour_encours= $pdo->prepare("SELECT * from Tour where IdTournoi=? and Statue='encours' ;");  //un seul encours, pas plus
        $q_tour_encours->execute(array($params['idTournoi']));
        if($q_tour_encours->rowCount()==1){
            $res['tour']=$q_tour_encours->fetch();
        }


        // //cas 2
        // $q_tour_bientot= $pdo->prepare("SELECT * from Tour T1 where T1.IdTournoi=? and T1.Statue='bientot' and 
        //                                 T1.NumTour=(SELECT min(NumTour) from Tour T2 where T2.IdTournoi=T1.IdTournoi 
        //                                 and T2.Statue='bientot' );");  
        // $q_tour_bientot->execute(array($params['idTournoi']));
        // if($q_tour_bientot->rowCount()==1){
        //     $res['tour']=$q_tour_bientot->fetch();
        // }

        //cas 3
    
        $q_tour_termine= $pdo->prepare("SELECT * from Tour T1 where T1.IdTournoi=? and T1.Statue='termine' and 
                                        T1.NumTour=(SELECT max(NumTour) from Tour T2 where T2.IdTournoi=T1.IdTournoi 
                                        and T2.Statue='termine' );");
        $q_tour_termine->execute(array($params['idTournoi']));

        if($q_tour_termine->rowCount()==1){
            $res['lastTour']=$q_tour_termine->fetch();
        }
        
        return json_encode($res);

    }

    function insertTour($pdo,$params){
        $NomTour=$params['NomTour'];
        $Statue=$params['Statue'];
        $IdTournoi=$params['IdTournoi'];
        $NumTour=$params['NumTour'];
        $listPoule=$params['listPoule'];

        $nomPouleVide=false;
        foreach($listPoule as $poule){
            $nomPouleVide|= $poule['NomPoule']=="";
        }
        if(!$nomPouleVide && count($listPoule)>0){
            try{   //je démarre une transaction
                
                $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
                $pdo->beginTransaction();
            
                $q_tour= $pdo->prepare('INSERT into Tour values (null,:nomT,:numT,:statue,:idTournoi);');
                $data=array('nomT'=>$NomTour,'numT'=>$NumTour,'statue'=>$Statue,'idTournoi'=>$IdTournoi);
                $q_tour->execute($data);
                

                $q_IdTour= $pdo->query('SELECT IdTour FROM Tour WHERE IdTour=LAST_INSERT_ID();');
                $IdTour= $q_IdTour->fetch()['IdTour'];

                $q_poule= $pdo->prepare('INSERT into Poule values (null,:NomPoule,:IdTour,:NumTerrain);');
                $q_joue= $pdo->prepare('INSERT into Joue values (:IdPoule,:IdEquipe,0,0,0);');
                foreach($listPoule as $poule){
                    $q_poule->execute(array('NomPoule'=>$poule['NomPoule'],'IdTour'=>$IdTour,'NumTerrain'=>$poule['NumTerrain']));

                    $q_IdPoule= $pdo->query('SELECT IdPoule FROM Poule WHERE IdPoule=LAST_INSERT_ID();');
                    $IdPoule= $q_IdPoule->fetch()['IdPoule'];

                    foreach($poule['listIdEquipe'] as $IdEquipe){
                        $q_joue->execute(array('IdPoule'=>$IdPoule,'IdEquipe'=>$IdEquipe));
                    }

                }

                $pdo->commit();
                return json_encode(array('message'=>"Le tour a bien été créé",'class'=>"succes"));

            }
            catch(PDOException $e){
                $pdo->rollBack();
                return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error"));
            }
        }      
    }

    function getResultByIdTour($pdo,$params){
        $q_result= $pdo->prepare('SELECT * from Tour T join Poule P on P.IdTour=T.IdTour join Joue J on J.IdPoule=P.IdPoule
                                join Equipe E on E.IdEquipe=J.IdEquipe where T.IdTour=? order by P.IdPoule,J.NbMatch DESC,J.NbSet DESC,J.NbPoint DESC;');
        $q_result->execute(array($params['IdTour']));

        $res = array();
        foreach($q_result as $row){
            $res[] = $row;
        }
        return json_encode($res);
        
    }

    function updateResult($pdo,$params){
        $NbSet=$params['NbSet'];
        $NbPoint=$params['NbPoint'];
        $vainqueur=$params['vainqueur'];
        $IdPoule=$params['IdPoule'];
        $IdEquipe=$params['IdEquipe'];
        try{   //je démarre une transaction
                
            $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
            $pdo->beginTransaction();
            
            if($vainqueur!="0"){
                $q_vainqueur= $pdo->prepare('UPDATE Joue SET NbMatch=NbMatch+1 where IdPoule=? and IdEquipe=?;');
                $q_vainqueur->execute(array($IdPoule,$IdEquipe));
            }
            if($NbSet!="0"){
                $q_NbSet= $pdo->prepare('UPDATE Joue SET NbSet=NbSet+? where IdPoule=? and IdEquipe=?;');
                $q_NbSet->execute(array($NbSet,$IdPoule,$IdEquipe));
            }
            if($NbPoint!="0"){
                $q_NbPoint= $pdo->prepare('UPDATE Joue SET NbPoint=NbPoint+? where IdPoule=? and IdEquipe=?;');
                $q_NbPoint->execute(array($NbPoint,$IdPoule,$IdEquipe));
            }
            
            $pdo->commit();
            return json_encode(array('message'=>"Le résultat a été mis à jour",'class'=>"succes"));

        }
        catch(PDOException $e){
            $pdo->rollBack();
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error"));
        }

    }

    function endTour($pdo,$params){
        try{   //je démarre une transaction
                
            $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
            $pdo->beginTransaction();
            
            $q_endTour= $pdo->prepare("UPDATE Tour SET Statue='termine' where IdTour=?;");
            $q_endTour->execute(array($params['IdTour']));

            $q_libreTerrain= $pdo->prepare("UPDATE Poule SET NumTerrain=null where IdTour=?;");
            $q_libreTerrain->execute(array($params['IdTour']));

            $pdo->commit();
            return json_encode(array('message'=>"Le tour a terminé",'class'=>"succes"));

        }
        catch(PDOException $e){
            $pdo->rollBack();
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    
    }

    function CheckTypeTournoi($pdo,$params){
        $IdTournoi=$params['idTournoi'];
        $q_both= $pdo->prepare("SELECT * from Tournoi T1 join Evenement E on E.IdEvenement=T1.IdEvenement where (T1.IdEvenement,T1.Categorie) in
                                    (SELECT T2.IdEvenement,T2.Categorie from Tournoi T2 where T2.IdTournoi=?)");
  
        $q_both->execute(array($IdTournoi));
        $res = array();
        $thisTournoi=null;
        $otherTournoi=null;
        foreach($q_both as $row){               //on est sur que pour un evenement et une catégorie, il y max deux tournois (principal & consultante)
            if($row['IdTournoi']==$IdTournoi)
                $thisTournoi= $row;
            else
                $otherTournoi= $row;
        }
        return json_encode(array('thisTournoi'=>$thisTournoi,'otherTournoi'=>$otherTournoi));
    }

    function createTournoiConsultante($pdo,$params){
        $listEquipe= $params['listEquipe'];

        try{   //je démarre une transaction
                
            $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
            $pdo->beginTransaction();
            
            
            $q_principal= $pdo->prepare("SELECT Categorie,IdEvenement from Tournoi where IdTournoi=? ;");
            $q_principal->execute(array($listEquipe[0]['IdTournoi']));
            $row= $q_principal->fetch();
            $Categorie= $row['Categorie'];
            $IdEvenement= $row['IdEvenement'];

            $q_tournoi_consultante= $pdo->prepare("INSERT into Tournoi values (null,?,'consultante',?) ;");
            $q_tournoi_consultante->execute(array($Categorie,$IdEvenement));

            $q_IdTournoi= $pdo->query('SELECT IdTournoi FROM Tournoi WHERE IdTournoi=LAST_INSERT_ID();');
            $IdTournoi= $q_IdTournoi->fetch()['IdTournoi'];

            foreach($listEquipe as $equipe){
                $q_equipe= $pdo->prepare("UPDATE Equipe SET IdTournoi=? where IdEquipe=?;");
                $q_equipe->execute(array($IdTournoi,$equipe['IdEquipe']));
            }
            
            $pdo->commit();
            return json_encode(array('message'=>"Le tournoi consultante a bien été créé ",'class'=>"succes"));

        }
        catch(PDOException $e){
            $pdo->rollBack();
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }
    
    function insertTerrain($pdo,$params){
        $q_terrain= $pdo->prepare("INSERT into Terrain values (null,?) ;");
        $good= $q_terrain->execute(array($params['TypeJeu']));
        if($good){
            return json_encode(array('message'=>"Le terrain a bien été ajouté ",'class'=>"succes"));
        }
        else{
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }

    function insertSport($pdo,$params){
        $TypeJeu= $params['TypeJeu'];
        $q_sport= $pdo->prepare("SELECT * from Sport where TypeJeu=?;");  //un seul encours, pas plus
        $q_sport->execute(array($TypeJeu));
        if($q_sport->rowCount()==1){
            return json_encode(array('message'=>"*Ce sport existe déjà",'class'=>"error"));
        }

        $q_sport_insert= $pdo->prepare("INSERT into Sport values (?) ;");
        $good= $q_sport_insert->execute(array($TypeJeu));
        if($good){
            return json_encode(array('message'=>"Le sport a bien été ajouté ",'class'=>"succes"));
        }
        else{
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }

    function getEventParam($pdo,$params){
        $q_event=$pdo->prepare('SELECT * from Evenement E join Tournoi T on T.IdEvenement=E.IdEvenement join Equipe Ep on
                                Ep.IdTournoi=T.IdTournoi where E.IdEvenement=?');
        $q_event->execute(array($params['IdEvenement']));
        $res = array();
        foreach($q_event as $row){
            $res[] = $row;
        }
        return json_encode($res);
    }

    function validerEquipe($pdo,$params){
        $IdEquipe= $params['IdEquipe'];
        $q_valide= $pdo->prepare("UPDATE Equipe SET InscriptionValidee=true where IdEquipe=?;");  //un seul encours, pas plus
        $good= $q_valide->execute(array($IdEquipe));

        if($good){
            return json_encode(array('message'=>"L'inscription de l'équipe a bien été validé ",'class'=>"succes"));
        }
        else{
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }

    function startEvent($pdo,$params){
        $IdEvenement= $params['IdEvenement'];
        try{   //je démarre une transaction
                
            $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
            $pdo->beginTransaction();
            
            
            $q_start= $pdo->prepare("UPDATE Evenement SET Statue='encours' where IdEvenement=?;");
            $q_start->execute(array($IdEvenement));

            $q_delete= $pdo->prepare("DELETE from Equipe where InscriptionValidee=false and IdTournoi in
                                        (SELECT IdTournoi from Tournoi where IdEvenement=?);");
            $q_delete->execute(array($IdEvenement));

            $q_tournoi= $pdo->prepare('SELECT * FROM Tournoi WHERE IdEvenement=?;');
            $q_tournoi->execute(array($IdEvenement));

            $listTournoi=array();
            foreach($q_tournoi as $row){
                $listTournoi[]= $row;
            }
            
            $pdo->commit();
            return json_encode(array('message'=>"L'événement a démarré ",'class'=>"succes",'listTournoi'=>$listTournoi));

        }
        catch(PDOException $e){
            $pdo->rollBack();
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }

    function getResultByIdTournoi($pdo,$params){
        $q_result= $pdo->prepare("SELECT E.IdEquipe,E.NomEquipe,E.NiveauEquipe,
                                    E.NomClub,E.IdTournoi,sum(NbMatch) as totalNbMatch,sum(NbSet) as totalNbSet,
                                    sum(NbPoint) as totalNbPoint from Tournoi Tn join Tour Tr on Tr.IdTournoi=Tn.IdTournoi join Poule P 
                                    on P.IdTour=Tr.IdTour join Joue J on J.IdPoule=P.IdPoule join Equipe E on E.IdEquipe=J.IdEquipe 
                                    where E.IdTournoi=? and E.InscriptionValidee=true and Tr.Statue<>'bientot' group by 
                                    E.IdEquipe,E.NomEquipe,E.NiveauEquipe,E.NomClub,E.IdTournoi 
                                    order by totalNbMatch DESC,totalNbSet DESC,totalNbPoint DESC;");
        $q_result->execute(array($params['IdTournoi']));

        $res = array();
        foreach($q_result as $row){
            $res[] = $row;
        }
        return json_encode($res);
        
    }

    function endEvent($pdo,$params){
        $q_end= $pdo->prepare("UPDATE Evenement SET Statue='termine' where IdEvenement=? ;");
        $good= $q_end->execute(array($params['IdEvenement']));
        if($good){
            return json_encode(array('message'=>"Le terrain a bien été ajouté ",'class'=>"succes"));
        }
        else{
            return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
        }
    }

    // function getResultByIdTournoi($pdo,$params){
    //     $q_result= $pdo->prepare("SELECT Tr.IdTour,Tr.NomTour,Tr.NumTour,Tr.Statue,E.IdEquipe,E.NomEquipe,E.NiveauEquipe,
    //                                 E.NomClub,E.IdTournoi,sum(NbMatch) as totalNbMatch,sum(NbSet) as totalNbSet,
    //                                 sum(NbPoint) as totalNbPoint from Tournoi Tn join Tour Tr on Tr.IdTournoi=Tn.IdTournoi join Poule P 
    //                                 on P.IdTour=Tr.IdTour join Joue J on J.IdPoule=P.IdPoule join Equipe E on E.IdEquipe=J.IdEquipe 
    //                                 where E.IdTournoi=? and E.InscriptionValidee=true and Tr.Statue<>'bientot' group by 
    //                                 Tr.IdTour,Tr.NomTour,Tr.NumTour,Tr.Statue,E.IdEquipe,E.NomEquipe,E.NiveauEquipe,E.NomClub,E.IdTournoi 
    //                                 order by Tr.NumTour DESC,totalNbMatch DESC,totalNbSet DESC,totalNbPoint DESC;");
    //     $q_result->execute(array($params['IdTournoi']));

    //     $res = array();
    //     foreach($q_result as $row){
    //         $res[] = $row;
    //     }
    //     return json_encode($res);
        
    // }

// return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error"));
// return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
?>