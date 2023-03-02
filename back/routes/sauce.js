const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sauceCtrl = require("../controllers/sauce");
// Route pour récupérer toutes les sauces
router.get("/", auth, sauceCtrl.getAllSauces);
// Route pour créer une nouvelle sauce
router.post("/", auth, multer, sauceCtrl.createSauce);
// Route pour récupérer une sauce spécifique par son identifiant
router.get("/:id", auth, sauceCtrl.getOneSauce);
// Route pour mettre à jour une sauce existante
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
// Route pour supprimer une sauce existante
router.delete("/:id", auth, sauceCtrl.deleteSauce);
// Route pour ajouter ou retirer un like à une sauce
router.post("/:id/like", auth, sauceCtrl.likesSauce);

module.exports = router;
