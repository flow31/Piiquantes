require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
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
