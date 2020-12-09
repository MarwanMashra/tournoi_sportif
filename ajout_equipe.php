<?php
    session_start();
    $idTournoi= 1; // faudra récup idTournoi actuelle avec celui de form_equipe.Js aussi
    require("pdo.php");
    if(! isset($_POST['login']))
    {

        //ce inputs ont déjà 'required' mais je fais une vérification pour plus de sécurité
        //on récupère le Type de sport
         $q_sport=$pdo->prepare('SELECT TypeJeu from Tournoi T,Evenement E where T.IdEvenement=E.IdEvenement and IdTournoi=?');
              $q_sport->execute(array($idTournoi));
            $sport = $q_sport->fetch()[TypeJeu];
        $fullEquipe=True;
        //on récupère le nbJoueur du tournoi
        $q_nbJoueur=$pdo->prepare('SELECT NbJoueur from Tournoi T,Evenement E where T.IdEvenement=E.IdEvenement and IdTournoi=?');
              $q_nbJoueur->execute(array($idTournoi));
            $nbJoueur = $q_nbJoueur->fetch()[NbJoueur];
        for ($i=1; $i <= $nbJoueur ; $i++) 
        { 
            if (!(isset($_POST['nomJoueur'.$i])&&isset($_POST['prenomJoueur'.$i])&&isset($_POST['nvJoueur'.$i])))
            {
                $fullEquipe=False;
            }
        }
        // echo $fullEquipe;
        if(isset($_POST['nomEquipe']) && $fullEquipe)//on vérifie pas le nom du club car not required mais faudra voir comment faire pour dire que c'est null
        {  
            
            
             $nomEquipe= $_POST['nomEquipe'];              
             $nomClub= $_POST['nomClub'];                          
             $Joueurs = array();
             $NiveauJoueur=array();
            for ($i=1; $i <= $nbJoueur ; $i++) 
            { 
                $Joueurs['nomJoueur'.$i] = $_POST['nomJoueur'.$i];
                $Joueurs['prenomJoueur'.$i] = $_POST['prenomJoueur'.$i];
                $Joueurs['nvJoueur'.$i] =$_POST['nvJoueur'.$i];
                $NiveauJoueur[] =transformeNv($_POST['nvJoueur'.$i]);
            }
            //on récupère la moyenne de l'équipe
            $AvgNvJoueur=0;
            for ($i=0; $i <count($NiveauJoueur); $i++) 
            { 
                $AvgNvJoueur+=$NiveauJoueur[$i];
            }
            $AvgNvJoueur=intdiv($AvgNvJoueur,$nbJoueur);

            $AvgNvJoueur=transformeNv($AvgNvJoueur);
 

           $q_nomEquipe= $pdo->prepare('SELECT * from Equipe where NomEquipe=? ;');
            $q_nomEquipe->execute(array($nomEquipe));

            if($q_nomEquipe->rowCount()==1)
            {
                 $_SESSION['message']=array('text'=>"Ce nom d'équipe est déjà utilisé",'class'=>"error");
                 header('Location:formulaire_equipe.php');  
            }else 
            {   
                $q_Equipe= $pdo->prepare('INSERT into Equipe values (?,?,?,?);');
                if ($_POST['nomClub']!='')
                {                        
                    $q_Equipe->execute(array($nomEquipe,$AvgNvJoueur,$_POST['nomClub'],$sport));
                    // echo "il y a un nom de club";
                    // echo $_POST['nomClub'];
                }else 
                {
                    $q_Equipe->execute(array($nomEquipe,$AvgNvJoueur,'NULL',$sport));
                // echo "pas de club";
                // echo $_POST['nomClub'];
                }
                
                for ($i=1; $i <=$nbJoueur; $i++) 
                { 
                    $q_Joueur= $pdo->prepare('INSERT into Joueur values (?,?,?,?,?);');
                    $q_Joueur->execute(array('NULL',$Joueurs['nomJoueur'.$i],$Joueurs['prenomJoueur'.$i],$Joueurs['nvJoueur'.$i],$nomEquipe));
                    echo $Joueurs['nomJoueur'.$i];
                    echo $Joueurs['prenomJoueur'.$i];
                    echo $Joueurs['nvJoueur'.$i];
                }
                $_SESSION['message']=array('text'=>"L'équipe a été bien ajouté",'class'=>"succes");
                    header('Location:formulaire_equipe.php');
            }
        }

            

        


    }else header('Location:formulaire_equipe.php');


    function transformeNv($var)
    {
        if (is_string($var)) 
        {
        
            switch ($var) 
            {
                case 'Pro':
                    return 1;
                    break;
                case 'Semi-Pro':
                    return 2;
                    break;
                case 'Amateur':
                    return 3;
                break;
                case 'Débutant':
                    return 4;
                break;
                case 'Jeune':
                    return 5;
                break;
                default:
                    return 0;
                    break;
            }
        }else if(is_int($var)){
            switch ($var) 
            {
                case 1:
                    return 'Pro';
                    break;
                case 2:
                    return 'Semi-Pro';
                    break;
                case 3:
                    return 'Amateur';
                break;
                case 4:
                    return 'Débutant';
                break;
                case 5:
                    return 'Jeune';
                break;
                default:
                    return 0;
                    break;
            }
        }
        else return null;
    }
?>