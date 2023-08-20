//une route est une méthode HTTP (GET, POST, PUT, DELETE, etc.) et
//une route est un chemin (par exemple, '/signup')
//routage : lorsqu'une requête atteint le serveur, elle est dirigée vers la route correspondante
//basée sur la méthode et le chemin

const express = require('express'); //on a besoin d'express afin de créer un router
const router = express.Router(); // création du router d'express
const userCtrl = require('../controllers/userCtrl'); // création du contrôleur pour associer les fonctions aux différentes routes

//routes POST car le front va envoyer des infos (email et mot de passe)
router.post('/signup', userCtrl.signup); //création d'un compte utilisateur
router.post('/login', userCtrl.login); //connexion

module.exports = router; // exportation du router
