$( document ).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const IdEvenement = urlParams.get('id');
    myAjax('getEventParam',{'IdEvenement':IdEvenement},(data)=>{
        console.log(data);
        $('body').append(`<h1>Paramètres de l'événement ${data[0]['NomEvenement']}</h1>`);
        $('body').append(`<div id="equipe-container"></div>`);
        showEquipe(data);
        if(data[0]['Statue']=="encours"){
            startEvent(data);
        }
        else{
            $('body').append(`<button id="start-event">Démarrer l'événement</button>`);
            $('#start-event').click(()=>{
                startEvent(data);
            });
        }
        
    });
   
}); 

function showEquipe(listEquipe){
    let html=`
        <div id="equipe-container">
    `;

    $.each(listEquipe, (index,equipe)=>{
        html+=`
            <div class="equipe">
                ${equipe['NomEquipe']}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
        `;
        if(equipe['InscriptionValidee']=="1"){
            html+=`
                <i>Déjà validé</i>
            `;
        }
        else{
            html+=`
                <button class="valider-equipe" id="${equipe['IdEquipe']}">Valider</button>
            `;
        }
    });

    html+=`
        </div>
    `;

    $('#equipe-container').replaceWith(html);
    $(".valider-equipe").click(function(){
        validerEquipe(this.id);
    });

}

function validerEquipe(IdEquipe){
    myAjax('validerEquipe',{'IdEquipe':IdEquipe},(response)=>{
        if(response['class']=='succes'){
            location.reload();
        }
        else{
            $('body').append(`<p>${response['message']}<p>`);
            console.log(response['error']);
            console.log(response['trace']);

        }
    });
}

function startEvent(data){
    myAjax('startEvent',{'IdEvenement':data[0]['IdEvenement']},(response)=>{
        if(response['class']=='succes'){
            $('#equipe-container').remove();
            $('#start-event').remove();
            let html=`
                <div id="tournoi-container">
            `;
            $.each(response['listTournoi'], (index,tournoi)=>{
                html+=`
                    <p>
                        <b>${tournoi['Categorie']}</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                        <a href="page_editer.php?id=${tournoi['IdTournoi']}"><button >Editer</button></a>

                    </p>
                `;
            });
            html+=`
                <button id="end-event">Terminer l'événement</button>
                <a href="javascript:window.open('','_self').close();"><button>revenir vers la page d'accueil</button></a>
                </div>
            `;
            $('body').append(html);
            $('#end-event').click(()=>{
                myAjax('endEvent',{'IdEvenement':data[0]['IdEvenement']},(data)=>{
                    if(response['class']=='succes'){
                        window.open('','_self').close();
                    }
                    else{
                        $('body').append(`<p>${response['message']}<p>`);
                        console.log(response['error']);
                        console.log(response['trace']);
            
                    }
                });
            });
        }
        else{
            $('body').append(`<p>${response['message']}<p>`);
            console.log(response['error']);
            console.log(response['trace']);

        }
    });
}