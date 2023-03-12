const Sauce = require('../models/Sauce'); // On importe le modèle `Sauce` pour interagir avec la base de données.
const fs = require('fs'); // On importe le module `fs` pour gérer les fichiers sur le système de fichiers local.

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject.userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId, // Ajout de l'ID de l'utilisateur à l'objet `sauce`.
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
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

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce non trouvée !' });
      }

      // Vérifie que l'utilisateur est bien l'auteur de la sauce
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: "Vous n'êtes pas autorisé à modifier cette sauce !",
        });
      }

      if (req.file) {
        // Si une nouvelle image est fournie, on doit supprimer l'ancienne image.
        const filename = sauce.imageUrl.split('/images/')[1]; // On récupère le nom de fichier de l'image actuelle.
        fs.unlink(`images/${filename}`, () => {
          // On supprime l'image actuelle du serveur.
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

      // Met à jour la sauce dans la base de données à l'aide de la méthode updateOne() de Mongoose.
      Sauce.updateOne(
        { _id: req.params.id }, // On recherche la sauce à modifier à partir de l'ID de la requête.
        { ...sauceObject, _id: req.params.id } // On met à jour les propriétés de la sauce en utilisant les données contenues dans sauceObject.
      )
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' })) // Si la modification a réussi, on renvoie une réponse avec un code de statut 200 et un message JSON.
        .catch((error) => res.status(400).json({ error })); // Si la modification a échoué, on renvoie une réponse avec un code de statut 400 et un message JSON contenant des informations sur l'erreur.
    })
    .catch((error) => res.status(500).json({ error })); // Renvoie une réponse 500 si une erreur interne du serveur se produit
};

exports.deleteSauce = (req, res, next) => {
  // Recherche la sauce avec l'id correspondant dans la base de données
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce non trouvée !' });
      }
      // Vérifie que l'utilisateur est bien l'auteur de la sauce
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: "Vous n'êtes pas autorisé à supprimer cette sauce !",
        });
      }
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

exports.likesSauce = (req, res, next) => {
  // Cherche la sauce correspondante dans la base de données
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si l'utilisateur like et n'a pas déjà liké la sauce
      if (
        req.body.like === 1 &&
        !sauce.usersLiked.includes(req.auth.userId) &&
        !sauce.usersDisLiked.includes(req.auth.userId)
      ) {
        // Ajoute l'utilisateur à la liste des utilisateurs ayant liké la sauce et incrémente le compteur de likes
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $addToSet: { usersLiked: req.auth.userId },
            $inc: { likes: 1 },
          }
        )
          .then(() => res.status(200).json({ message: 'Like ajouté.' }))
          .catch((error) => res.status(400).json({ error }));
        // Si l'utilisateur dislike et n'a pas déjà disliké la sauce
      } else if (
        req.body.like === -1 &&
        !sauce.usersDisliked.includes(req.auth.userId)
      ) {
        // Ajoute l'utilisateur à la liste des utilisateurs ayant disliké la sauce et incrémente le compteur de dislikes
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $addToSet: { usersDisliked: req.auth.userId },
            $inc: { dislikes: 1 },
          }
        )
          .then(() => res.status(200).json({ message: 'Dislike ajouté.' }))
          .catch((error) => res.status(400).json({ error }));
        // Si l'utilisateur retire son like ou dislike
      } else if (req.body.like === 0) {
        // Si l'utilisateur avait liké la sauce
        if (sauce.usersLiked.includes(req.auth.userId)) {
          // Retire l'utilisateur de la liste des utilisateurs ayant liké la sauce et décrémente le compteur de likes
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersLiked: req.auth.userId },
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Like retiré.' }))
            .catch((error) => res.status(400).json({ error }));
          // Si l'utilisateur avait disliké la sauce
        } else if (sauce.usersDisliked.includes(req.auth.userId)) {
          // Retire l'utilisateur de la liste des utilisateurs ayant disliké la sauce et décrémente le compteur de dislikes
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.auth.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Dislike retiré.' }))
            .catch((error) => res.status(400).json({ error }));
        }
        // Si la requête n'est pas valide
      } else {
        res.status(400).json({ error: 'Requête invalide' });
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
