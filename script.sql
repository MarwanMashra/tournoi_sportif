
--	Organisateur (Pseudo, NomOrganisateur, PrenomOrganisateur, Mdp) 
--	Evenement (IdEvenement, NomEvenement, LieuEvenement, DateEvenement, TypeJeu, NbJoueur, PseudoOrganisateur)
--	Tournoi (IdTournoi, Categorie, IdEvenement)  
--	Equipe (NomEquipe, NiveauEquipe, NomClub, TypeJeu) 
--	Joueur (IdJoueur, NomJoueur, PrenomJoueur, NiveauJoueur, NomEquipe)
--	Inscrit (IdTournoi, NomEquipe, estValide) 
--	Tour (IdTour, NomTour, NumTour, Etat, IdTournoi) 
--	Poule (IdPoule, NomPoule, IdTour, NumTerrain) 
--	Terrain (NumTerrain, TypeJeu)
--	Joue (IdPoule, NomEquipe, NbMatch, NbSet, NbPoint) 
--	Sport(TypeJeu)


drop table if exists Joue;
drop table if exists Poule;
drop table if exists Terrain;
drop table if exists Tour;
drop table if exists Inscrit;
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
    constraint PK_Evenement primary key(IdEvenement),
    constraint FK_Evenement_Organisateur foreign key(PseudoOrganisateur) 
        references Organisateur(Pseudo) on delete set null,
    constraint FK_Evenement_Sport foreign key(TypeJeu) 
        references Sport(TypeJeu) on delete cascade, 
    constraint NbJoueur_positif check(NbJoueur > 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Tournoi(
    IdTournoi int AUTO_INCREMENT,
    Categorie varchar(50),
    IdEvenement int not null,
    constraint PK_Tournoi primary key(IdTournoi),
    constraint FK_Tournoi_Evenement foreign key(IdEvenement) 
        references Evenement(IdEvenement) on delete restrict 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table Equipe(
    NomEquipe varchar(50),
    NiveauEquipe numeric(1,0),
    NomClub varchar(50),
    TypeJeu varchar(50) not null,
    constraint PK_Equipe primary key(NomEquipe),
    constraint FK_Equipe_Sport foreign key(TypeJeu) 
        references Sport(TypeJeu) on delete cascade, 
    constraint DOM_NiveauEquipe check(NiveauEquipe between 1 and 5)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Joueur(
    IdJoueur int AUTO_INCREMENT,
    NomJoueur varchar(50) not null,
    PrenomJoueur varchar(50) not null,
    NiveauJoueur varchar(20),
    NomEquipe varchar(50) not null,
    constraint PK_Joueur primary key(IdJoueur),
    constraint FK_Joueur_Equipe foreign key(NomEquipe) 
        references Equipe(NomEquipe) on delete cascade, 
    constraint DOM_NiveauJoueur check
        (NiveauJoueur in ('loisir', 'départemental','régional','N3','N2','Elite','Pro'))
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Inscrit(
    IdTournoi int,
    NomEquipe varchar(50), 
    estValide BOOLEAN default false,
    constraint PK_Inscrit primary key(IdTournoi,NomEquipe),
    constraint FK_Inscrit_Tournoi foreign key(IdTournoi) 
        references Tournoi(IdTournoi) on delete cascade, 
    constraint FK_Inscrit_Equipe foreign key(NomEquipe)
        references Equipe(NomEquipe) on delete cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Tour(
    IdTour int AUTO_INCREMENT,
    NomTour varchar(100),
    NumTour int,
    Etat varchar(10) default 'pret',
    IdTournoi int,
    constraint PK_Tour primary key(IdTour),
    constraint FK_Tour_Tournoi foreign key(IdTournoi)
        references Tournoi(IdTournoi) on delete cascade,
    constraint DOM_Etat check(Etat in ('pret','encours','termine')),
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
        references Terrain(NumTerrain) on delete cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Joue(
    IdPoule int,
    NomEquipe varchar(50),
    NbMatch numeric(3,0) default 0,
    NbSet numeric(3,0) default 0,
    NbPoint numeric(3,0) default 0,
    constraint PK_Joue primary key(IdPoule,NomEquipe),
    constraint FK_Joue_Poule foreign key(IdPoule) 
        references Poule(IdPoule) on delete cascade, 
    constraint FK_Joue_Equipe foreign key(NomEquipe) 
        references Equipe(NomEquipe) on delete cascade,
    constraint NbMatch_positif check(NbMatch >= 0),
    constraint NbSet_positif check(NbSet >= 0),
    constraint NbPoint_positif check(NbPoint >= 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;





-- INSERTION Organisateur

INSERT INTO Organisateur VALUES('sangri','mashra','marwan',SHA1('123456'));
Insert into Organisateur values('Sokz','DOMY','Andre',SHA1('123'));
Insert into Organisateur values ('MaradonaGod','Balder','Darius',SHA1('Dadababa1'));
Insert into Organisateur values ('Gunnix','Hereinstein','Sophie',SHA1('chopinnocturne20'));
Insert into Organisateur values ('BlackMamba','Bryant','Kobe',SHA1('Lakers4ever'));

-- INSERTION Sport

Insert into Sport values ('Football');
Insert into Sport values ('Basket-ball');

-- INSERTION Evenement

Insert into Evenement values (null,'Tournois2','Londre','2018-11-04','Football',3,'MaradonaGod');
Insert into Evenement values (null,'SeriesTournois3','Nice','2015-03-23','Basket-ball',3,'BlackMamba');

-- INSERTION TournoiS

Insert into Tournoi values (null,'Adulte',1);
Insert into Tournoi values (null,'Femme',2);

-- INSERTION Equipe

Insert into Equipe values('PSG',5,'Paris-St-Germain','Football');
Insert into Equipe values('OM',5,'Olympique-de-Marseille','Football');
Insert into Equipe values('OL',5,'Olympique-Lyonnais','Football');
Insert into Equipe values('REAL',5,'Real Madrid','Football');
Insert into Equipe values('KangooJnr',1,null,'Basket-ball');
Insert into Equipe values('TortueNinja',1,null,'Basket-ball');

-- INSERTION Joueur

INSERT into Joueur values(null,'Neymar','da Silva Santos Júnior','Pro','PSG');
INSERT into Joueur values(null,'Mbappé','Kylian','Pro','PSG');
INSERT into Joueur values(null,'Köpke','Andreas','Pro','PSG');
INSERT into Joueur values(null,'Zinedine','Zidane','Pro','OM');
INSERT into Joueur values(null,'Barthez','Fabien','Pro','OM');
INSERT into Joueur values(null,'Waddle','Chris','Pro','OM');
INSERT into Joueur values(null,'Pernambucano','Juninho','Pro','OL');
INSERT into Joueur values(null,'Gomez','Yohan','Pro','OL');
INSERT into Joueur values(null,'Hartock','Joan','Pro','OL');
INSERT into Joueur values(null,'Vieira','Marcelo','Pro','REAL');
INSERT into Joueur values(null,'Lunin','Andriy','Pro','REAL');
INSERT into Joueur values(null,'Modric','Luka','Pro','REAL');
INSERT into Joueur values(null,'Junior','Napo','loisir','KangooJnr');
INSERT into Joueur values(null,'Junior','Nelson','loisir','KangooJnr');
INSERT into Joueur values(null,'Junior','Archie','loisir','KangooJnr');
INSERT into Joueur values(null,'Splinter','Donatello','loisir','TortueNinja');
INSERT into Joueur values(null,'Splinter','Leonardo','loisir','TortueNinja');
INSERT into Joueur values(null,'Splinter','Raphaelo','loisir','TortueNinja');

-- INSERTION Inscrit

Insert into Inscrit values(1,"PSG",null);
Insert into Inscrit values(1,"OM",null);
Insert into Inscrit values(1,"OL",null);
Insert into Inscrit values(1,"REAL",null);
Insert into Inscrit values(2,"KangooJnr",null);
Insert into Inscrit values(2,"TortueNinja",null);

-- INSERTION Tour

Insert into Tour values(null,"Demi-FinalPRO",1,null,1);
Insert into Tour values(null,"FinalPRO",2,null,1);
Insert into Tour values(null,"FinalPOUSSIN",1,null,2);


-- INSERTION Terrain

Insert into Terrain values(null,"Football");
Insert into Terrain values(null,"Football");
Insert into Terrain values(null,"Basket-ball");

-- INSERTION Poule

Insert into Poule values(null,"OMvsOL",1,1);
Insert into Poule values(null,"REALvsPSG",1,2);
Insert into Poule values(null,"OMvsPSG",2,1);
Insert into Poule values(null,"KJvsTN",3,3);

-- INSERTION Joue

INSERT into Joue values(1,"OM",1,1,3);
INSERT into Joue values(1,"OL",1,1,0);
INSERT into Joue values(2,"REAL",1,1,1);
INSERT into Joue values(2,"PSG",1,1,4);
INSERT into Joue values(3,"OM",1,1,2);
INSERT into Joue values(3,"PSG",1,1,2);
INSERT into Joue values(4,"KangooJnr",1,1,103);
INSERT into Joue values(4,"TortueNinja",1,1,97);