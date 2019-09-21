import express from "express";

import { User } from "../models";

const router = express.Router();

router.get("/user", (req, res) => {
  User.find()
  .then((users) => {
    console.log(users)
    res.send(users);
  })
  .catch( (err) => {
    console.log(err);
    res.status(503).send({ message: "Error! Can't get anything from the db" });
  });
});

export default router;
