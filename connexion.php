<?php
	session_start();

    if(! isset($_SESSION['login'])){

        if(isset($_POST['pseudo']) && isset($_POST['password'])){  //ce inputs ont déjà 'required' mais je fais une vérification pour plus de sécurité
            include 'pdo.php';
            
            $pseudo= $_POST['pseudo'];
            $password= $_POST['password'];
            
            $q_pseudo= $pdo->prepare('SELECT * from Organisateur where Pseudo=? ;');
            $q_pseudo->execute(array($pseudo));

            if($q_pseudo->rowCount()==1){
                $admin= $q_pseudo->fetch();

                if(sha1($password)==$admin['Mdp']){
                    $_SESSION['login']= array('pseudo'=>$admin['Pseudo'],'nom'=>$admin['NomOrganisateur'],'prenom'=>$admin['PrenomOrganisateur']);
                    unset($_SESSION['message']);
                    header('Location:page_home.php');

                }else {  //mot de passe incorrect
                    $_SESSION['message']=array('text'=>"Le mot de passe est incorrect",'class'=>"error");
                    header('Location:page_connexion.php');  
                }

            }else {   //pseudo incorrect
                $_SESSION['message']=array('class'=>"error",'text'=>"Ce compte n'existe pas");
                header('Location:page_connexion.php'); 
            }

        }
    }else header('Location:page_home.php');

?>