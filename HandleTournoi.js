var Equipes=[];
var Terrains=[];
var idTournoi;
var tour,lastTour;
 /*
    si tour= null alors             // il faut créer un nouveau tour 
        si lastTour=null alors 
            c'est le premier tour du tournoi
        sinon 
            il faut chercher les résultats de l'ancien tour
    sinon 
        si tour[Statue]=encours alors             ((pas traité ici))
            il faut éditer les résultats du tour
        sinon 
            il faut juste choisir les équipes pour les poules

    */

function HandleTournoi(idT,_tour,_lastTour){
    idTournoi=idT;
    tour= _tour;
    lastTour= _lastTour;
    myAjax('getFreeTerrain',{'idTournoi':idTournoi},(listTerrain)=>{
        Terrains= listTerrain;
        if(lastTour==null){
            myAjax('getEquipeByIdTournoi',{'idTournoi':idTournoi},(listEquipe)=>{
                let listEquipePoule=[];
                for(let i=1;i<=5;i++){
                    $.each(listEquipe, (index,equipe)=>{
                        if(equipe['NiveauEquipe']==i){
                            listEquipePoule.push(equipe);
                        }
                    });
                }

                Equipes= listEquipePoule;
                genAllCombPoule();
            });

        }
        else{    //il y avait un ancien tour, il faut chercher ses résultats
            myAjax('getResultByIdTournoi',{'IdTour':lastTour['IdTour']},(listResult)=>{
                let listEquipePoule=[];
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
                let nbResult= listResult.length;
                while(nbResult>0){
                    $.each(listResultPoule, (IdPoule,listResultEquipe)=>{         //on va grouper par l'id de poule
                        if(listResultEquipe.length>0){
                            listEquipePoule.push(listResultEquipe.shift());
                            nbResult--;
                        }
                    });
                }

                Equipes= listEquipePoule;
                console.log(Equipes);
                //il faut couper la moitié des équipes pour garder ceux qui sont qualifié (attention au final et au demi-final)  


                // genAllCombPoule();

            });
        }              

    });
  
};


function genAllCombPoule(){

    var listCombPoule=[];
    var nbEquipe=Equipes.length;
    // console.log(`Il y a ${nbEquipe} équipes`);

    if(nbEquipe==4){
        listCombPoule.push([2,2]);
    }
    else{
        bornSup= Math.ceil(nbEquipe/2);

        for (let i = 3; i <= bornSup; i++) {
            let candidat=[];
            let som=0;
            let reste=nbEquipe;
            let nbChoisi=0;
            let different=false;   //pour pas avoir de doublant
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

            if(som==nbEquipe && different && candidat.length<=Terrains.length){   //faut que le nombre de poule soit pas superieur au nombre de terrain disponible 
                listCombPoule.push(candidat);
            }
            
        }
    }
    afficheChoixPoule(listCombPoule);

}



function afficheChoixPoule(listCombPoule){
    if(listCombPoule.length==0){
        if(Terrains.length<2) 
            probleme="de terrains disponibles";
        else{
            probleme="d'équipe";
        }
        $('body').append(`<p>Le tour ne peut pas commencer car il n'y a pas assez ${probleme}`);
        return;  //on arrête car le tour ne peut pas commencer 
    }

    var list=[];
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

    
    var html=`
        <label class='label'>Choix de poule :</label>
        <br><div id="choix-poule-div">
    `;
    $.each(list, (index,comb)=>{
        let str="";
        i=0,l=Object.keys(comb).length-1;
        $.each(comb,(nbEquipe,nbPoule)=>{
            str+=`${nbPoule} poules de ${nbEquipe}`; 
            if(i++ < l) 
                str+=` et `; 
        });
        html+=`
            <input type="radio" name="choix-poule-input" id="choix-poule-input-${index}" class="radio-input choix-poule-input" value="${listCombPoule[index].length}">
            <label class="label" for="choix-poule-input-${index}">${str}<label>
            <br>
        `;

    });
    html+=`
        </div>
        <div class="poule-container"></div>
        <button id="submit-tour">Valider le tour</button>
        <span id="error-tour" class="error">
    `;
    
    $('body').append(html);
    $('#submit-tour').hide();
    $('#tour-suivant').remove();


    $('.choix-poule-input').change(function(){
        $('#submit-tour').show();
        let nbPoule= $(this).val();
        serpentin(nbPoule);
    });
    $('#submit-tour').click(createTour);

};

function serpentin(nbPoule){
    var listPoule=[];
    for (let i = 0; i < nbPoule; i++) {
        listPoule.push([]);       
    }

    indexEquipe=0;
    while (indexEquipe<Equipes.length){
        if(Equipes.length-indexEquipe > nbPoule){     //je rentre dans cette boucle si seulement si ce n'est pas la dernière
            for (let i = 0; i < listPoule.length && indexEquipe<Equipes.length; i++) {   //boucle -> -> -> 
                listPoule[i].push(Equipes[indexEquipe++]);
            }
        }
        for (let i = listPoule.length-1; i >=0 && indexEquipe<Equipes.length; i--) {    //boucle <- <- <-  
            listPoule[i].push(Equipes[indexEquipe++]);
        }
    }
    affichePoule(listPoule);
}

function affichePoule(listPoule){
    html=`
        <div class="poule-container">
    `;
    $.each(listPoule, (index,poule)=>{
        html+=`
            <fieldset id="poule-${index}" class="poule-section">
                <legend>Poule ${index+1}:</legend>
                <label class="label poule-name-label" for="poule-name-input-${index}">Nom de la poule </label>
                <input type="text" id="poule-name-input-${index}" class="poule-name-input" value="Poule ${index+1}">
                <br>
                <label class="label terrain-label" for="terrain-input-${index}">Terrain </label>
                <select name="terrain-input" id="terrain-input-${index}" class="terrain-input" required>
        `;
        let choixTerrain= Terrains[index];
        html+=`<option value="${choixTerrain}">terrain ${choixTerrain}</option>`;
        $.each(Terrains, (i,terrain)=>{
            if(terrain!= choixTerrain)
                html+=`<option value="${terrain}">terrain ${terrain}</option>`;
        });

        html+=`
                </select>
                <br>
                <fieldset id="equipe-section-${index}" class="equipe-section">
                    <legend>Les équipes :</legend>
                    <ol id="liste-equipe-${index}" class="liste-equipe">
        `;  
        $.each(poule, (i,equipe)=>{
            html+=`
                        <li id="${equipe['IdEquipe']}" class="equipe list-group-item"> ${equipe['NomEquipe']} (niveau ${equipe['NiveauEquipe']})</li>
            `;
        });
        html+=`
                    </ol>
                </fieldset>
                <p id="error-nbEquipe-${index}" class="error error-nbEquipe"></p>
            </fieldset>
        `;
    });
    html+=`
        </div>
    `;

    $(".poule-container").replaceWith(html);
    $('.liste-equipe').sortable({
        connectWith:".liste-equipe",
        cursor: "grabbing",
        placeholder: 'drop-placeholder',
        tolerance: 'pointer',
        opacity: 0.8,
        update: (event,ui)=>{
            checkPoule();
        }

    });
    // $.each($('.liste-equipe'), (index,element)=>{
    //     $(`#${element.id}`).sortable();
    //     console.log(element.id);
    // });
}
function checkPoule(){
    let nbPoule= getNbPoule();
    let nbEquipe= Equipes.length;
    let min= Math.floor(nbEquipe/nbPoule);;
    let max= Math.ceil(nbEquipe/nbPoule);
    let is_good=true;
    $.each($('.liste-equipe'), (i,element)=>{
        let nbEquipeParPoule= $(`#${element.id}`).children('.equipe').length;
        let index= element.id.split('-')[2];
        if(nbEquipeParPoule < min || nbEquipeParPoule>max){
            is_good= false;

            str=`(entre ${min} et ${max})`;
            if(min==max)
                str=`(égale à ${max})`;

            if(nbEquipeParPoule < min)
                $(`#error-nbEquipe-${index}`).text(`*Pas assez d'équipe ${str}`);
            else
                $(`#error-nbEquipe-${index}`).text(`*Trop d'équipe ${str}`);

        }
        else{
            $(`#error-nbEquipe-${index}`).text("");
        }
    });

    if(is_good){
        $('#error-tour').text("");
    }

    return is_good;

}
function createTour(){
    obj= getDataTour();
    if(obj['message']!=""){
        $('#error-tour').text(obj['message']);
    }
    else{
        $('#error-tour').text("");
        params=obj['params'];
        console.log(params);
        myAjax('insertTour',params,(response)=>{
            if(response['class']=='succes'){
                location.reload();
            }
            else{
                $('#error-tour').text(response['message']);
                console.log(response['error'])
                console.log(response['trace'])

            }
        });
    }
    
}

function getDataTour(){
    params={};
    params['NomTour']="Tour 1";
    params['Statue']="encours";
    params['IdTournoi']=idTournoi;
    if(tour==null)
        params['NumTour']=1;
    else
        params['NumTour']=NumTour['NumTour']+1;

    
    params['listPoule']=[];
    nomPouleVide=false;
    listeNumTerrain=[];

    nbPoule= getNbPoule();
    console.log("nbPoule: "+nbPoule);
    for(let i=0; i<nbPoule; i++){
        poule={
            'NomPoule':$(`#poule-name-input-${i}`).val().trim(),
            'NumTerrain':$(`#terrain-input-${i}`).val().trim()
        };
        nomPouleVide|= poule['NomPoule']=="";
        listeNumTerrain.push(poule['NumTerrain']);
        poule['listIdEquipe']=[];
        $.each($(`#liste-equipe-${i}`).children( ".equipe" ), (index,equipe)=>{
            poule['listIdEquipe'].push(equipe.id);
        });
        params['listPoule'].push(poule);
    }
    
    obj={
        'params':params,
        'message':""
    };


    if(nomPouleVide){
        obj['message']="*Veuillez mettre un nom pour tous les poules";
    }
    else if(! listeNumTerrain.isUnique()){    //cette méthode a été ajouté à l'objet Array dans fonctions.js
        obj['message']="*Veuillez choisir un terrain différent pour chaque poule";
    }
    
    else if(! checkPoule()){
        obj['message']="*Veuillez équilibrer le nombre d'équipe par poule";
    }
        
    return obj;
}
function getNbPoule(){
    return $("input[name='choix-poule-input']:checked").val();
}
/*

# donner un classement aux équipes (au début tt le monde aura le même classement, ensuite selon les résultats)
# créer l'ensemble des équipes participants au prochain tour (tous les équipes dans le cas de premier tour)
# calculer et afficher les possibilités (combinsations)
# afficher la distribution des équipes dans les poules pour la combinasion choisi (méthode de SERPENTIN)
# par poule (les équipes, le terrain)
# à la validation , on crée le tour, les poules, joue avec résultat 0 et on change le statue de l'encien tour et du suivant 
*/