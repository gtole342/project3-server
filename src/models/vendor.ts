import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import { Document, Model, model, Schema } from "mongoose";
dotenv.config();

export interface IVendorModel extends Document {
  appSecretProof: string;
  businessName: string;
  instagramAccessToken: string;
  instagramIdPage: string;
  phoneNumber: string;
  pinned: string[];
  website: string;
  decryptToken(token: string): string;
  encryptToken(token: string): string;
  getLongLivedToken(appId: string, appSecret: string, token: string): string;
}

export const VendorSchema: Schema = new Schema({
  appSecretProof: String,
  businessName: String,
  instagramAccessToken: String,
  instagramIdPage: String,
  phoneNumber: String,
  pinned: [String],
  website: String,
});

VendorSchema.pre<IVendorModel>("save", async function(next) {
  console.log(this.instagramAccessToken);
  if (process.env.APP_ID && process.env.APP_SECRET) {
    const longLivedTokenUrl = `https://graph.facebook.com/v4.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&fb_exchange_token=${this.instagramAccessToken}`;
    await axios.get(longLivedTokenUrl)
    .then((response) => {
      this.instagramAccessToken = response.data.access_token;
      const facebookIdPageUrl = `https://graph.facebook.com/v4.0/me/accounts?access_token=${this.instagramAccessToken}`;
      axios.get(facebookIdPageUrl)
      .then((response) => {
        console.log(response.data[0].id);
        const pageId = response.data[0].id;
        const instagramIdPageUrl = `https://graph.facebook.com/v4.0/${pageId}?fields=instagram_business_account&access_token=${this.instagramAccessToken}`;
        axios.get(instagramIdPageUrl)
        .then((response) => {
          console.log("instagramIdPage", response.data.instagram_business_account.id)
          this.instagramIdPage = response.data.instagram_business_account.id;
        })
        .catch((err) => {
          console.log("Error getting Instagram Page Id");
        });
      })
      .catch((err) => {
        console.log("Error getting Facebook Page Id");
      });
    })
    .catch((err) => {
      console.log("Error getting long-lived token");
    });
    next();
  }
});

VendorSchema.methods.encryptToken = (token: string): string => {
  const key = crypto.scryptSync(process.env.CRYPTO_KEY || "", "salt", 24);
  const iv = Buffer.alloc(16, 0);
  const myKey: crypto.Cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  let encStr = myKey.update(token, "utf8", "hex");
  encStr += myKey.final("hex");
  return encStr;
};

VendorSchema.methods.decryptToken = (encryptedToken: string): string => {
  const key = crypto.scryptSync(process.env.CRYPTO_KEY || "", "salt", 24);
  const iv = Buffer.alloc(16, 0);
  const myKey = crypto.createDecipheriv("aes-192-cbc", key, iv);
  let clearStr = myKey.update(encryptedToken, "hex", "utf8");
  clearStr += myKey.final("utf8");
  return clearStr;
};

VendorSchema.methods.getLongLivedToken = async (appId: string, appSecret: string, token: string) => {
  const url = `https://graph.facebook.com/v4.0/oauth/access_token?grant_type=fb_exchange_tokenclient_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${token}`;
  const longLivedToken = await axios.get(url)
  .then((response) => {
    return response.data.access_token;
  })
  .catch((err) => {
    console.log(err, "Error getting long-lived token");
  });
  return longLivedToken;
};

export const Vendor: Model<IVendorModel> = model<IVendorModel>("Vendor", VendorSchema);
