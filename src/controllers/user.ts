import express from "express";

import { User } from "../models";

const router = express.Router();

router.get("/users", (req, res) => {
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

// GET PINNED /v1/users/:id/pinned
router.get("/:id/pinned", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).send(user.vendor.pinned);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

// POST PINNED /v1/users/:id/pinned/add
router.post("/:id/pinned/add", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        const pins: string[] = user.vendor.pinned;
        pins.push(req.body.postId);
        user.updateOne({
          vendor: {
            pinned: pins,
          },
        })
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Server error while attempting to add a pinned item" });
          });
      } else {
        res.status(500).send({ message: "User not found for adding pinned items" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Server error while attempting to find a user" });
    });
});

// DELETE PINNED /v1/users/:id/pinned/remove
router.delete("/:id/pinned/remove", (req, res) => {
  User.findById(req.params.id)
  .then((user) => {
    if (user) {
      const pins: string[] = user.vendor.pinned;
      const item: string = req.body.postId;
      const itemIndex: number = pins.indexOf(item);
      if (itemIndex > -1) {
        pins.splice(itemIndex, 1);
        user.updateOne({
          vendor: {
            pinned: pins,
          },
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

export default router;
