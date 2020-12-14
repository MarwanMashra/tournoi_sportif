<?php
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    session_start();
    
    include 'pdo.php';
    if (isset($_POST['function']) && $_POST['function'] != '')
    {   
        echo $_POST['function']($pdo,$_POST['params']);
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
     
        $q="SELECT * from Evenement where DateEvenement>=:startDate and DateEvenement<=:endDate";
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
            
                $q_event= $pdo->prepare('INSERT into Evenement values (null,:nomE,:lieuE,:dateE,:sport,:nbJ,:pseudo,null);');
                $data=array('nomE'=>$NomEvenement,'lieuE'=>$LieuEvenement,'dateE'=>$DateEvenement,'sport'=>$TypeJeu,'nbJ'=>$NbJoueur,'pseudo'=>$pseudo);
                $q_event->execute($data);
                

                $q_IdEvenement= $pdo->query('SELECT IdEvenement FROM Evenement WHERE IdEvenement=LAST_INSERT_ID();');
                $IdEvenement= $q_IdEvenement->fetch()['IdEvenement'];

                $q_tournoi= $pdo->prepare('INSERT into Tournoi values (null,:categorie,:IdEvenement);');
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
            return json_encode($res);
        }


        //cas 2
        $q_tour_bientot= $pdo->prepare("SELECT * from Tour T1 where T1.IdTournoi=? and T1.Statue='bientot' and 
                                        T1.NumTour=(SELECT min(NumTour) from Tour T2 where T2.IdTournoi=T1.IdTournoi 
                                        and T2.Statue='bientot' );");  
        $q_tour_bientot->execute(array($params['idTournoi']));
        if($q_tour_bientot->rowCount()==1){
            $res['tour']=$q_tour_bientot->fetch();
        }

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
        if(!$nomPouleVide && count($listPoule)>1){
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
                return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
            }
        }      
    }

    function getResultByIdTournoi($pdo,$params){
        $q_result= $pdo->prepare('SELECT * from Tour T join Poule P on P.IdTour=T.IdTour join Joue J on J.IdPoule=P.IdPoule
                                join Equipe E on E.IdEquipe=J.IdEquipe where T.IdTour=? order by P.IdPoule,J.NbMatch DESC,J.NbSet DESC,J.NbPoint DESC;');
        $q_result->execute(array($params['IdTour']));

        $res = array();
        foreach($q_result as $row){
            $res[] = $row;
        }
        return json_encode($res);
        
    }
// return json_encode(array('message'=>"Un problàme s'est prooduit",'class'=>"error",'error'=>$e->getMessage(),'trace'=>$e->getTrace()));
?>