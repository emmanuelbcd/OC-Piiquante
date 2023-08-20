//Avant de stocker des données dans la base de données MongoDB,
//on utilise Mongosse pour définfir des modèles.
//Ce modèle permet de structurer les données (par exemple, une sauce) avec un certain format / schéma.

const mongoose = require('mongoose');

//on crée un schéma de données pour notre bdd MongoDB
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: [] }, //par défaut, le champ du tableau est vide pour s'assurer qu'il ne sera pas undefined
    usersDisliked: { type: [String], default: [] } //par défaut, le champ du tableau est vide pour s'assurer qu'il ne sera pas undefined
  });
  
  module.exports = mongoose.model('Sauce', sauceSchema);