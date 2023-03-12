const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');
// Route pour récupérer toutes les sauces
router.get('/', authenticateUser, sauceCtrl.getAllSauces);
// Route pour créer une nouvelle sauce
router.post('/', authenticateUser, multer, sauceCtrl.createSauce);
// Route pour récupérer une sauce spécifique par son identifiant
router.get('/:id', authenticateUser, sauceCtrl.getOneSauce);
// Route pour mettre à jour une sauce existante
router.put('/:id', authenticateUser, multer, sauceCtrl.modifySauce);
// Route pour supprimer une sauce existante
router.delete('/:id', authenticateUser, sauceCtrl.deleteSauce);
// Route pour ajouter ou retirer un like à une sauce
router.post('/:id/like', authenticateUser, sauceCtrl.likesSauce);

module.exports = router;
