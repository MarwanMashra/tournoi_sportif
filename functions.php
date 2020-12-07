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
        
        $q_events= $pdo->query('select * from evenement;');
        
        $res = array();
        foreach($q_events as $row){
            $res[] = $row;
        }
        return json_encode($res);
    }

?>