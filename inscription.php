<?php
    session_start();

    if(! isset($_POST['login'])){

        //ce inputs ont déjà 'required' mais je fais une vérification pour plus de sécurité
        if(isset($_POST['pseudo'])&&isset($_POST['nom'])&&isset($_POST['prenom'])&&isset($_POST['password'])&&isset($_POST['password_confirm'])){  
            include 'pdo.php';
            
            $pseudo= $_POST['pseudo'];
            $nom= $_POST['nom'];
            $prenom= $_POST['prenom'];
            $password= $_POST['password'];
            $password_confirm= $_POST['password_confirm'];


            $q_pseudo= $pdo->prepare('SELECT * from Organisateur where Pseudo=? ;');
            $q_pseudo->execute(array($pseudo));

            if($q_pseudo->rowCount()==1){
                $_SESSION['message']=array('text'=>"Ce pseudo est déjà utilisé",'class'=>"error");
                header('Location:page_inscription.php');  
            }

            else if($password != $password_confirm){
                $_SESSION['message']=array('text'=>"Les deux mots de passe sont différentes",'class'=>"error");
                header('Location:page_inscription.php');  
            }

            else{
                $q_pseudo= $pdo->prepare('INSERT into Organisateur values (?,?,?,?) ;');
                $q_pseudo->execute(array($pseudo,$nom,$prenom,sha1($password)));

                $_SESSION['message']=array('text'=>"Le compte a été bien ajouté",'class'=>"succes");
                header('Location:page_inscription.php');  
            }

            

        }


    }else header('Location:connexion.php');

?>