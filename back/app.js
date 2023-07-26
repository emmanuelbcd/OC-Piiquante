//Imports
const express = require('express'); // importation de express
const mongoose = require('mongoose'); // importation de mongoose

// Routes
const userRoutes = require('./routes/userRoutes');
const sauceRoutes = require('./routes/sauceRoutes');

//Models
//const Sauce = require('./models/Sauce.js'); // importation du modèle Sauce

// Base de données : connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://piiquante:ahuYPeNnOYDPrkbV@cluster0.yamztne.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// création de l'application express
const app = express();


//lorsqu'une requête avec un en-tête content-type : application/json est reçue,
//ce middleware prend en charge de convertir automatiquement les données json en un obj js utilisable
//équivalent à body-Parser
app.use(express.json());

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

//exportation de cette appli
module.exports = app;