const Sauce = require('../models/Sauce'); // On importe le modèle `Sauce` pour interagir avec la base de données.
const fs = require('fs'); // On importe le module `fs` pour gérer les fichiers sur le système de fichiers local.

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // On récupère les données de la sauce envoyées par l'utilisateur.
  delete sauceObject._id; // On supprime l'attribut `_id` de l'objet `sauceObject`.
  const sauce = new Sauce({
    // On crée un nouvel objet `sauce`.
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`, // On ajoute l'URL de l'image de la sauce à l'objet `sauce`.
  });
  sauce
    .save() // On enregistre l'objet `sauce` dans la base de données.
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' })) // Si l'enregistrement est réussi, on renvoie une réponse avec un code de statut 201 et un message JSON indiquant que la sauce a été enregistrée.
    .catch((error) => res.status(400).json({ error })); // Si une erreur se produit lors de l'enregistrement, on renvoie une réponse avec un code de statut 400 et un message JSON contenant des informations sur l'erreur.
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id, // On recherche une sauce dans la base de données à partir de l'ID passé dans la requête.
  })
    .then((sauce) => {
      res.status(200).json(sauce); // Si on trouve une sauce correspondante, on renvoie une réponse avec un code de statut 200 et un objet JSON contenant la sauce.
    })
    .catch((error) => {
      res.status(404).json({
        // Si aucune sauce n'a été trouvée, on renvoie une réponse avec un code de statut 404 et un message JSON contenant des informations sur l'erreur.
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  let sauceObject = {}; // On initialise un objet vide pour stocker les données de la sauce modifiée.

  if (req.file) {
    // Si une nouvelle image est fournie, on doit supprimer l'ancienne image.
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1]; // On récupère le nom de fichier de l'image actuelle.
      fs.unlinkSync(`images/${filename}`); // On supprime l'image actuelle du serveur.
    });
    sauceObject = {
      // On met à jour l'objet sauceObject avec les données de la sauce et l'URL de la nouvelle image.
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
    };
  } else {
    // Sinon, on met simplement à jour l'objet sauceObject avec les données de la sauce provenant de la requête.
    sauceObject = { ...req.body };
  }

  Sauce.updateOne(
    // On met à jour la sauce dans la base de données à l'aide de la méthode updateOne() de Mongoose.
    { _id: req.params.id }, // On recherche la sauce à modifier à partir de l'ID de la requête.
    { ...sauceObject, _id: req.params.id } // On met à jour les propriétés de la sauce en utilisant les données contenues dans sauceObject.
  )
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' })) // Si la modification a réussi, on renvoie une réponse avec un code de statut 200 et un message JSON.
    .catch((error) => res.status(400).json({ error })); // Si la modification a échoué, on renvoie une réponse avec un code de statut 400 et un message JSON contenant des informations sur l'erreur.
};

// Cette fonction est exportée pour être utilisée dans d'autres fichiers
exports.deleteSauce = (req, res, next) => {
  // Recherche la sauce avec l'id correspondant dans la base de données
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Récupère le nom de fichier de l'image à supprimer à partir de l'URL de l'image
      const filename = sauce.imageUrl.split('/images/')[1];
      // Supprime le fichier image du répertoire "images"
      fs.unlink(`images/${filename}`, () => {
        // Supprime la sauce de la base de données
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' })) // Renvoie une réponse 200 si la suppression est réussie
          .catch((error) => res.status(400).json({ error })); // Renvoie une réponse 400 si la suppression échoue
      });
    })
    .catch((error) => res.status(500).json({ error })); // Renvoie une réponse 500 si une erreur interne du serveur se produit
};

// Cette fonction est exportée pour être utilisée dans d'autres fichiers
exports.getAllSauces = (req, res, next) => {
  // Recherche toutes les sauces dans la base de données
  Sauce.find()
    .then((sauces) => {
      // Renvoie toutes les sauces sous forme de réponse JSON
      res.status(200).json(sauces);
    })
    .catch((error) => {
      // Renvoie une réponse 400 avec un objet JSON contenant une clé "error" si une erreur se produit
      res.status(400).json({
        error: error,
      });
    });
};

// Cette fonction est exportée pour être utilisée dans d'autres fichiers
exports.likesSauce = (req, res, next) => {
  // Si l'utilisateur a aimé la sauce
  if (req.body.like === 1) {
    // Met à jour la sauce avec le nouvel utilisateur qui a aimé la sauce et incrémente le compteur de likes
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $addToSet: { usersLiked: req.auth.userId },
        $inc: { likes: 1 },
      }
    )
      .then(() => res.status(200).json({ message: 'Like ajouté.' })) // Renvoie une réponse 200 avec un message si la mise à jour réussit
      .catch((error) => res.status(400).json({ error })); // Renvoie une réponse 400 avec une erreur si la mise à jour échoue
  }
  // Si l'utilisateur n'a pas aimé la sauce
  else if (req.body.like === -1) {
    // Met à jour la sauce avec le nouvel utilisateur qui n'a pas aimé la sauce et incrémente le compteur de dislikes
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $addToSet: { usersDisliked: req.auth.userId },
        $inc: { dislikes: 1 },
      }
    )
      .then(() => res.status(200).json({ message: 'Dislike ajouté.' })) // Renvoie une réponse 200 avec un message si la mise à jour réussit
      .catch((error) => res.status(400).json({ error })); // Renvoie une réponse 400 avec une erreur si la mise à jour échoue
  } else if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id }) // On cherche la sauce concernée par l'identifiant fourni dans la requête
      .then((sauce) => {
        // Si on trouve la sauce, on exécute la fonction suivante
        if (sauce.usersLiked.includes(req.auth.userId)) {
          // Si l'utilisateur a aimé la sauce précédemment
          Sauce.updateOne(
            // On met à jour la sauce en retirant l'utilisateur de la liste des utilisateurs ayant aimé la sauce et en décrémentant le compteur de likes
            { _id: req.params.id },
            {
              $pull: { usersLiked: req.auth.userId },
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Like retiré.' })) // On renvoie une réponse 200 avec un message si la mise à jour réussit
            .catch((error) => res.status(400).json({ error })); // On renvoie une réponse 400 avec une erreur si la mise à jour échoue
        } else if (sauce.usersDisliked.includes(req.auth.userId)) {
          // Sinon, si l'utilisateur a précédemment disliké la sauce
          Sauce.updateOne(
            // On met à jour la sauce en retirant l'utilisateur de la liste des utilisateurs ayant disliké la sauce et en décrémentant le compteur de dislikes
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.auth.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Dislike retiré.' })) // On renvoie une réponse 200 avec un message si la mise à jour réussit
            .catch((error) => res.status(400).json({ error })); // On renvoie une réponse 400 avec une erreur si la mise à jour échoue
        }
      })
      .catch((error) => res.status(404).json({ error })); // Si la sauce n'existe pas, on renvoie une réponse 404 avec une erreur
  }
};
