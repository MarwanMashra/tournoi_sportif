
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

function getTime(){
    let dico={}
    let date= new Date();
    dico['year']= date.getFullYear();
    dico['month']= timeFormat(date.getMonth()+1);
    dico['day']= timeFormat(date.getDate());
    dico['hour']= timeFormat(date.getHours());
    dico['minute']= timeFormat(date.getMinutes());
    dico['second']= timeFormat(date.getSeconds());
    return dico;
}
function timeFormat(time){
    if(time<10)
        time="0"+time;
    return time;
}

function getHour(time){
    return `${timeFormat(time['hour'])}h${timeFormat(time['minute'])}`;
}

function getDate(time){
    return date= timeFormat(time['day']) +' '+ monthToString(time['month'])+' '+time['year'];
    
}

function monthToString(month){
    let str;
    switch (month){
        case 1: str="Janvier"; break;
        case 2: str="Février"; break;
        case 3: str="Mars"; break;
        case 4: str="Avril"; break;
        case 5: str="Mai"; break;
        case 6: str="Juin"; break;
        case 7: str="Juillet"; break;
        case 8: str="Août"; break;
        case 9: str="Septembre"; break;
        case 10: str="Octobre"; break;
        case 11: str="Octobre"; break;
        case 12: str="Décembre"; break;
        default: str='None';
    }

    return str;
}


function printError(error){    //afficher la page d'erreur 
		
    console.error("status: "+error['status']+"\nstatusText: "+error['statusText']);
    $('body').replaceWith(error['responseText']);
    
}