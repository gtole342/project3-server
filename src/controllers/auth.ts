import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

import { User } from "../models";

const router = express.Router();
dotenv.config();

router.post("/login", (req, res) => {
  User.findOne({email: req.body.email})
  .then((user) => {
    if (!user || !user.password) {
      return res.status(404).send({ message: "User not found"});
    }
    if ( !user.isAuthenticated(req.body.password)) {
      return res.status(406).send({ message: "Not Acceptable: Invalid Credentials!"});
    }
    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET || "", {
      expiresIn: 60 * 60 * 8,
    });
    res.send({ token });
  })
  .catch((err) => {
    console.log("Error in POST /auth/login", err);
    res.status(503).send({ message: "Something wrong, prob DB related. Or you made a type. One of those."});
  });
});

router.post("/signup", (req, res) => {
  console.log("Getting here");
  User.findOne({
    email: req.body.email,
  })
  .then((user) => {
    if (user) {
      return res.status(409).send({ message: "Email address in use "});
    }
    if (req.body.isVendor) {
      User.create({
        email: req.body.email,
        firstname: req.body.firstname,
        isVendor: req.body.isVendor,
        lastname: req.body.lastname,
        password: req.body.password,
        vendor: {
          address: {
            city: req.body.city,
            country: req.body.country,
            state: req.body.state,
            street: req.body.street,
            streetNumber: req.body.streetNumber,
            streetSuffix: req.body.streetSuffix,
            zipcode: req.body.zipcode,
          },
          businessName: req.body.businessName,
          instagramAccessToken: req.body.instagramAccessToken,
          instagramIdPage: req.body.instagramIdPage,
          phoneNumber: req.body.phoneNumber,
          website: req.body.website,
        },
      })
      .then((newUser) => {
        console.log(newUser, "new user");
        const token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET || "", {
          expiresIn: 60 * 60 * 8,
        });
        res.send({ token });
      })
      .catch((err) => {
        console.log("Error when creating new user", err);
        res.status(500).send({ message: "Error creating user"});
      });
    } else {
      User.create({
        email: req.body.email,
        firstname: req.body.firstname,
        isVendor: req.body.isVendor,
        lastname: req.body.lastname,
        password: req.body.password,
      })
      .then((newUser) => {
        console.log(newUser, "new user");
        const token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET || "", {
          expiresIn: 60 * 60 * 8,
        });
        res.send({ token });
      })
      .catch((err) => {
        console.log("Error when creating new user", err);
        res.status(500).send({ message: "Error creating user"});
      });
    }
  })
  .catch((err) => {
    console.log("Error in POST /auth/signup", err);
    res.status(503).send({ message: "Something wrong, prob DB related. Or you made a typo. One of those." });
  });
});

router.get("/current/user", (req: any, res) => {
  console.log(req.user);
  if (!req.user || !req.user._id) {
    return res.status(417).send({ message: "Check configuration" });
  }
  res.send({ user: req.user });
});

export default router;
