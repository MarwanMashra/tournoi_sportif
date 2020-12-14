
function addSearchByPeriod(){

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
                   
}

function displayEvents(listEvents){
    html=`<div id="events-container">`;
    $.each(listEvents,(index,event)=>{
        html+=`<p><b>${event['NomEvenement']}</b> (<i>${event['statue']}</i>)</p>`;
        console.log(event);
    });
    html+=`</div>`;
    $('#events-container').replaceWith(html);
}