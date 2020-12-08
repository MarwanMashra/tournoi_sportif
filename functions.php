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

?>