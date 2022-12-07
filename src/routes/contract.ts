import express from "express";
import { contractAbi, contractAddress } from "../datas/contract";

const contractRouter = express.Router();

contractRouter.get("/", (req, res) => {
  res.send("contract router");
});

contractRouter.get("/ABI", (req, res) => {
  res.json(contractAbi);
});

contractRouter.get("/address", (req, res) => {
  res.send({ contractAddress: contractAddress });
});

export default contractRouter;
