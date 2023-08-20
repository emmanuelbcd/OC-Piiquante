//Avant de stocker des données dans la base de données MongoDB,
//on utilise Mongosse pour définfir des modèles.
//Ce modèle permet de structurer les données (par exemple, un utilisateur) avec un certain format / schéma.

const mongoose = require('mongoose');

//on ajoute mongoose-unique-validator comme plugin à notre schéma
const uniqueValidator = require('mongoose-unique-validator'); //on vérifie que l'email est unique lors de l'enregistrement d'un nouvel utilisateur

const userSchema = mongoose.Schema({
    //avec unique = true, impossible de s'inscrire plusieurs fois avec la même adresse mail
    email: {type: String, required: true, unique: true}, 
    password : {type: String, required: true} //le mot de passe crypté est de type string
});

userSchema.plugin(uniqueValidator);

//on exporte userSchema sous forme de modèle
module.exports = mongoose.model('User', userSchema);