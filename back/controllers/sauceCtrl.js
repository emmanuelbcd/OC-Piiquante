//une fois la route identifiée, l'action se déplace vers le contrôleur.
//ce sont des fonctions spécifiques à chaque route.
//exemple : pour une route GET (afficher toutes les sauces), le contrôleur gère la logique de getAllSauces
//exemple : pour une route POST (créer une sauce), le contrôleur gère la logique du createSauce
//exemple : pour une route GET (afficher une sauce spécifique), le contrôleur gère la logique getOneSauce
//exemple : pour une route PUT (modifier une sauce), le contrôleur gère la logique modifySauce
//exemple: pour une route DELETE (supprimer une sauce), le contrôleur gère la logique deleteSauce
//exemple : pour une route POST (like et dislike), le contrôleur gère la logique like et dislike

const Sauce = require('../models/Sauce');
const fs = require('fs'); //on importe fs (file system) qui permet de modifier le système de fichiers

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

//logique métier de la route POST like et dislike
exports.likeSauce = (req, res, next) => {
    //on récupère le like/dislike du corps de la requête
    const like = req.body.like; //on récupère la valeur du champ like (1 pour like, -1 pour dislike et 0 pour annuler)
    const userId = req.body.userId; //on récupère l'ID de l'utilisateur effectuant l'action

    //on trouve la sauce avec l'ID spécifié
    Sauce.findOne({ _id: req.params.id }) //on trouve la sauce dans la BDD qui a l'ID correspondant à celui fourni dans l'URL
    .then(sauce => { //si la sauce est trouvée
        switch (like) { //l'instruction switch évalue une expression et selon le cas associé exécute les instructions correspondantes
            case 1: // l'utilisateur aime la sauce
            if (!sauce.usersLiked.includes(userId)) { //si l'ID de l'utilisateur ne figure pas dans le tableau des likes
                //alors on met à jour la sauce pour ajouter cet utilisateur au tableau usersLiked avec $push
                //et on incrémente le compteur des likes avec $inc
                Sauce.updateOne({_id: req.params.id}, {$push: {usersLiked: userId}, $inc: {likes: 1}})
                .then(() => {
                    console.log('Like ajouté !');
                    res.status(200).json({message: 'Like ajouté !'});
                })
                .catch(error => res.status(400).json({error}));
            }
            break; //l'instruction break permet de sortir de switch
            case 0: // l'utilisateur annule son like ou son dislike
            if (sauce.usersLiked.includes(userId)) { //si l'utilisateur avait précédemment liké la sauce
                //alors on met à jour la sauce en retirant l'utilisateur du tableau usersLiked avec $pull
                //et on diminue le compteur des likes de -1 avec $inc
                Sauce.updateOne({ _id: req.params.id }, {$pull: {usersLiked: userId}, $inc: {likes: -1}})
                    .then(() => {
                        console.log('Like annulé !');
                        res.status(200).json({message: 'Like annulé !'});
                    })
                    .catch(error => res.status(400).json({error}));
            } else if (sauce.usersDisliked.includes(userId)) { //sinon si l'utilisateur avait précédemment disliké la sauce
                // alors on met à jour la sauce en retirant l'utilisateur du tablea avec usersDisliked avec $pull
                //et on diminue le compteur des likes de -1 avec $inc
                Sauce.updateOne({ _id: req.params.id }, {$pull: {usersDisliked: userId}, $inc: {dislikes: -1}})
                    .then(() => {
                        console.log('Dislike annulé !');
                        res.status(200).json({message: 'Dislike annulé !'});
                    })
                    .catch(error => res.status(400).json({error}));
            }
            break; //l'instruction break permet de sortir de switch
            case -1: // l'utilisateur n'aime pas la sauce
            if (!sauce.usersDisliked.includes(userId)) { //si l'ID de l'utilisateur ne figure pas déjà dans la liste des dislikes
                //alors on met à jour la sauce pour ajouter à la liste usersDisliked avec $push
                //et on augmente le compteur de dislikes de 1 avec $inc
                Sauce.updateOne({ _id: req.params.id }, {$push: {usersDisliked: userId}, $inc: {dislikes: 1}})
                .then(() => {
                    console.log('Dislike ajouté !');
                    res.status(200).json({message: 'Dislike ajouté !'});
                })
                .catch(error => res.status(400).json({error}));
            }
            break; //l'instruction break permet de sortir de switch
            //on met un filet de sécurité avec l'instruction default
            //si la valeur de like n'est ni 1, ni 0, ni -1, alors le code exécute l'instruction default
            default:
            res.status(400).json({ message: 'Erreur, mauvaise requête' });
        }
    })
    .catch(error => res.status(500).json({ error }));
}
