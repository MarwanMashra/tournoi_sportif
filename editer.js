$( document ).ready(function() {

    idTournoi=1;


    $('body').append(`<button id="tour-suivant">Suivant</button>`);


    $('#tour-suivant').click(()=>{
        myAjax('getEquipeByIdTournoi',{'idTournoi':idTournoi},(listEquipe)=>{
            myAjax('getLastTour',{'idTournoi':idTournoi},(data)=>{
                listEquipePoule=[];
                if(data['lastTour']==null){         // c le premier tour
                    // console.log("premier tour");
                    // console.log(listEquipe);
                    for(let i=1;i<=5;i++){
                        $.each(listEquipe, (index,equipe)=>{
                            if(equipe['NiveauEquipe']==i){
                                listEquipePoule.push(equipe);
                            }
                        });
                    }
                    console.log("Ceci est le premier tour");
                    console.log("Liste équipe classé par niveau");               
                    console.log(listEquipePoule);               

                }
                else{
                    if(false){   //c'était le demi final, donc mtn c le final 
                        console.log("pas le premier tour");
                    }
                    else{     //c pas encore le final
                        console.log("pas le premier tour");
                    }
                    
                     
                }                

                genAllCombPoule(listEquipePoule);

            });
        });
    });
  
});


function genAllCombPoule(listEquipePoule){

    listCombPoule=[];
    nbEquipe=listEquipePoule.length;
    console.log(`Il y a ${nbEquipe} équipes`);

    if(nbEquipe==4){
        listCombPoule.push([2,2]);
    }
    else{
        bornSup= Math.ceil(nbEquipe/2);

        for (let i = 3; i <= bornSup; i++) {
            candidat=[];
            som=0;
            reste=nbEquipe;
            nbChoisi=0;
            different=false;   //pour pas avoir de doublant
            while(som<nbEquipe){
                if(reste%i==0){
                    nbChoisi=i;
                    different=true;
                }
                else{
                    nbChoisi=i-1; 
                }
                candidat.push(nbChoisi);
                reste-=(nbChoisi);
                som+=nbChoisi;
            }

            if(som==nbEquipe && different){
                listCombPoule.push(candidat);
            }
            
        }
    }
    afficheChoixPoule(listCombPoule);

}

function afficheChoixPoule(listCombPoule){
    list=[];
    $.each(listCombPoule, (index,comb)=>{
        dic={}
        $.each(comb, (index,nb)=>{
            if(nb in dic)
                dic[nb]++;
            else
                dic[nb]=1;
        });
        list.push(dic);
        
    });

    console.log(`Les propositions des poules sont :`);
    $.each(list, (index,comb)=>{
        str="Soit ";
        $.each(comb,(nbEquipe,nbPoule)=>{
            str+=`${nbPoule} poules de ${nbEquipe}  équipes`; 
        });  
        console.log(`${index+1}) ${str}`);

    });
};





/*

# donner un classement aux équipes (au début tt le monde aura le même classement, ensuite selon les résultats)
# créer l'ensemble des équipes participants au prochain tour (tous les équipes dans le cas de premier tour)
# calculer et afficher les possibilités (combinsations)
# afficher la distribution des équipes dans les poules pour la combinasion choisi (méthode de SERPENTIN)
# par poule (les équipes, le terrain)
# à la validation , on crée le tour, les poules, joue avec résultat 0 et on change le statue de l'encien tour et du suivant 


*/