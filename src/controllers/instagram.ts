import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { sha256 } from "js-sha256";

import { User } from "../models";

const router = express.Router();
dotenv.config();

const accessToken = "EAAHEmPLN9ZAYBAEP1gGFqmNImgsFY5RrKUMCgb0xUjBC30YVBOz4UAXlxgGn4YoQZADjM8ZBApyvlgtWKz29iTbwvIGhhbkPZASt4WjyyKLY8CQXuGmrTLmLoJKj1d4UH0lwboZBwm29eT9Cro53ZACGnFVyYquaIEoeRZAyZBT90AaHOufT8RqJOaQWZBkLX0ZBB2x7AM7y55DU3adcK7uL8H";
const BASE_URL = "https://graph.facebook.com/v4.0/";

const getAppSecretProof = (token: string, appSecret: string): string => {
  return sha256.hmac(appSecret, token);
};

const makeApiCall = async (url: string, errorMessage: string, callback: any) => {
  return  await axios.get(url)
  .then((response) => {
    return callback(response);
  })
  .catch((err) => {
    console.log(errorMessage, err);
  });
};

const getOneInstagramPost = async (req, res) => {
  const user = await User.findById(req.params.userId)
    .then((userDoc) => {
      return userDoc;
    })
    .catch((err) => {
      console.log(err, "Error getting User");
    });
  if (user) {
    let appSecretProof: string = "";
    if (process.env.APP_SECRET) {
      appSecretProof = getAppSecretProof(accessToken, process.env.APP_SECRET);
    }
    const url = BASE_URL + req.params.workId + "?fields=id,media_type,media_url,timestamp&access_token=" + accessToken + "&appsecret_proof=" + appSecretProof;
    makeApiCall(url, "Error gettting media metadata", (response) => {
      res.send(response.data);
    });
  }
};

router.get("/user/:userId/:workId", getOneInstagramPost);

export default router;
