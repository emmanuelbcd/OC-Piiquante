const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); //middleware d'authentification
const multer = require('../middleware/multer-config'); //middleware de gestion de fichiers

const sauceCtrl = require('../controllers/sauceCtrl');

// on définit les routes pour chaque opération CRUD
//pour chaque route, on applique le middleware d'authentification pour protéger les routes
//pour les routes qui ont besoin de traiter les images de sauces, on applique le middleware multer
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;