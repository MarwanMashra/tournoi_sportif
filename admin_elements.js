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