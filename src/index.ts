import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressJwt from "express-jwt";

import auth from "./controllers/auth";
import instagram from "./controllers/instagram";
import user from "./controllers/user";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
dotenv.config();

app.use("/v1/auth", auth);
app.use("/v1/instagram", instagram);
app.use("/v1/users", user);

app.get("*", (req, res) => {
  res.status(404).send({ message: "Resource not found" });
});

app.listen(process.env.PORT || 3001, () => {
  // tslint:disable-next-line: no-console
  console.log("Listening on port", process.env.PORT || 3001);
});
