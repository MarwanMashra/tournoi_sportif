/*
FIchier : Test_GroupeH.sql
Auteurs : 
Marwan Mashra 21811785
Anh Cao 21713580
Nom du groupe : H
*/

drop database if exists BDH;
create database BDH;
use BDH;

drop table if exists Joue;
drop table if exists Poule;
drop table if exists Terrain;
drop table if exists Tour;
drop table if exists Joueur;
drop table if exists Equipe;
drop table if exists Tournoi;
drop table if exists Evenement;
drop table if exists Sport;
drop table if exists Organisateur;

create table Organisateur(
    Pseudo varchar(50),
    NomOrganisateur varchar(50) not null,
    PrenomOrganisateur varchar(50) not null,
    Mdp varchar(50) not null,
    constraint PK_Organisateur primary key(Pseudo)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Sport(
    TypeJeu varchar(50),
    constraint PK_Sport primary key(TypeJeu)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Evenement(
    IdEvenement int AUTO_INCREMENT,
    NomEvenement varchar(100) not null unique,
    LieuEvenement varchar(100) not null,
    DateEvenement date not null,
    TypeJeu varchar(50) not null,
    NbJoueur numeric(2,0) not null,
    PseudoOrganisateur varchar(50),
    Statue varchar(10) default 'bientot',
    constraint PK_Evenement primary key(IdEvenement),
    constraint FK_Evenement_Organisateur foreign key(PseudoOrganisateur) 
        references Organisateur(Pseudo) on delete set null,
    constraint FK_Evenement_Sport foreign key(TypeJeu) 
        references Sport(TypeJeu) on delete cascade, 
    constraint DOM_Statue_Evenement check(Statue in ('bientot','encours','termine')),
    constraint NbJoueur_positif check(NbJoueur > 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Tournoi(
    IdTournoi int AUTO_INCREMENT,
    Categorie varchar(50),
    TypeTournoi varchar(50) default 'principal',
    IdEvenement int not null,
    constraint PK_Tournoi primary key(IdTournoi),
    constraint FK_Tournoi_Evenement foreign key(IdEvenement) 
        references Evenement(IdEvenement) on delete cascade,
    constraint DOM_TypeTournoi_Tournoi check(TypeTournoi in ('principal','consultante')),
    CONSTRAINT UNIQUE_IdEvenement_Categorie_TypeTournoi UNIQUE(IdEvenement,Categorie,TypeTournoi)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table Equipe(
    IdEquipe int AUTO_INCREMENT,
    NomEquipe varchar(50) not null,
    NiveauEquipe numeric(1,0) not null,
    NomClub varchar(50),
    IdTournoi int,
    InscriptionValidee BOOLEAN default false,
    constraint PK_Equipe primary key(IdEquipe),
    constraint FK_Equipe_Tournoi foreign key(IdTournoi) 
        references Tournoi(IdTournoi) on delete cascade,
    CONSTRAINT UNIQUE_NomEquipe_IdTournoi UNIQUE(NomEquipe,IdTournoi),
    constraint DOM_NiveauEquipe check(NiveauEquipe between 1 and 5)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Joueur(
    IdJoueur int AUTO_INCREMENT,
    NomJoueur varchar(50) not null,
    PrenomJoueur varchar(50) not null,
    NiveauJoueur varchar(20) not null,
    IdEquipe int not null,
    constraint PK_Joueur primary key(IdJoueur),
    constraint FK_Joueur_Equipe foreign key(IdEquipe) 
        references Equipe(IdEquipe) on delete cascade, 
    constraint DOM_NiveauJoueur check
        (NiveauJoueur in ('loisir', 'départemental','régional','Elite','Pro'))
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Tour(
    IdTour int AUTO_INCREMENT,
    NomTour varchar(100),
    NumTour int,
    Statue varchar(10) default 'bientot',
    IdTournoi int,
    constraint PK_Tour primary key(IdTour),
    constraint FK_Tour_Tournoi foreign key(IdTournoi)
        references Tournoi(IdTournoi) on delete cascade,
    constraint DOM_Statue_Tour check(Statue in ('bientot','encours','termine')),
    constraint NumTour_positif check(NumTour > 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Terrain(
    NumTerrain int AUTO_INCREMENT,
    TypeJeu varchar(50) not null,
    constraint PK_Terrain primary key(NumTerrain),
    constraint FK_Terrain_Sport foreign key(TypeJeu) 
        references Sport(TypeJeu) on delete cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Poule(
    IdPoule int AUTO_INCREMENT,
    NomPoule varchar(100),
    IdTour int,
    NumTerrain int,
    constraint PK_Poule primary key(IdPoule),
    constraint FK_Poule_Tour foreign key(IdTour) 
        references Tour(IdTour) on delete cascade, 
    constraint FK_Poule_Terrain foreign key(NumTerrain) 
        references Terrain(NumTerrain) on delete cascade,
    CONSTRAINT UNIQUE_Poule_NumTerrain UNIQUE(NumTerrain)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Joue(
    IdPoule int,
    IdEquipe int,
    NbMatch numeric(3,0) default 0,
    NbSet numeric(3,0) default 0,
    NbPoint numeric(3,0) default 0,
    constraint PK_Joue primary key(IdPoule,IdEquipe),
    constraint FK_Joue_Poule foreign key(IdPoule) 
        references Poule(IdPoule) on delete cascade, 
    constraint FK_Joue_Equipe foreign key(IdEquipe) 
        references Equipe(IdEquipe) on delete cascade,
    constraint NbMatch_positif check(NbMatch >= 0),
    constraint NbSet_positif check(NbSet >= 0),
    constraint NbPoint_positif check(NbPoint >= 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TRIGGER IF EXISTS Equipe_Inscription_Annulee;
DELIMITER $$
CREATE TRIGGER Equipe_Inscription_Annulee
    AFTER UPDATE ON Evenement
    FOR EACH ROW 
BEGIN    
    IF NEW.Statue = 'encours' THEN
        delete from Equipe where InscriptionValidee=false and IdTournoi in 
            (select IdTournoi from Tournoi where IdEvenement=NEW.IdEvenement);
    END IF;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS Liberer_Terrain;
DELIMITER $$
CREATE TRIGGER Liberer_Terrain
    AFTER UPDATE ON Tour
    FOR EACH ROW 
BEGIN    
    IF NEW.Statue = 'termine' THEN
        update Poule set NumTerrain=null where IdTour=NEW.IdTour;
    END IF;
END $$
DELIMITER ;

DROP FUNCTION IF EXISTS Get_Classement;
DELIMITER $$
CREATE FUNCTION Get_Classement (idE INT)
RETURNS NUMERIC(3,0)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE finished INTEGER DEFAULT 0;
    DECLARE cpt NUMERIC(3,0) DEFAULT 1;
    DECLARE var_idE INT;
    DECLARE IdEquipe_cursor CURSOR FOR SELECT E.IdEquipe FROM Tournoi Tn JOIN Tour Tr 
        ON Tr.IdTournoi=Tn.IdTournoi JOIN Poule P ON P.IdTour=Tr.IdTour JOIN Joue J ON 
        J.IdPoule=P.IdPoule JOIN Equipe E ON E.IdEquipe=J.IdEquipe WHERE E.IdTournoi=
        (SELECT IdTournoi FROM Equipe E2 WHERE E2.IdEquipe=idE) and E.InscriptionValidee=true 
        GROUP BY E.IdEquipe ORDER BY sum(NbMatch) DESC,sum(NbSet) DESC,sum(NbPoint) DESC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;
    OPEN IdEquipe_cursor;
    equipe_loop: LOOP
        FETCH IdEquipe_cursor INTO var_idE; 
        IF finished=1 AND cpt=1 THEN
            SET cpt=NULL;
            LEAVE equipe_loop;
        ELSEIF finished=1 OR var_idE=idE THEN 
			LEAVE equipe_loop;
		END IF;
        SET cpt=cpt+1; 
    END LOOP;
    CLOSE IdEquipe_cursor;
    RETURN (cpt);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS Remove_Old_Event;
DELIMITER $$
CREATE PROCEDURE Remove_Old_Event ()
MODIFIES SQL DATA
BEGIN
    DELETE FROM Evenement WHERE Statue='bientot' AND DateEvenement<NOW();
END$$
DELIMITER ;

SET GLOBAL event_scheduler=ON;
DROP EVENT IF EXISTS Daily_Remove_Old_Event;
DELIMITER $$
CREATE EVENT Daily_Remove_Old_Event 
ON SCHEDULE EVERY 1 DAY
COMMENT "Suppression quotidienne des anciens événements qui n'ont pas eu lieu" 
DO
BEGIN
    CALL Remove_Old_Event();
END$$
DELIMITER ;



