<?php
	ini_set('display_errors',1);
	error_reporting(E_ALL);
	session_start();
	
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>projet</title>
	<meta charset="utf-8">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link href="daterangepicker.css" rel="stylesheet" type="text/css" />

</head>
<body>
      <h1> Home </h1>

		<?php
			if(isset($_SESSION['login'])){
				echo "<a href='deconnexion.php'><button>Deconnexion</button></a>";
				echo "<a href='page_inscription.php'><button>ajouter unn compte</button></a>";
			}else{
				echo "<a href='page_connexion.php'><button>Connexion</button></a>";
			}
		?>
	  
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
	  	<script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
      	<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
	  	<script src="home.js"></script>
</body>
</html>
