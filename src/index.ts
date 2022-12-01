import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
const morgan = require("morgan");

import userRouter from "./routes/user";
import stationRouter from "./routes/station";

dotenv.config();

const app = express();
if (process.env.npm_lifecycle_event === "dev") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("e-car reservation backend");
});

app.use("/user", userRouter);
app.use("/station", stationRouter);

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});
