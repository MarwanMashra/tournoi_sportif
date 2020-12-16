$( document ).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const IdTournoi = urlParams.get('id');

    var idTournoiPrincipal=null;
    var idTournoiConsultante=null;

    myAjax('CheckTypeTournoi',{'idTournoi':IdTournoi},(Tournois)=>{
        if(Tournois['thisTournoi']['TypeTournoi']=='principal'){
            idTournoiPrincipal= Tournois['thisTournoi']['IdTournoi'];
            if(Tournois['otherTournoi']!=null){
                idTournoiConsultante= Tournois['otherTournoi']['IdTournoi'];
            }
        }
        else{
            idTournoiConsultante= Tournois['thisTournoi']['IdTournoi'];
            idTournoiPrincipal= Tournois['otherTournoi']['IdTournoi'];
            
        }

        myAjax('getResultByIdTournoi',{'IdTournoi':idTournoiPrincipal},(dataPrincipal)=>{ 
            if(idTournoiConsultante!=null){
                myAjax('getResultByIdTournoi',{'IdTournoi':idTournoiConsultante},(dataConsultante)=>{
                    $('body').append(`<h2>Classement tournoi principal</h2>`);
                    $('body').append(genTabResult(dataPrincipal));
                    $('body').append(`<h2>Classement tournoi consultant</h2>`);
                    $('body').append(genTabResult(dataConsultante));
                   
            
                });
            }
            else{
                $('body').append(`<h2>Classement tournoi</h2>`);
                    $('body').append(genTabResult(dataPrincipal));
            }
    
        });
    });
   
}); 

function genTabResult(listResultEquipe){
    html=`
        <table class="result-table">
            <thead>
                <tr>
                    <th>Equipe</th>
                    <th>Nombre de match gagné</th>
                    <th>Nombre de set</th>
                    <th>Nombre de point</th>
                </tr>
            </thead>
            <tbody>
    `;
    $.each(listResultEquipe, (index,resultEquipe)=>{
        html+=`
            <tr>
                <td>
                    ${resultEquipe['NomEquipe']}
                </td>
                <td id="NbMatch-${resultEquipe['IdEquipe']}">
                    ${resultEquipe['totalNbMatch']}
                </td>
                <td id="NbSet-${resultEquipe['IdEquipe']}">
                    ${resultEquipe['totalNbSet']}
                </td>
                <td id="NbPoint-${resultEquipe['IdEquipe']}">
                    ${resultEquipe['totalNbPoint']}
                </td>

            </tr>
        `;
    });
    html+=`
            </tbody>
        </table>
    `;
    return html;

}

 // dicEquipe={};
        // $.each(data, (index,result)=>{
        //     if(dicEquipe.hasOwnProperty(result['IdEquipe'])){
        //         dicEquipe[result['IdEquipe']]['totalNbMatch']+=parseInt(result['totalNbMatch']);
        //         dicEquipe[result['IdEquipe']]['totalNbSet']+=parseInt(result['totalNbSet']);
        //         dicEquipe[result['IdEquipe']]['totalNbPoint']+=parseInt(result['totalNbPoint']);
        //     }
        //     else{
        //         dicEquipe[result['IdEquipe']]=result;
        //         dicEquipe[result['IdEquipe']]['totalNbMatch']=parseInt(dicEquipe[result['IdEquipe']]['totalNbMatch']);
        //         dicEquipe[result['IdEquipe']]['totalNbSet']=parseInt(dicEquipe[result['IdEquipe']]['totalNbSet']);
        //         dicEquipe[result['IdEquipe']]['totalNbPoint']=parseInt(dicEquipe[result['IdEquipe']]['totalNbPoint']);
        //     }
        // });
        // console.log(dicEquipe);