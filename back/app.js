require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

const path = require("path");

// Utilisation de l'analyseur de corps pour les demandes entrantes au format JSON
app.use(express.json());

// Ajout d'un gestionnaire d'erreurs MongoDB personnalisé pour les erreurs de validation
mongoose.plugin(mongodbErrorHandler);

// Activation de la restriction des requêtes strictes pour éviter les erreurs de validation silencieuses
mongoose.set("strictQuery", true);

// Connexion à la base de données MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y7deh3e.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie!"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Configuration des en-têtes CORS pour permettre l'accès à l'API depuis n'importe quelle origine
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Configuration des routes utilisateur
app.use("/api/auth", userRoutes);

// Configuration des routes de sauce
app.use("/api/sauces", sauceRoutes);

// Configuration du dossier des images statiques
app.use("/images", express.static(path.join(__dirname, "images")));

// Export de l'application pour utilisation dans le fichier de démarrage du serveur
module.exports = app;
