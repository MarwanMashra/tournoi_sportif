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
        $etat=$params['etat'];

        $pret_event= "SELECT E.IdEvenement from Evenement E where not exists (SELECT * from Tournoi Tn where exists (SELECT * from Tour Tr where Tn.IdEvenement=E.IdEvenement and Tn.IdTournoi=Tr.IdTournoi and Etat<>'pret'))";
        $encours_event= "SELECT E.IdEvenement from Evenement E where exists (SELECT * from Tournoi Tn where exists (SELECT * from Tour Tr where Tn.IdEvenement=E.IdEvenement and Tn.IdTournoi=Tr.IdTournoi and Etat<>'encours'))";
        $termine_event= "SELECT E.IdEvenement from Evenement E where not exists (SELECT * from Tournoi Tn where exists (SELECT * from Tour Tr where Tn.IdEvenement=E.IdEvenement and Tn.IdTournoi=Tr.IdTournoi and Etat<>'termine'))";

        $q="SELECT * from Evenement where DateEvenement>=:startDate and DateEvenement<=:endDate";
        $listParams= array('startDate'=>$startDate,'endDate'=>$endDate);
        if($sport!="all"){
            $q.=" and TypeJeu=:sport";
            $listParams['sport']=$sport;
        }
        $q.=" order by DateEvenement,NomEvenement";
        $q_events= $pdo->prepare($q);
        
        $q_events->execute($listParams);
        $res = array();
        foreach($q_events as $row){
            
            $row['Tournoi']=array();
            $q_tournoi= $pdo->prepare('SELECT * from Tournoi where IdEvenement=?');
            $q_tournoi->execute(array($row['IdEvenement']));
            foreach($q_tournoi as $tournoi){        
                $row['Tournoi'][]= $tournoi;
            }

            $q_pret_event=$pdo->prepare("SELECT * from Evenement where IdEvenement=? and IdEvenement in (".$pret_event.")");
            $q_pret_event->execute(array($row['IdEvenement']));
            $q_encours_event=$pdo->prepare("SELECT * from Evenement where IdEvenement=? and IdEvenement in (".$encours_event.")");
            $q_encours_event->execute(array($row['IdEvenement']));
            $q_termine_event=$pdo->prepare("SELECT * from Evenement where IdEvenement=? and IdEvenement in (".$termine_event.")");
            $q_termine_event->execute(array($row['IdEvenement']));
            if($q_pret_event->rowCount()==1){
                $row['Etat']='pret';
            }else if($q_encours_event->rowCount()==1){
                $row['Etat']='encours';
            }else if($q_termine_event->rowCount()==1){
                $row['Etat']='termine';
            }else{
                $row['Etat']='inconnu';
            }

            if($etat=='all' || $etat==$row['Etat'])
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

        

    }

?>