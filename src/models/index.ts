import mongoose from "mongoose";
import { IUserModel, User } from "./user";

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/InkTrail", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { IUserModel, User };
