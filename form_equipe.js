$( document ).ready(function() {
    
    idTournoi= 1;

    myAjax('getNbJoueurByIdTournoi',{'id' : idTournoi},(data)=>{
        
        NbJoueur=data["NbJoueur"];
        // console.log(NbJoueur);
            html=`<h3 class="text-center" >Formulaire d'Equipe</h3>
                <from name="form_Equip" method="post">
                    <label for="nomEquipe">Nom de l'équipe : </label><input type="text" size="50" name="nomEquipe"><br>
                    <label for="nomClub">Le nom de votre club (si vous en avez un):</label><input type="text" size="50" name="nomClub"><br>
                    <h3 class="text-center" >Ajoutez les joueurs</h3>
            `;
            for (var i =0; i < NbJoueur; i++){
                j=i+1;
                html+=`
                    <h5 class="text-center" >Remplissez les infos sur le joueurs n°`+j+`</h5>
                    <label for="nomJoueur`+j+`">Nom:</label><input type="text" size="50" name="nomJoueur`+j+`"><br>
                    <label for="prenomJoueur`+j+`">Prenom</label><input type="text" size="50" name="prenomJoueur`+j+`"><br>
                    <label for="nvJoueur`+j+`">Niveau du joueur</label>
                    <select name="nvJoueur`+j+`">
                        <option value="">Choisissez parmis les options</option>
                        <option value="1">Jeune</option>
                        <option value="2">Débutant</option>
                        <option value="3">Amateur</option>
                        <option value="4">Semo-Pro</option>
                        <option value="5">Pro</option>
                    </select><br>
                `; 
                //label+input pour joueur /concatiner le iavec joueurdans name de input/niveau c'est un input select
            }
            html+=`</form>
            <button type="submit" form="form1" value="Submit">Finir Formulaire</button>`;
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
