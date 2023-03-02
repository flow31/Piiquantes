const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = (req, res, next) => {
  // On utilise la méthode hash de bcrypt pour hasher le mot de passe de l'utilisateur.
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // On crée un nouvel utilisateur avec l'email et le mot de passe hashé.
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // On sauvegarde le nouvel utilisateur dans la base de données.
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      // En cas d'erreur, on renvoie une erreur 500 avec l'erreur renvoyée par bcrypt.
      res.status(500).json({ error });
    });
};

exports.login = (req, res, next) => {
  // On recherche l'utilisateur dans la base de données en utilisant son adresse email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        // Si aucun utilisateur correspondant n'a été trouvé, on retourne une erreur 401
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      // Si un utilisateur correspondant a été trouvé, on compare le mot de passe entré avec le mot de passe hashé stocké dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            // Si les mots de passe ne correspondent pas, on retourne une erreur 401
            return res
              .status(401)
              .json({ message: "Mot de passe incorrect !" });
          }
          // Si les mots de passe correspondent, on renvoie un objet JSON contenant l'ID de l'utilisateur et un jeton d'authentification valide pendant 24 heures
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => {
          // Si une erreur se produit lors de la comparaison des mots de passe, on retourne une erreur 500
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      // Si une erreur se produit lors de la recherche de l'utilisateur dans la base de données, on retourne une erreur 500
      res.status(500).json({ error });
    });
};
