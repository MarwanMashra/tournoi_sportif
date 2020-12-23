<?php
    $dsn= "mysql:host=localhost;dbname=BDH;charset=utf8";
    $username= "root";
    $password = "";

    try{
        $pdo = new PDO($dsn,$username,$password);
    }
    catch(PDOException $e){
       die('ERROR: '.$e->getMessage());
    }

?>