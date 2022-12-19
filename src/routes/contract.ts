import express from "express";
import { contractAbi, contractAddress, escrowAddress } from "../datas/contract";

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

contractRouter.get("/escrow", (req, res) => {
  res.send({ escrowAddress: escrowAddress });
});

//contract'a dair tüm bilgileri döndürür
contractRouter.get("/all", (req, res) => {
  res.json({
    contractAddress: contractAddress,
    escrowAddress: escrowAddress,
    contractAbi: contractAbi,
  });
});

export default contractRouter;
