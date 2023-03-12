const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const { validateEmail, validatePassword } = require('../middleware/auth');

// Route POST /signup qui utilise les fonctions middleware de validation d'email et de mot de passe fort
router.post('/signup', validateEmail, validatePassword, userCtrl.signup);

// Route POST /login
router.post('/login', userCtrl.login);

module.exports = router;
