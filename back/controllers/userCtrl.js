//une fois la route identifiée, l'action se déplace vers le contrôleur.
//ce sont des fonctions spécifiques à chaque route.
//exemple : pour une route de création d'utilisateur, le contrôleur gère la logique de signup
//exemple : pour une route de d'authentification, le contrôleur gère la logique de login

const bcrypt = require('bcrypt');  // importation du package bcrypt
const jwt = require('jsonwebtoken'); //importation de jsonwebtoken
const User = require('../models/User');

// fonction signup : on enregistre de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email et mot de passe requis !' });
    }
    
    bcrypt.hash(req.body.password, 10) //on appelle la fonction de hachage de bcrypt dans notre mdp et on lui demande de saler le mdp 10 fois
        .then(hash => { //on récupère le hash de mdp
            const user = new User({ //on crée un utilisateur
                email: req.body.email, // on passe l'adresse qui est fournie dans le corps de la requête
                password: hash //on enregistre le hash qui est créé plus haut pour mdp
            });
            user.save() //on enregistre l'utilisateur dans la base de données
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'})) //on renvoie un 201 pour une création de ressource
                .catch(error => { 
                    console.log(error);
                    res.status(400).json({ error }); 
                })
        })
        .catch(error => { 
            console.log(error);
            res.status(500).json({ error }); 
        }) // on va capter l'erreur (500 = err serveur)
};

//fonction login : on vérifie si un utilisateur existe dans notre BDD et si le mdp transmis correspond à cet utilisateur
exports.login = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email et mot de passe requis !' });
    }
    
    User.findOne({email: req.body.email}) // on utilise la méthode findOne de notre class User et on lui passe un objet qui va nous servir de filtre
    .then(user => { //on récupère la valeur qui a été trouvée par notre requête
        if (user === null) { //si elle est nulle, notre utilisateur n'existe pas dans notre BDD
            return res.status(401).json({ message: 'paire identifiant/mot de passe incorrecte' }); //on retourne une erreur 401 avec un message volontairement flou

        } else { //sinon l'utilisateur est enregistré dans notre base de données
            bcrypt.compare(req.body.password, user.password) //on compare le MDP qui nous a été transmis par le client avec ce qui est stocké dans notre BDD
            .then(valid => { //on regarde ce qui nous a été retourné
                if (!valid) { //s'il s'agit de false
                    return res.status(401).json({message: 'paire identifiant/mot de passe incorrecte'}); //c'est une erreur d'authentification, le MDP transmis n'est pas correct
                } else { //sinon le MDP est correct
                    res.status(200).json({ // on retourne un code 200 avec un objet qui va contenir les infos nécessaires à l'authentification des requêtes qui seront émises par la suite par notre client
                        userId: user._id,
                        token: jwt.sign( //on appelle la fonction sign de jwt pour chiffrer un nouveau token
                            { userId: user._id}, //1er argument : le token contient l'ID de l'utilisateur en tant que payload
                            process.env.JWT_SECRET, //2nd argument : on utilise une chaîne secrète temporaire pour crypter notre token
                            { expiresIn: '24h'} //3ème argument : on définit une durée de validité du token
                        ) 
                    }); 
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).json( {error} );
            })
        }
    })
    .catch(error => { //erreur d'exécution de requête dans la BDD
        console.log(error);
        res.status(500).json( {error} ); //on retourne une erreur 500 càd une erreur serveur
    }) 
};
