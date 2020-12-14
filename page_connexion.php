<?php
      ini_set('display_errors',1);
      error_reporting(E_ALL);
      session_start();
      if(isset($_SESSION['login'])){
            header('Location:page_home.php');
      }
      if(isset($_SESSION['message'])){
            $message= $_SESSION['message'];
      }
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>projet</title>
	<meta charset="utf-8">

	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      <link rel="stylesheet" type="text/css" href="auth.css">
    <!-- <link rel="icon" href="{{url_for('static', filename = 'src/icons/home.png')}}" /> -->

</head>
<body>
      <div class="header">
            <div class="inner-header flex">
                  <div class="container">
                  
                        <div class="row justify-content-center">
                                    <div class="subcontainer subcontainer-connexion" >
                                          <form action="connexion.php" method="post" class="form" id="formId">
                                                <h3 class="text-center" >Connexion</h3>
                                                
                                                <div class="row">
                                                      <label for="pseudo" class="label col-md-4 col-lg-4 col-sm-4 col-xs-4 " >Pseudo</label>
                                                      <div class="col-md-8 col-lg-8 col-sm-8 col-xs-8">
                                                            <input type="text" name="pseudo" id="pseudo" class="form-control" placeholder="Pseudo" autocomplete="off" required>
                                                      </div>
                                                </div>

                                          <div class="row">
                                                      <label for="password" class="label col-md-4 col-lg-4 col-sm-4 col-xs-4 ">Mot de passe</label>
                                                      <div class="col-md-8 col-lg-8 col-sm-8 col-xs-8">
                                                            <input type="password" name="password" id="password" class="form-control" placeholder="Mot de passe" required>
                                                      </div>
                                                </div>

                              
                                                <button class="btn btn-info" type="submit" form="formId" value="Submit">Se connecter</button>
                                                <?php
                                                      if(isset($message)){
                                                            echo "<br><span class='${message['class']}'>*${message['text']}</span>";
                                                      }
                                                ?>

                                    </form>
                              </div>
                        </div>
                  </div>
            </div>
    
        
        </div>
        
            
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

</body>
</html>
