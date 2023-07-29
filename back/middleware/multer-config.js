//multer permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('multer'); //importation de multer

const MIME_TYPES = { //préparation d'un dictionnaire pour l'extension du fichier
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//création d'un objet de configuration pour multer
const storage = multer.diskStorage({ //on utilise une fonction de multer diskstorage pour dire qu'on va l'enregistrer sur le disk
    destination: (req, file, callback) => { //on indique à multer d'enregistrer les fichiers dans le dossier images
        callback(null, 'images') //1er argument null pour dire qu'il n'y a pas eu d'erreur, 2nd argument nom du dossier
    },
    filename: (req, file, callback) => { //ce 2ème argument explique à multer quel nom de fichier utiliser
        const name = file.originalname.split(' ').join('_'); //on garde le nom d'origine du fichier, on élimine les espaces et on les remplace par des underscores
        const extension = MIME_TYPES[file.mimetype]; //on crée l'extension du fichier qui correspond au mimetype du fichier envoyé par le front
        callback(null, name + Date.now() + '.' + extension) //1er argument null pour dire qu'il n'y a pas d'erreur et 2nd argument création du filename entier
    }
});

module.exports = multer({ storage }).single('image'); //on exporte notre middleware multer configuré
//on appelle multer (on passe notre objet storage) et on appelle la méthode single (fichier unique)
