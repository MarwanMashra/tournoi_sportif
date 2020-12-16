var login;
var indexTournoi=0;
function addAdminElements(){
    myAjax('getSession',{},(session)=>{
        if(session['login'] != null){
            login= session['login'];
            addProfilElements();
            addCreateButtons();
        }
        else{
            $('body').append(`<a href="page_connexion.php"><button>Connexion</button></a>`);;
        }
            
    });
}
function addProfilElements(){
    html=`
        <a href="deconnexion.php"><button>Deconnexion</button></a>
        <a href="page_inscription.php"><button>ajouter unn compte</button></a>
    `;
    $('body').append(html);
}

function addCreateButtons(){
    $('body').append(`<div id="create-event-container"><div>`);
    addCreateEvent();
    $('body').append(`<div id="create-terrain-container"><div>`);
    addCreateTerrain();
    $('body').append(`<div id="create-sport-container"><div>`);
    addCreateSport();
}

function addCreateEvent(){
    html=`
        <div id="create-event-container">
            <button id="show-Form-create-event-button">Créer un évènement</button>
        <div>
    `;
    $('#create-event-container').replaceWith(html);
    $('#show-Form-create-event-button').click(()=>{
        myAjax('getAllSports',{},(sports)=>{
            html=`
                <div id="create-event-container">
                    <fieldset>
                        <legend>Créer un nouveau évènement:</legend>

                        <label for="NomEvenement-input" id="NomEvenement-label" class="label">Nom de l'évènement </label>
                        <input type="text" name="NomEvenement-input" id="NomEvenement-input" placeholder="Nom de l'évènement" required>
                        <br>

                        <label for="LieuEvenement-input" id="LieuEvenement-label" class="label">Lieu de l'évènement </label>
                        <input type="text" name="LieuEvenement-input" id="LieuEvenement-input" placeholder="Lieu de l'évènement" required>
                        <br>

                        <label for="DateEvenement-input" id="DateEvenement-label" class="label">Date de l'évènement </label>
                        <input type="date" name="DateEvenement-input" id="DateEvenement-input" placeholder="Date de l'évènement" required>
                        <br>

                        <label for="TypeJeu-input" id="TypeJeu-label">Type de jeu:</label>

                        <select name="TypeJeu-input" id="TypeJeu-input" required>
                        <option value="">-- Choisis un sport --</option>

                `;

                $.each(sports,(index,sport)=>{
                    html+=`<option value="${sport}">${sport}</option>`;
                })

                html+=`

 
                        </select>
                        <br>

                        <label for="NbJoueur-input" id="NbJoueur-label" class="label">Nombre de joueur </label>
                        <input type="number" min="1" name="NbJoueur-input" id="NbJoueur-input" placeholder="Nombre de joueur" required>
                        <br>

                        <fieldset id="tournoi-section">
                            <legend>Tournois:</legend>
                            <button id="add-tournoi">ajouter un tournoi</button>
                            <br>
                        </fieldset>
                        
                        <br>
                        <button id="create-event-button">Créer</button>
                        <button id="hide-Form-create-event-button">Annuler</button>
                        <span id="form-error" style="color:red;"></span>

                    </fieldset>
                <div>
            `;
            $('#create-event-container').replaceWith(html);
            $('#hide-Form-create-event-button').click(()=>{
                addCreateEvent(); 
            });

            $('#create-event-button').click(()=>{
                sendEvent();
            });
            $('#add-tournoi').click(()=>{
                addTournoi();
            });
        });
        
    });
}

function addTournoi(){
    i= indexTournoi++;
    html=`
        <label class="tournoi${i}" for="categorie-input${i}" id="categorie-label${i}">Categorie:</label>

        <select name="categorie-input${i}" id="categorie-input${i}" class="tournoi${i} categorie-input" required>
            <option value="">-- Choisissez un sport --</option>

    `;
    $.each(listCategorie,(index,categorie)=>{
        html+=`<option value="${categorie}">${categorie}</option>`;
    });
    html+=`
        </select>
        <button id="tournoi${i}" class="remove-tournoi tournoi${i}">supprimer</button>
        <br class="tournoi${i}">
    `;
    $('#tournoi-section').append(html);
    $('.remove-tournoi').click(function (){
        classToRemove= $(this).attr('id');
        $(`.${classToRemove}`).remove();
    });

}

function sendEvent(){
    NomEvenement= $('#NomEvenement-input').val().trim();
    LieuEvenement= $('#LieuEvenement-input').val().trim();
    DateEvenement= $('#DateEvenement-input').val().trim();
    TypeJeu= $('#TypeJeu-input').val().trim();
    NbJoueur= $('#NbJoueur-input').val().trim();
    listTournoi=[]
    categorie_vide=false;
    $.each($('.categorie-input'),(index,input)=>{
        categorie= $(`#${input.id}`).val();
        listTournoi.push(categorie);
        categorie_vide|= categorie=="";
    });
    if(NomEvenement!="" && LieuEvenement!="" && DateEvenement!="" && TypeJeu!="" && NbJoueur!="" && listTournoi.length>0 &&(! categorie_vide)){
        $('#form-error').text('');
        params={
            'NomEvenement':NomEvenement,
            'LieuEvenement':LieuEvenement,
            'DateEvenement':DateEvenement,
            'TypeJeu':TypeJeu,
            'NbJoueur':NbJoueur,
            'listTournoi':listTournoi,
            'pseudo':login['pseudo']
        }

        myAjax('insertEvent',params,(response)=>{
            if(response['class']=="succes"){
                addCreateEvent();  //on peut aussi afficher un message pour dire que l'evenement a été bien créé
            }else{
                $('#form-error').text(`*${response['message']}`);

            }
        });
    }
    else{
        $('#form-error').text('*Une ou plusieurs case est vide');
    }
    
}

function addCreateTerrain(){
    html=`
        <div id="create-terrain-container">
            <button id="show-Form-create-terrain-button">Ajouter un terrain</button>
        <div>
    `;
    $('#create-terrain-container').replaceWith(html);
    $('#show-Form-create-terrain-button').click(()=>{
        myAjax('getAllSports',{},(sports)=>{
            html=`
                <div id="create-terrain-container">
                    <fieldset>
                        <legend>Ajouter un nouveau terrain :</legend>

                        <label for="TypeJeu-input-terrain" id="TypeJeu-terrain-label" class="label">Le sport du terrain :</label>
                        <select name="TypeJeu-input-terrain" id="TypeJeu-input-terrain" required>
                        <option value="">-- Choisissez un sport --</option>
                `;

                $.each(sports,(index,sport)=>{
                    html+=`<option value="${sport}">${sport}</option>`;
                })

                html+=`
                        </select>                        
                        <br><br>
                        <button id="create-terrain-button">Ajouter</button>
                        <button id="hide-Form-create-terrain-button">Annuler</button>
                        <span id="form-error-terrain" style="color:red;"></span>

                    </fieldset>
                <div>
            `;
            $('#create-terrain-container').replaceWith(html);
            $('#hide-Form-create-terrain-button').click(()=>{
                addCreateTerrain(); 
            });

            $('#create-terrain-button').click(()=>{
                sendTerrain();
            });

        });
        
    });
}


function sendTerrain(){
    TypeJeu= $('#TypeJeu-input-terrain').val().trim();
    if(TypeJeu!=""){
        $('#form-error-terrain').text('');
        myAjax('insertTerrain',{'TypeJeu':TypeJeu},(response)=>{
            if(response['class']=="succes"){
                addCreateTerrain();  //on peut aussi afficher un message pour dire que l'evenement a été bien créé
            }else{
                $('#form-error-terrain').text(`*${response['message']}`);

            }
        });
    }
    else{
        $('#form-error-terrain').text('*Veuillez choisir un sport pour le terrain');
    }
    
}


function addCreateSport(){
    html=`
        <div id="create-sport-container">
            <button id="show-Form-create-sport-button">Ajouter un sport</button>
        <div>
    `;
    $('#create-sport-container').replaceWith(html);
    $('#show-Form-create-sport-button').click(()=>{
        myAjax('getAllSports',{},(sports)=>{
            html=`
                <div id="create-sport-container">
                    <fieldset>
                        <legend>Ajouter un nouveau sport :</legend>

                        <label for="TypeJeu-input-sport" id="TypeJeu-sport-label" class="label">Le sport du sport :</label>
                        <input type="text" name="TypeJeu-input-sport" id="TypeJeu-input-sport">
                        <br><br>
                        
                        <button id="create-sport-button">Ajouter</button>
                        <button id="hide-Form-create-sport-button">Annuler</button>
                        <span id="form-error-sport" style="color:red;"></span>

                    </fieldset>
                <div>
            `;
            $('#create-sport-container').replaceWith(html);
            $('#hide-Form-create-sport-button').click(()=>{
                addCreateSport(); 
            });

            $('#create-sport-button').click(()=>{
                sendSport(sports);
            });

        });
        
    });
}


function sendSport(sports){
    TypeJeu= $('#TypeJeu-input-sport').val().trim();
    if(TypeJeu==""){
        $('#form-error-sport').text('*Veuillez entrer le nom de sport');
    }
    else if(sports.includes(TypeJeu)){
        $('#form-error-sport').text('*Ce sport existe déjà');
    }
    else{
        $('#form-error-sport').text('');
        myAjax('insertSport',{'TypeJeu':TypeJeu},(response)=>{
            if(response['class']=="succes"){
                addCreateSport();  //on peut aussi afficher un message pour dire que l'evenement a été bien créé
            }else{
                $('#form-error-sport').text(`*${response['message']}`);

            }
        });  
    }    
    
}