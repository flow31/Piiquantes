const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
// Schéma de données pour les utilisateurs

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
// Utilise le plugin Mongoose unique-validator pour s'assurer que l'adresse mail est unique dans la base de données

userSchema.plugin(uniqueValidator);
// Exporte le modèle de données utilisateur
module.exports = mongoose.model("User", userSchema);
