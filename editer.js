var idTournoi;
var tour,lastTour;
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
    var idT=1;

    idTournoi= idT;
    myAjax('getDecisionTour',{'idTournoi':idTournoi},(data)=>{
        tour= data['tour'];
        lastTour= data['lastTour'];
        if(tour!=null && tour['Statue']=='encours'){   //il faut editer les résultats
            alert("c bon")
        }
        else{                          //il faut créer un tour
            let action;
            if(lastTour==null){        //c'est le premier tour
                action="Démarer";
            }
            else{                     //c'est pas le premier tour
                action="Suivant";
            }
            $('body').append(`<button id="tour-suivant">${action}</button>`);
            $('#tour-suivant').click(()=>{
                HandleTournoi(idTournoi,tour,lastTour);
            });
        }
    });

});