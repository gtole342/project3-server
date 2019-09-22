import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import expressJwt from "express-jwt";

import auth from "./controllers/auth";
import instagram from "./controllers/instagram";
import user from "./controllers/user";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));
app.use(cors());
dotenv.config();

app.use("/v1/auth", expressJwt({
  secret: process.env.JWT_SECRET || "",
}).unless({
  path: [
    { url: "/v1/auth/login", methods: ["POST"]},
    { url: "/v1/auth/signup", methods: ["POST"]},
  ],
}), auth);

app.use("/v1/instagram", instagram);

app.use("/v1/users", user);

app.get("*", (req, res) => {
  res.status(404).send({ message: "Resource not found" });
});

app.listen(process.env.PORT || 3001, () => {
  // tslint:disable-next-line: no-console
  console.log("Listening on port", process.env.PORT || 3001);
});
