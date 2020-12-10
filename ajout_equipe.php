<?php
    session_start();
    $IdTournoi= 1; // faudra récup IdTournoi actuelle avec celui de form_equipe.Js aussi
    require("pdo.php");


    //ce inputs ont déjà 'required' mais je fais une vérification pour plus de sécurité
    //on récupère le Type de sport
    $q_nbJoueur=$pdo->prepare('SELECT NbJoueur from Tournoi T,Evenement E where T.IdEvenement=E.IdEvenement and IdTournoi=?');
    $q_nbJoueur->execute(array($IdTournoi));
    $nbJoueur =  $q_nbJoueur->fetch()['NbJoueur'];
    $fullEquipe=True;

    for ($i=1; $i <= $nbJoueur ; $i++) 
    { 
        if (!(isset($_POST['nomJoueur'.$i])&&isset($_POST['prenomJoueur'.$i])&&isset($_POST['nvJoueur'.$i])))
        {
            $fullEquipe=False;
        }
    }
    if(isset($_POST['nomEquipe']) && $fullEquipe)//on vérifie pas le nom du club car not required mais faudra voir comment faire pour dire que c'est null
    {  
        
        
        $nomEquipe= $_POST['nomEquipe'];              
        $Joueurs = array();
        $somNiveauJoueur=0;
        for ($i=1; $i <= $nbJoueur ; $i++)
        { 
            $Joueurs[]= array('nomJoueur'=>$_POST['nomJoueur'.$i],'prenomJoueur'=>$_POST['prenomJoueur'.$i],'nvJoueur'=>$_POST['nvJoueur'.$i]);
            $somNiveauJoueur+=NiveauToInt($_POST['nvJoueur'.$i]);
        }

        //calculer le niveau d'équipe
        $somNiveauJoueur=divUp($somNiveauJoueur,$nbJoueur);


        //vérifier que le nom d'équipe est unique    
        $q_deja_inscrit= $pdo->prepare('SELECT * from Equipe where NomEquipe=? and IdTournoi=? ;');
        $q_deja_inscrit->execute(array($nomEquipe,$IdTournoi));

        if($q_deja_inscrit->rowCount()==1){
            $_SESSION['message']=array('text'=>"Cette équipe est déjà inscrit dans ce tournoi",'class'=>"error");
            header('Location:formulaire_equipe.php');
        }
        else{   
            try{   //je démarre une transaction
                
                $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
                $pdo->beginTransaction();


                $q_Equipe= $pdo->prepare('INSERT into Equipe values (null,?,?,?,?,false);');
                if ($_POST['nomClub']!='')
                {                        
                    $q_Equipe->execute(array($nomEquipe,$somNiveauJoueur,$_POST['nomClub'],$IdTournoi));

                }else 
                {
                    $q_Equipe->execute(array($nomEquipe,$somNiveauJoueur,'NULL',$sport));
                }

                $q_IdEquipe= $pdo->prepare('SELECT IdEquipe from Equipe where NomEquipe=? and IdTournoi=? ;');
                $q_IdEquipe->execute(array($nomEquipe,$IdTournoi));
                $IdEquipe= $q_IdEquipe->fetch()['IdEquipe'];

                $q_Joueur= $pdo->prepare('INSERT into Joueur values (null,?,?,?,?);');

                foreach($Joueurs as $Joueur){
                    $q_Joueur->execute(array($Joueur['nomJoueur'],$Joueur['prenomJoueur'],$Joueur['nvJoueur'],$IdEquipe));
                }
                 
                $_SESSION['message']=array('text'=>"L'équipe a été bien ajouté",'class'=>"succes");
                    header('Location:formulaire_equipe.php');
 
                $pdo->commit();
            }
            catch(PDOException $e){
                $pdo->rollBack();
                $_SESSION['message']=array('text'=>"Un problàme s'est prooduit",'class'=>"error");
                header('Location:formulaire_equipe.php');  
            }
            
        }
    }


    function divUp($a,$b){
        if ($a%$b!=0) {
            return intdiv($a, $b)+1;
        }else return intdiv($a, $b);
    }

    function NiveauToInt($var)
    {
        switch ($var) 
        {
            case 'Pro':
                return 1;
                break;
            case 'Elite':
                return 2;
                break;
            case 'régional':
                return 3;
                break;
            case 'départemental':
                return 4;
                break;
            case 'loisir':
                return 5;
                break;
            default:
                return 0;
                break;
        }

    }
?>