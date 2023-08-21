//Intro
//Ce fichier est au coeur du backend. Structure de l'appli :
//Grâce à Express, nous avons créé une instance de l'application qui centralise les routes.
//Middlewares : avant d'atteindre les routes, plusieurs middlewares sont traversés.
//exemple : on utilise un middleware pour gérer les headers et les CORS
//exemple : on utilise un middleware pour convertir le body de la requête en JSON
//exemple : on utilise un middleware pour sécuriser l'application avec helmet.

//Imports
const express = require('express'); // framework utilisé pour créer notre serveur
const mongoose = require('mongoose'); // agit comme un intermédiaire entre node et la BDD mongoDB
require('dotenv').config(); //on configure les variables d'environnement en utilisant le fichier .dotenv
const path = require('path'); //on utilise path ici pour garantir que le chemin vers le répertoire images est correctement formé 
const helmet = require('helmet'); //on importe helmet qui sécurise l'app express en définissant divers en-têtes http

// Routes
const userRoutes = require('./routes/userRoutes');
const sauceRoutes = require('./routes/sauceRoutes');

// Base de données : connexion à MongoDB Atlas
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log('Connexion à MongoDB échouée ', error));

// création de l'application express
const app = express();


//lorsqu'une requête avec un en-tête content-type : application/json est reçue,
//ce middleware prend en charge de convertir automatiquement les données json en un obj js utilisable
//équivalent à body-Parser
app.use(express.json()); //remplace bodyParser à partir de la version 4.16 d'express

//middleware général avant la route d'API
//le middle CORS est utilisé pour autoriser ou bloquer les requêtes d'origine différentes vers l'API
app.use((req, res, next) => { // cors headers
    //on accède à notre API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', '*'); //* notre API autorise les requêtes
    //on ajoute les headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //on envoie des requêtes avec les méthodes mentionnées : GET, POST, etc.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Endpoints
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

//on utilise helmet après avoir défini CORS afin de ne pas interférer avec les en-têtes CORS
app.use(helmet());

//exportation de cette appli
module.exports = app;
