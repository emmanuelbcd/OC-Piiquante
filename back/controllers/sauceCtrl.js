const Sauce = require('../models/Sauce');
const fs = require('fs'); //on importe fs (file système) qui permet de modifier le système de fichiers

//logique métier de la route GET
exports.getAllSauces = (req, res, next) => {
    //on utilise la méthode find pour renvoyer un tableau contenant toutes les sauces dans notre BDD
    Sauce.find()
    .then((sauces) => { res.status(200).json(sauces); }) //réponse 200 lorsque le tableau est renvoyé
    .catch((error) => { 
        console.log(error);
        res.status(400).json({ error }); }); //erreur 400 si échec de la réponse
  };


//logique métier de la route POST
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //on parse l'objet requête
    delete sauceObject._id; //on supprime dans cet objet l'id (il est généré automatiquement par notre BDD)
    delete sauceObject._userId; //ne jamais faire confiance au client : on supprime userId qui correspond à la personne qui a créé l'objet
    //delete req.body._id; //on enlève le champ _id du corps de la requête
    const sauce = new Sauce({ //on crée notre objet
        ...sauceObject, //opérateur spread
        userId: req.auth.userId, //on extrait le userId de l'objet requête grâce à notre middleware
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//on génère l'URL de l'image
    });
    //on utilise la méthode save pour enregistrer la nouvelle sauce dans la BDD
    sauce.save()
    .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }); }) //rép 201 lorsque la sauce est enregistrée   
    .catch((error) => { 
        console.log(error);
        res.status(400).json({ error }); 
    }); //erreur 400 si échec
};

//logique métier de la route GET
exports.getOneSauce = (req, res, next) => {
    console.log('Recherche de la sauce avec l\'ID: ',req.params.id); //on affiche l'id de la sauce
    //on utilise la méthode findOne pour récupérer une sauce dans la BDD
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => { 
        console.log('Sauce trouvée: ', sauce);
        res.status(200).json(sauce); }) //réponse 200 lorsqu'une sauce est renvoyée au front
    .catch((error) => { 
        console.log(error);
        res.status(404).json({ error }); 
    }); // rép 404 lorsqu'il y a une erreur
};

//logique métier de la route PUT
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? { //on regarde s'il y a un champ file
        ...JSON.parse(req.body.sauce), //si c'est le cas, on parse la chaîne de caractères
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //on recrée l'url de l'image
    } : { ...req.body }; //si ce n'est pas le cas, on récupère l'objet dans le corps de la requête

    delete sauceObject._userId; //on supprime le userId venant de la requête pour éviter que qqn crée un objet à son nom puis le modifie pour le réassigner à qqn d'autre
    //on cherche cette chose dans la BDD pour la récupérer
    Sauce.findOne({ _id: req.params.id }) //on récupère notre objet en BDD
        .then((sauce) => {
            if(sauce.userId != req.auth.userId) { //on vérifie que l'objet appartient bien à l'utilisateur qui nous envoie la requête
                res.status(401).json({ message: 'Non-autorisé' }); //erreur 401 : l'utilisateur modifie un objet qui ne lui appartient pas
            } else { //on utilise la méthode updateOne pour mettre à jour ou modifier une sauce dans la BDD
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => { res.status(200).json({ message: 'Sauce modifiée !' }); }) // réponse 200 lorsqu'une sauce est bien modifiée dans la BDD
                    .catch((error) => { 
                        console.log(error);
                        res.status(401).json({ error }); 
                    }); //rép 401 lorsqu'il y a une erreur
                }
        })
        .catch((error) => { 
            console.log(error);
            res.status(400).json({ error }); 
        }) //rép 400 s'il y a une erreur
};

//logique métier de la route DELETE
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //on récupère notre objet en BDD
        .then(sauce => { //en cas de réussite, on vérifie que c'est bien le propriétaire de l'objet qui demande la suppression
            if(sauce.userId != req.auth.userId) { //on vérifie que le userId enregistré en BDD correspond bien au userId que nous récupérons du token
                res.status(401).json({ message: 'Non autorisé' }); //erreur 401 si ce n'est pas le cas
            } else { // si c'est le bon utilisateur, on supprime l'objet de la BDD mais aussi l'image du système de fichier
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }); })
                        .catch(error => { 
                            console.log(error);
                            res.status(401).json({ error });
                    })
                });
            }
        })
        .catch((error) => { 
            console.log(error);
            res.status(500).json({ error }); 
    })
};