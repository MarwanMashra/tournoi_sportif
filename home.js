$( document ).ready(function() { //
    addSearchByPeriod();
    myAjax('getAllEvents',{},(data)=>{
        $.each(data,(index,row)=>{
            console.log(row['DateEvenement'] + row['LieuEvenement']);
            
        });
    });

});



function addSearchByPeriod(){
    let date= getTime();
    var start = moment().subtract(1, 'days');
    var end = moment();
    let html=`
        <div>
            <kdbs
            >><
        </div>
    
    `;
    let html=`
        <div id="daterange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 70%">
            <i class="fa fa-caret-down"></i>
            &nbsp&nbsp;<span></span>&nbsp&nbsp;
            <i class="fa fa-calendar"></i>
        </div>
    `;
    $('body').append(html);

    function writeDate(start,end){
        $('#daterange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
    }

    function cb(start, end) {
        
        writeDate(start,end);
        console.log("start: "+start+"\nend: "+end);
        
    }
    var ranges={
        'Aujourd\'hui': [moment().startOf('day'), moment().endOf('day')],
        'Hier': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Cette semaine': [moment().startOf('week'), moment().endOf('week')],
        'La semaine dernière': [moment().subtract(1,'week').startOf('week'), moment().subtract(1,'month').endOf('month')],
        'Ce mois': [moment().startOf('month'), moment().endOf('month')],
        'Le mois dernier': [moment().subtract(1,'month').startOf('month'), moment().subtract(1,'month').endOf('month')],
        'Les 6 derniers mois': [moment().subtract(5,'month'), moment()],
    }

    
    $('#daterange').daterangepicker({
        startDate :moment().subtract(-1,'day'),
        endDate:moment().subtract(-1,'day'),
        applyButtonClasses: 'applyButton date-range-button',
        cancelButtonClasses: 'calcelButton date-range-button',
        ranges: ranges ,
        "locale": {
            "format": "DD / MM / YYYY",
            "separator": " - ",
            "applyLabel": "Chercher >>",
            "cancelLabel": "Annuler",
            "fromLabel": "De",
            "toLabel": "À",
            "customRangeLabel": "Personnalisé",
            "weekLabel": "Semaine",
            "daysOfWeek": [
                "LUN.",
                "MAR.",
                "MER.",
                "JEU.",
                "VEN.",
                "SAM.",
                "DIM."
            ],
            "monthNames": [
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre"
            ],
            "firstDay": 0
        },
    }, cb);

    cb(start, end); 

    $('.applyButton').click(function(){
        // form.removeForm();
    });                        

}

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
