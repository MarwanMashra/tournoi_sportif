var idTournoi;
var tour,lastTour;
var IdTour;
$( document ).ready(function() {

    /*
    si tour= null alors             // il faut créer un nouveau tour 
        si lastTour=null alors 
            c'est le premier tour du tournoi
        sinon 
            il faut chercher les résultats de l'ancien tour
    sinon 
        si tour[Statue]=encours alors
            il faut éditer les résultats du tour
        sinon 
            il faut juste choisir les équipes pour les poules

    */

    //il faut récupérer l'id de tournoi
    const urlParams = new URLSearchParams(window.location.search);
    const idT = urlParams.get('id');
    // document.location= "stats?id="+id;

    idTournoi= idT;
    myAjax('CheckTypeTournoi',{'idTournoi':idTournoi},(Tournois)=>{
        //vérifier s'il y a un autre tournoi (principal ou consultante)
        let button=``;
        let title=`
            <h1>
                Événement ${Tournois['thisTournoi']['NomEvenement']}:  
                tournoi ${Tournois['thisTournoi']['Categorie'].toLowerCase()}
        `;
        if(Tournois['otherTournoi']!=null){
            title+=` (<i>${Tournois['thisTournoi']['TypeTournoi']}</i>) `;
            button= `<a href="page_editer.php?id=${Tournois['otherTournoi']['IdTournoi']}"><button>Tournoi ${Tournois['otherTournoi']['TypeTournoi']}</button></a>`;
        }
        title+=`
            </h1>
            ${button}
            <a href="page_home.php"><button>Page d'accueil</button></a>
            <a href="page_event.php?id=${Tournois['thisTournoi']['IdEvenement']}"><button>Paramètres événement</button></a>
        `;
        $('body').append(title);

        myAjax('getDecisionTour',{'idTournoi':idTournoi},(data)=>{
            tour= data['tour'];
            lastTour= data['lastTour'];
            if(tour!=null){   //s'il y a déjà un tour actuel, il faut editer les résultats
                IdTour=tour['IdTour'];
                EditResultTour();
            }
            else if(lastTour!=null && lastTour['NomTour']=='Final'){       //le tournoi a terminé
                //il faut une redirection vers la page des résultats
                $('body').append('<h1>Le tournoi a terminé</h1>');   
                $('body').append(`<a href="page_result.php?id=${idTournoi}"><button>Regarder le classement</button></a>`);
            }
            else{              //il faut encore créer un tour
                let needConsultante= (Tournois['otherTournoi']==null);
                HandleTournoi(idTournoi,lastTour,needConsultante);
            }
        });
    });
    

});

function EditResultTour(){
    myAjax('getResultByIdTour',{'IdTour':IdTour},(listResult)=>{
        let listResultPoule={};
        $.each(listResult, (index,result)=>{         //on va grouper par l'id de poule
            // console.log(result);
            if(listResultPoule.hasOwnProperty(result['IdPoule'])){
                listResultPoule[result['IdPoule']].push(result);
            }
            else{
                listResultPoule[result['IdPoule']]=[];
                listResultPoule[result['IdPoule']].push(result);
            }

        });
        afficheResult(listResultPoule);

    });
}
function afficheResult(listResultPoule){
    html=`
        <h3>${tour['NomTour']}</h3>
        <table id="result-table">
            <thead>
                <tr>
                    <th>Poule</th>
                    <th>Equipe</th>
                    <th>Nombre de match gagné</th>
                    <th>Nombre de set</th>
                    <th>Nombre de point</th>
                    <th>Ajouter un résultat</th>
                </tr>
            </thead>
            <tbody>
    `;
    $.each(listResultPoule, (IdPoule,listResultEquipe)=>{  //id="${IdPoule}"
        nomPoule=`
            <td rowspan="${listResultEquipe.length}">${listResultEquipe[0]['NomPoule']}</td>
        `;
        $.each(listResultEquipe, (index,resultEquipe)=>{
            html+=`
                <tr>
            `;
            if(index==0)
                html+=nomPoule;
            html+=`
                    <td>
                        ${resultEquipe['NomEquipe']}
                    </td>
                    <td id="NbMatch-${resultEquipe['IdEquipe']}">
                        ${resultEquipe['NbMatch']}
                    </td>
                    <td id="NbSet-${resultEquipe['IdEquipe']}">
                        ${resultEquipe['NbSet']}
                    </td>
                    <td id="NbPoint-${resultEquipe['IdEquipe']}">
                        ${resultEquipe['NbPoint']}
                    </td>
                    <td>
                        <label for="select-vainqueur-${resultEquipe['IdEquipe']}"> est vainqueur ?</label>
                        <select id="select-vainqueur-${resultEquipe['IdEquipe']}" class="select-vainqueur">
                            <option value="0"> Non </option>
                            <option value="1"> Oui </option>
                        </select>
                        <label for="input-NbSet-${resultEquipe['IdEquipe']}"> Sets </label>
                        <input type="number" min="0" value="0" class="input-NbSet" id="input-NbSet-${resultEquipe['IdEquipe']}">
                        <label for="input-NbPoint-${resultEquipe['IdEquipe']}"> Points </label>
                        <input type="number" min="0" value="0" class="input-NbPoint" id="input-NbPoint-${resultEquipe['IdEquipe']}">
                        <input type="hidden" value="${resultEquipe['IdPoule']}" name="input-IdPoule-${resultEquipe['IdEquipe']}" id="input-IdPoule-${resultEquipe['IdEquipe']}">
                        <button id="${resultEquipe['IdEquipe']}" class="submit-result button">Valider</button>
                        <span class="error" id="error-${resultEquipe['IdEquipe']}"></span>
                    </td>

                </tr>
            `;
        });
    });
    html+=`
            </tbody>
        </table>
        <br>
        <button id="end-tour">Terminer le tour</button>
        <span class="error" id="error-end-tour"></span>

    `;

    $('body').append(html);
    $('.submit-result').click(updateResult);
    $('#end-tour').click(endTour);

}

function updateResult(){
    let IdEquipe=this.id;
    params={
        'NbSet': $(`#input-NbSet-${IdEquipe}`).val(),
        'NbPoint': $(`#input-NbPoint-${IdEquipe}`).val(),
        'vainqueur': $(`#select-vainqueur-${IdEquipe}`).val(),
        'IdPoule':$(`#input-IdPoule-${IdEquipe}`).val(),
        'IdEquipe':IdEquipe
    };
    console.log(params);
    myAjax('updateResult',params,(response)=>{
        if(response['class']=="succes"){
            $(`#error-${IdEquipe}`).text("");
            location.reload();
        }
        else{
            $(`#error-${IdEquipe}`).text(response['message']);
        }
    });
}

function endTour(){
    myAjax('endTour',{'IdTour':IdTour},(response)=>{
        if(response['class']=="succes"){
            $(`#error-end-tour`).text("");
            location.reload();
        }
        else{
            $(`#error-end-tour`).text(response['message']);
        }
    });
}
