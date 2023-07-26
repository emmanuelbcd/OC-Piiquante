const express = require('express'); //on a besoin d'express afin de créer un router
const router = express.Router(); // création du router d'express
const userCtrl = require('../controllers/userCtrl'); // création du contrôleur pour associer les fonctions aux différentes routes

//routes POST car le front va envoyer des infos (email et mot de passe)
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router; // exportation du router
