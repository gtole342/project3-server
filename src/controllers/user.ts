import express from "express";

import { User } from "../models";

const router = express.Router();

router.get("/user", (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(503).send({ message: "Error! Can't get anything from the db" });
    });
});

// GET FAVORITE ARTISTS /v1/users/favoriteArtists
router.get("/:id/favoriteArtists", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).send(user.favoriteArtists);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

// POST FAVORITES ARTISTS /v1/users/:id/favoriteArtists/add
router.post("/:id/favoriteArtists/add", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        const faves: string[] = user.favoriteArtists;
        faves.push(req.body.artistId);
        user.updateOne({
          favoriteArtists: faves,
        })
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Server error while attempting to add a favorite" });
          });
      } else {
        res.status(500).send({ message: "User not found for adding favorites" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

// DELETE FAVORITES ARTISTS /v1/users/:id/favoritesArtists/remove
router.delete("/:id/favoriteArtists/remove", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        const faves: string[] = user.favoriteArtists;
        const item: string = req.body.artistId;
        const itemIndex: number = faves.indexOf(item);
        if (itemIndex > -1) {
          faves.splice(itemIndex, 1);
          console.log(faves);
          console.log(itemIndex);
          user.updateOne({
            favoriteArtists: faves,
          })
            .then((result) => {
              res.status(200).send(result);
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ message: "Server error while attempting to add a favorite" });
            });
        } else {
          res.status(500).send({ message: "Couldn't find favorite to remove" });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

// GET FAVORITE WORKS /v1/users/:id/favoriteWorks
router.get("/:id/favoriteWorks", (req, res) => {
  User.findById(req.params.id)
  .then((user) => {
    if (user) {
     res.status(200).send(user.favoriteWorks);
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send({ message: "Server error while attempting to find a user" });
  });
});

// POST FAVORITE WORKS /v1/users/:id/favoriteWorks/add
router.post("/:id/favoriteWorks/add", (req, res) => {
  User.findById(req.params.id)
  .then((user) => {
    if (user) {
      const faves: [{ artistId: string, postId: string }] = user.favoriteWorks;
      faves.push({
        artistId: req.body.artistId,
        postId: req.body.postId,
      });
      user.updateOne({
        favoriteWorks: faves,
      })
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Server error while attempting to add a favorite" });
        });
    } else {
      res.status(500).send({ message: "User not found for adding favorites" });
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send({ message: "Server error while attempting to find a user" });
  });
});

// DELETE FAVORITE WORKS /v1/users/:id/favoriteWorks/remove
router.delete("/:id/favoriteWorks/remove", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        const faves: [{ artistId: string, postId: string }] = user.favoriteWorks;
        const item: string = req.body.postId;
        for (let i = 0; i < faves.length; i++) {
          if (faves[i].postId === item) {
            faves.splice(i, 1);
          } else {
            res.status(500).send({ message: "Couldn't find favorite to remove" });
          }
        }
        user.updateOne({
          favoriteWorks: faves,
        })
        .then((result) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Server error while attempting to add a favorite" });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

export default router;
