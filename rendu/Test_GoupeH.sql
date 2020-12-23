/*
FIchier : Test_GroupeH.sql
Auteurs : 
Marwan Mashra 21811785
Anh Cao 21713580
Nom du groupe : H
*/

/*****************************************************************************************************/
/***************************************** Test des Triggers *****************************************/
/*****************************************************************************************************/


/******************** Trigger 1 ********************/

/* Insertions nécessaires pour le test */
INSERT INTO Organisateur 
    VALUES('sangri','mashra','marwan',SHA1('123456'));

INSERT INTO Sport 
    VALUES('Football');

INSERT INTO Terrain(TypeJeu) 
    VALUES('Football');
INSERT INTO Terrain(TypeJeu) 
    VALUES('Football');
INSERT INTO Terrain(TypeJeu) 
    VALUES('Football');

INSERT INTO Evenement(NomEvenement, LieuEvenement, DateEvenement, TypeJeu, NbJoueur, PseudoOrganisateur) 
    VALUES('Journée de Football 2021','Montpellier','2021-12-09','Football',1,'sangri');

INSERT INTO Tournoi(Categorie, IdEvenement)
    VALUES('initial',1);

INSERT INTO Equipe(NomEquipe, NiveauEquipe, NomClub, IdTournoi) 
    VALUES('Barça',1,'Barcelona',1);
INSERT INTO Equipe(NomEquipe, NiveauEquipe, NomClub, IdTournoi) 
    VALUES('PSG',1,'Paris Saint-Germain',1);
INSERT INTO Equipe(NomEquipe, NiveauEquipe, NomClub, IdTournoi)  
    VALUES('Real',1,'Real Madrid',1);
INSERT INTO Equipe(NomEquipe, NiveauEquipe, NomClub, IdTournoi) 
    VALUES('Liver',1,'Liverpool',1);
INSERT INTO Equipe(NomEquipe, NiveauEquipe, NomClub, IdTournoi) 
    VALUES('MU',1,'Manchester United',1);

INSERT INTO Joueur(NomJoueur, PrenomJoueur, NiveauJoueur, IdEquipe)
    VALUES('Lio','Messi','Pro',1);
INSERT INTO Joueur(NomJoueur, PrenomJoueur, NiveauJoueur, IdEquipe)
    VALUES('Mbappé','Kylian','Pro',2);
INSERT INTO Joueur(NomJoueur, PrenomJoueur, NiveauJoueur, IdEquipe)
    VALUES('benzema','karim','Pro',3);
INSERT INTO Joueur(NomJoueur, PrenomJoueur, NiveauJoueur, IdEquipe)
    VALUES('Salah','Mohammed','Pro',4);
INSERT INTO Joueur(NomJoueur, PrenomJoueur, NiveauJoueur, IdEquipe)
    VALUES('Cavani','Edinson','Pro',5);


/* Validation des inscriptions de tous les équipes sauf l'équipe 4 */
UPDATE Equipe SET InscriptionValidee=true WHERE IdEquipe<>5;

/* Démarrage du premier événement */
UPDATE Evenement SET Statue='encours' WHERE IdEvenement=1;

/* Affichage des équipes participants dans un des tournois de l'événement 1 pour vérifier que l'équipe 5 n'y est pas */
SELECT * FROM Equipe WHERE IdTournoi IN (SELECT IdTournoi FROM Tournoi WHERE IdEvenement=1);



/******************** Trigger 2 ********************/

/* Insertions nécessaires pour le test */
INSERT INTO Tour(NomTour, NumTour, Statue, IdTournoi) 
    VALUES('Tour 1',1,'encours',1);

INSERT INTO Poule(NomPoule, IdTour, NumTerrain) 
    VALUES('Poule 1',1,1);
INSERT INTO Poule(NomPoule, IdTour, NumTerrain) 
    VALUES('Poule 2',1,2);

INSERT INTO Joue(IdPoule, IdEquipe) 
    VALUES(1,1);
INSERT INTO Joue(IdPoule, IdEquipe) 
    VALUES(1,2);
INSERT INTO Joue(IdPoule, IdEquipe) 
    VALUES(2,3);
INSERT INTO Joue(IdPoule, IdEquipe) 
    VALUES(2,4);


/* Mise à jour des résultats des équipes */
UPDATE Joue SET NbMatch=2,NbSet=2,NbPoint=15 WHERE IdEquipe=1;
UPDATE Joue SET NbMatch=1,NbSet=1,NbPoint=20 WHERE IdEquipe=2;
UPDATE Joue SET NbMatch=2,NbSet=3,NbPoint=10 WHERE IdEquipe=3;
UPDATE Joue SET NbMatch=1,NbSet=1,NbPoint=7 WHERE IdEquipe=4;


/* Affichage des terrains utilisés actuellement pour le premier tour */
SELECT * FROM Terrain T WHERE EXISTS (SELECT * FROM Poule P WHERE P.NumTerrain=T.NumTerrain AND IdTour=1);

/* Clôture du premier tour */
UPDATE Tour SET Statue='termine' WHERE IdTour=1;

/* Deuxième affichage des terrains utilisés actuellement pour le premier tour pour vérifier qu'ils ont bien été libérés */
SELECT * FROM Terrain T WHERE EXISTS (SELECT * FROM Poule P WHERE P.NumTerrain=T.NumTerrain AND IdTour=1);





/******************************************************************************************************/
/***************************************** Test des Fonctions *****************************************/
/******************************************************************************************************/


/******************** Fonction 1 ********************/

SELECT NomEquipe,Get_Classement(IdEquipe) as Classement FROM Equipe WHERE IdTournoi IN 
    (SELECT IdTournoi FROM Tournoi WHERE IdEvenement=1) ORDER BY Classement;




/*******************************************************************************************************/
/***************************************** Test des Procédures *****************************************/
/*******************************************************************************************************/


/******************** Procédure 1 ********************/

/* Insertion des anciens événements qui n'ont jamais eu lieu et qui doivent donc être supprimés */
INSERT INTO Evenement(NomEvenement, LieuEvenement, DateEvenement, TypeJeu, NbJoueur, PseudoOrganisateur) 
    VALUES('Journée de Football 2020','Montpellier','2020-10-09','Football',1,'sangri');
INSERT INTO Evenement(NomEvenement, LieuEvenement, DateEvenement, TypeJeu, NbJoueur, PseudoOrganisateur) 
    VALUES('Journée de Football 2019','Montpellier','2019-10-09','Football',1,'sangri');
INSERT INTO Evenement(NomEvenement, LieuEvenement, DateEvenement, TypeJeu, NbJoueur, PseudoOrganisateur) 
    VALUES('Journée de Football 2018','Montpellier','2018-10-09','Football',1,'sangri');

/* Appel de la procédure qui supprime les anciens événements annulés */   
CALL Remove_Old_Event();

/* Affichage de tous les événements pour vérifier que les anciens ont bien été supprimés */
SELECT * FROM Evenement;

/* Cette procédure est appelée une fois chaque jour grâce à un événement programmé */
SHOW EVENTS;
