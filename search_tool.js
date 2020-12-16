var login=null;
function addSearchByPeriod(){
    myAjax('getSession',{},(session)=>{
        login= session['login'];
        let html=`
            <div id="search-box">
                <div id="daterange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 70%">
                    <i class="fa fa-caret-down"></i>
                    &nbsp&nbsp;<span></span>&nbsp&nbsp;
                    <i class="fa fa-calendar"></i>
                </div>      
    
        `;
        myAjax('getAllSports',{},(sports)=>{
    
            html+=`
                <label for="sport-select">Sport:</label>
                <select name="sport" id="sport-select">
                <option value="all">Tous</option>
            `;
            $.each(sports,(index,sport)=>{
                html+=`
                    <option value="${sport}">${sport}</option>
                `;
            });
            html+=`
                </select>
                <label for="statue-select">Statue:</label>
                <select name="statue" id="statue-select">
                <option value="all">Tous</option>
            `;
    
            $.each(listStatue,(index,statue)=>{
                html+=`
                    <option value="${statue}">${statue}</option>
                `;
            });
            html+=`</select></div> `;
            $('body').append(html);
    
            function writeDate(start,end){
                $('#daterange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
            }
        
            function cb(start, end) {
                writeDate(start,end);
                myAjax('searchEvents',{
                    'start':start.format('YYYY-MM-DD'),
                    'end':end.format('YYYY-MM-DD'),
                    'sport': $('#sport-select').val(),
                    'statue':$('#statue-select').val()
                },displayEvents);
                
            }
            var ranges={
                'Aujourd\'hui': [moment(),moment()],
                'Demain': [moment().add(1, 'days'), moment().add(1, 'days')],
                'Cette semaine': [moment().startOf('week'), moment().endOf('week')],
                'La semaine prochaine': [moment().add(1,'week').startOf('week'), moment().add(1,'week').endOf('week')],
                'Ce mois': [moment().startOf('month'), moment().endOf('month')],
                'Le mois prochain': [moment().add(1,'month').startOf('month'), moment().add(1,'month').endOf('month')]
            }
            let thisYear='En '+moment().year();
            ranges[thisYear]=[moment().startOf('year'), moment().endOf('year')];
            
            $('#daterange').daterangepicker({
                startDate :moment(),
                endDate:moment(),
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
        
            cb(moment(), moment()); 
        
            $('.applyButton').click(function(){
                // form.removeForm();
            });          
        });
            
    });
  
                   
}

function displayEvents(listEvents){

    let Events={};
    $.each(listEvents, (index,result)=>{         //on va grouper par l'id des evenements
        // console.log(result);
        if(Events.hasOwnProperty(result['IdEvenement'])){
            Events[result['IdEvenement']].push(result);
        }
        else{
            Events[result['IdEvenement']]=[];
            Events[result['IdEvenement']].push(result);
        }

    });
    console.log(Events);

        
    html=`<div id="events-container">`;
    
    $.each(Events,(IdEvenement,listTournoi)=>{
        buttonDemarer="";
        if(login!=null && listTournoi[0]['Statue']!="termine"){
            buttonDemarer=`<a href="page_event.php?id=${listTournoi[0]['IdEvenement']}" target="_blank"><button>Paramètres</button></a>`;
        }
        
        html+=`
            <div class="event">
                    <b>${listTournoi[0]['NomEvenement']}</b> &nbsp&nbsp&nbsp&nbsp
                    ${buttonDemarer}
                    <br>${getStatueDesc(listTournoi[0]['Statue'])}
                    <br>Lieu: ${listTournoi[0]['LieuEvenement']}
                    <br>Date: ${listTournoi[0]['DateEvenement']}
                    <br>Jeu: ${listTournoi[0]['TypeJeu']}
                    

                <div class="accordion">
        `;
        $.each(listTournoi,(index,tournoi)=>{
            console.log(tournoi)
            buttonEditer="";
            if(login!=null) {
                buttonEditer=`<a href="page_editer.php?id=${tournoi['IdTournoi']}" target="_blank"><button >Editer</button></a>`; 
            }
            buttonResult="";
            if(listTournoi[0]['Statue']!="bientot"){
                buttonResult=`<a href="page_result.php?id=${tournoi['IdTournoi']}" target="_blank"><button>Résultats</button></a>`;
            }
            buttonInscription="";
            if(listTournoi[0]['Statue']=="bientot"){
                buttonInscription=`<a href="formulaire_equipe.php?id=${tournoi['IdTournoi']}" target="_blank"><button >S'inscrire</button></a>`;
            }
            
            html+=`
                <h3>Tournoi ${tournoi['Categorie']}</h3>
                <div>
                    Bonjoue, ceci est un tournoi 
                    <br>
                    ${buttonInscription}
                    ${buttonEditer}
                    ${buttonResult}
            `;
            
            html+=`
                </div>
            `;
        });
        html+=`</div></div>`;
    });
    html+=`</div>`;
    $('#events-container').replaceWith(html);
    $('.accordion').accordion({active: false,collapsible: true, heightStyle: 'content'});
}

function getStatueDesc(statue) {
    switch (statue) {
        case "bientot":
            return "Cet événement n'a pas encore commencé";
            break;
        case "encours":
            return "Cet événement est actuellement encours ";
            break;
        case "termine":
            return "Cet événement a déjà terminé ";
            break;
        default:
            return "";
            break;
    }
    
}