$( document ).ready(function() {
    
    myAjax('getAllEvents',{},(data)=>{
        $.each(data,(index,row)=>{
            console.log(row['DateEvenement'] + row['LieuEvenement']);
            
        });
    });

});

function myAjax(nomFonction,params,successFonction){
    params['__x__']=0;
    $.ajax({
        url: 'functions.php',
        type: 'POST',
        dataType:'json',
        data: {
            'function':nomFonction,
            'params':params
        },
        success: successFonction,
        error: printError
    });
}

function printError(error){    //afficher la page d'erreur 
		
    console.error("status: "+error['status']+"\nstatusText: "+error['statusText']);
    $('body').replaceWith(error['responseText']);
    
}
