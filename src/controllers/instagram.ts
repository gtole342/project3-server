import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { sha256 } from "js-sha256";

import { User } from "../models";

const router = express.Router();
dotenv.config();

let accessToken = "";
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

const getAllInstagramPosts = async (req, res) => {
  let postIdList: any[] = [];
  let postPromises: any[] = [];
  const user = await User.findById(req.params.userId)
    .then((userDoc) => {
      return userDoc;
    })
    .catch((err) => {
      console.log(err, "Error getting User");
    });
  if (user) {
    accessToken = user.vendor.decryptToken(user.vendor.instagramAccessToken);
    if (process.env.APP_SECRET) {
      user.vendor.appSecretProof = getAppSecretProof(accessToken, process.env.APP_SECRET);
    }
    const mediaListURL = BASE_URL +
                         user.vendor.instagramIdPage +
                         "/media?access_token=" +
                         accessToken;
    postIdList = await makeApiCall(mediaListURL, "Error with getting media list", (response) => {
      return response.data.data;
    });
    postPromises = postIdList.map(async (post) => {
      // tslint:disable-next-line: max-line-length
      const mediaDataURL = BASE_URL + post.id + "?fields=id,media_type,media_url,timestamp&access_token=" + accessToken + "&appsecret_proof=" + user.vendor.appSecretProof;
      return makeApiCall(mediaDataURL, "Error getting Media data", (response: any) => response.data);
    });
  }
  const postsArray: any[] = [];
  axios.all(postPromises)
  .then(axios.spread((...posts) => {
    for (const post of posts) {
      postsArray.push(post);
    }
  }))
  .then(() => {
      res.send({ message: postsArray });
  })
  .catch((err) => {
      console.log(err, "Error resolving media metadata promises");
  });
}

const getOneInstagramPost = async (req, res) => {
  const user = await User.findById(req.params.userId)
    .then((userDoc) => {
      return userDoc;
    })
    .catch((err) => {
      console.log(err, "Error getting User");
    });
  if (user) {
    accessToken = user.vendor.instagramAccessToken;
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

const getFrontpageInstagramPosts = async (req, res) => {
  const users = await User.find({ vendor: { $exists: true }});
  const postIdList = await Promise.all(users.map(async (user) => {
    if (user) {
      accessToken = user.vendor.instagramAccessToken;
      if (process.env.APP_SECRET) {
        user.vendor.appSecretProof = getAppSecretProof(accessToken, process.env.APP_SECRET);
      }
      // tslint:disable-next-line: max-line-length
      console.log(user.vendor)
      const mediaIdUrl = BASE_URL + user.vendor.instagramIdPage + "/media?access_token=" + accessToken;
      const postId = await makeApiCall(mediaIdUrl, "Error getting Media id", (response) => {
        return response.data.data[0].id;
      });
      return {
        accessToken: user.vendor.instagramAccessToken,
        appSecretProof: user.vendor.appSecretProof,
        postId,
      };
    }
  }));
  console.log(postIdList);
  const postPromises = postIdList.map( async (post) => {
    if (post) {
      const mediaDataURL = BASE_URL + post.postId + "?fields=id,media_type,media_url,timestamp&access_token=" +
                          post.accessToken + "&appsecret_proof=" + post.appSecretProof;
      return makeApiCall(mediaDataURL, "Error getting Media data", (response) => response.data );
    }
  });
  const postsArray: any[] = [];
  axios.all(postPromises)
  .then(axios.spread((...posts) => {
    for (const post of posts) {
      postsArray.push(post);
    }
  }))
  .then(() => {
    res.send({message: postsArray });
  })
  .catch((err) => {
    console.log(err, "Error resolving media metadata promises");
  });
};
router.get("/user/:userId", getAllInstagramPosts);
router.get("/user/:userId/:workId", getOneInstagramPost);
router.get("/frontpage", getFrontpageInstagramPosts);

export default router;
