require('dotenv').config();

const jwt = require('jsonwebtoken');

// Validation d'email
const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = req.body.email;

  if (!emailRegex.test(email)) {
    // L'email est invalide
    return res.status(400).json({ error: 'Adresse email invalide' });
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
        'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre minuscule, une lettre majuscule et un chiffre',
    });
  }

  // Le mot de passe est valide, appeler la fonction suivante
  next();
};

// Middleware d'authentification avec JSON Web Token (JWT)
const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    // Décodage du token avec la clé secrète
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    // Récupération de l'identifiant de l'utilisateur depuis le token décodé

    const userId = decodedToken.userId;
    // Ajout de l'identifiant de l'utilisateur à l'objet de requête pour utilisation dans les middleware suivants

    req.auth = {
      userId: userId,
    };
    next();
    // Si le token est invalide, retourne une réponse d'erreur 401
  } catch (error) {
    res.status(401).json({ message: 'Authentification nécessaire.' });
  }
};

module.exports = { validateEmail, validatePassword, authenticateUser };
