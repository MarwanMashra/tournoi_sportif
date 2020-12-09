$( document ).ready(function() {
    
    idTournoi= 1;

    myAjax('getNbJoueurByIdTournoi',{'id' : idTournoi},(data)=>{
        
        NbJoueur=data["NbJoueur"];
        // console.log(NbJoueur);
            html=`<h3 class="text-center" >Formulaire d'Equipe</h3>
                <form action="ajout_equipe.php" method="post" id="formId">
                    <label for="nomEquipe">Nom de l'équipe : </label>
                    <input type="text" id="nomEquipe" placeholder="nomEquipe" autocomplete="off" name="nomEquipe" required><br>
                    <label for="nomClub">Le nom de votre club (si vous en avez un):</label>
                    <input type="text" id="nomClub" placeholder="nomClub" autocomplete="off" name="nomClub"><br>
                    <h3 class="text-center" >Ajoutez les joueurs</h3>
            `;
            for (var i =1; i <= NbJoueur; i++){
                html+=`
                    <h5 class="text-center" >Remplissez les infos sur le joueurs n°`+i+`</h5>
                    <label for="nomJoueur`+i+`">Nom:</label>
                    <input type="text" name="nomJoueur`+i+`" required><br>
                    <label for="prenomJoueur`+i+`">Prenom</label>
                    <input type="text" name="prenomJoueur`+i+`" required><br>
                    <label for="nvJoueur`+i+`">Niveau du joueur</label>
                    <select name="nvJoueur`+i+`" required>
                        <option value="">Choisissez parmis les options</option>
                        <option value="Jeune">Jeune</option>
                        <option value="Débutant">Débutant</option>
                        <option value="Amateur">Amateur</option>
                        <option value="Semi-Pro">Semi-Pro</option>
                        <option value="Pro">Pro</option>
                    </select><br>
                `; 
                //label+input pour joueur /concatiner le iavec 
                //joueurdans name de input/niveau c'est un input select
            }
            html+=`
            <button type="submit" form="formId" value="Submit">Finir Formulaire</button>
            </form>`;
    $('body').append(html);
    
    

    });  

});

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

function printError(error){    //afficher la page d'erreur 
		
    console.error("status: "+error['status']+"\nstatusText: "+error['statusText']);
    $('body').replaceWith(error['responseText']);
    
}
