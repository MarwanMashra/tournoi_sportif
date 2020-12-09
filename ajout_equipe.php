<?php
    session_start();
    $idTournoi= 1; // faudra récup idTournoi actuelle avec celui de form_equipe.Js aussi
    require("pdo.php");
    if(! isset($_POST['login']))
    {

        //ce inputs ont déjà 'required' mais je fais une vérification pour plus de sécurité
        //on récupère le Type de sport
        $q_sport=$pdo->prepare('SELECT TypeJeu,NbJoueur from Tournoi T,Evenement E where T.IdEvenement=E.IdEvenement and IdTournoi=?');
        $q_sport->execute(array($idTournoi));
        $row= $q_sport->fetch();
        $sport = $row['TypeJeu'];
        $nbJoueur =  $row['NbJoueur'];
        $fullEquipe=True;

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
            // $nomClub= $_POST['nomClub'];                          
            $Joueurs = array();
            // $NiveauJoueur=array();
            $somNiveauJoueur=0;
            for ($i=1; $i <= $nbJoueur ; $i++)
            { 
                $Joueurs[]= array('nomJoueur'=>$_POST['nomJoueur'.$i],'prenomJoueur'=>$_POST['prenomJoueur'.$i],'nvJoueur'=>$_POST['nvJoueur'.$i]);
                $somNiveauJoueur+=transformeNv($_POST['nvJoueur'.$i]);
            }

            $somNiveauJoueur=divUp($somNiveauJoueur,$nbJoueur);
            //on récupère la moyenne de l'équipe
            // $AvgNvJoueur=0;
            // for ($i=0; $i <count($NiveauJoueur); $i++) 
            // { 
            //     $AvgNvJoueur+=$NiveauJoueur[$i];
            // }
            // $AvgNvJoueur=intdiv($AvgNvJoueur,$nbJoueur);

            // $AvgNvJoueur=transformeNv($AvgNvJoueur);
             
 

            $q_nomEquipe= $pdo->prepare('SELECT * from Equipe where NomEquipe=? ;');
            $q_nomEquipe->execute(array($nomEquipe));

            if($q_nomEquipe->rowCount()==1)
            {
                $_SESSION['message']=array('text'=>"Ce nom d'équipe est déjà utilisé",'class'=>"error");
                header('Location:formulaire_equipe.php');  
            }else 
            {   
                $q_Equipe= $pdo->prepare('INSERT into Equipe values (?,?,?,?);');
                // $q_Equipe->execute(array('Barca',3,'monClub','Football'));


                
                if ($_POST['nomClub']!='')
                {                        
                    $q_Equipe->execute(array($nomEquipe,$somNiveauJoueur,$_POST['nomClub'],$sport));
                    // echo "il y a un nom de club";
                    // echo $_POST['nomClub'];
                }else 
                {
                    $q_Equipe->execute(array($nomEquipe,$somNiveauJoueur,'NULL',$sport));
                // echo "pas de club";
                // echo $_POST['nomClub'];
                }

                $q_Joueur= $pdo->prepare('INSERT into Joueur values (?,?,?,?,?);');
                $q_Joueur->execute(array('2','HERMET','Quentin','Pro','OM'));
                // for ($i=1; $i <=$nbJoueur; $i++)
                // { 
                //     $q_Joueur->execute(array('NULL',$Joueurs[$i]['nomJoueur'],$Joueurs[$i]['prenomJoueur'],$Joueurs[$i]['nvJoueur'],$nomEquipe));
                //     echo $Joueurs['nomJoueur'.$i];
                //     echo $Joueurs['prenomJoueur'.$i];
                //     echo $Joueurs['nvJoueur'.$i];
                // }
                $_SESSION['message']=array('text'=>"L'équipe a été bien ajouté",'class'=>"succes");
                    header('Location:formulaire_equipe.php');
            }
        }

    }else header('Location:formulaire_equipe.php');

    function divUp($a,$b){
        if ($a%$b!=0) {
            return intdiv($a, $b)+1;
        }else return intdiv($a, $b);
    }

    function transformeNv($var)
    {
        // if (is_string($var)) 
        // {
        
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
        // }else if(is_int($var)){
        //     switch ($var) 
        //     {
        //         case 1:
        //             return 'Pro';
        //             break;
        //         case 2:
        //             return 'Semi-Pro';
        //             break;
        //         case 3:
        //             return 'Amateur';
        //         break;
        //         case 4:
        //             return 'Débutant';
        //         break;
        //         case 5:
        //             return 'Jeune';
        //         break;
        //         default:
        //             return 0;
        //             break;
        //     }
        // }
        // else return null;
    }
?>