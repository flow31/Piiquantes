const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

// Validation d'email
const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = req.body.email;

  if (!emailRegex.test(email)) {
    // L'email est invalide
    return res.status(400).json({ error: "Adresse email invalide" });
  }

  // L'email est valide, appeler la fonction suivante
  next();
};

// Validation de mot de passe fort
const validatePassword = (req, res, next) => {
  const password = req.body.password;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!passwordRegex.test(password)) {
    // Le mot de passe est invalide
    return res.status(400).json({
      error:
        "Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre minuscule, une lettre majuscule et un chiffre",
    });
  }

  // Le mot de passe est valide, appeler la fonction suivante
  next();
};

// Route POST /signup qui utilise les fonctions middleware de validation d'email et de mot de passe fort
router.post("/signup", validateEmail, validatePassword, userCtrl.signup);

// Route POST /login
router.post("/login", userCtrl.login);

module.exports = router;
