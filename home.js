$( document ).ready(function() {
    
    $.ajax({
        url: 'functions.php',
        type: 'POST',
        dataType:'json',
        data: {
            'function':'getAllEvents',
            'params':{
                'x':5,
                'y':5
            }
        },
        success: function(data)
        {
            // console.log(data);
            $.each(data,(index,row)=>{
                console.log(row['DateEvenement'] + row['LieuEvenement']);
            });
        },
        error: printError
    });
});




function printError(error){    //afficher la page d'erreur 
		
		console.error("status: "+error['status']+"\nstatusText: "+error['statusText']);
		$('body').replaceWith(error['responseText']);
		
    }