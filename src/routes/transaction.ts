import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { web3Url } from "../datas/constants";
import { reservationBillToDB } from "../utils/contractwithdb";

const txRouter = express.Router();
const prisma = new PrismaClient();

txRouter.get("/", (req, res) => {
  res.send("transaction router");
});

txRouter.post("/sendforcontract", async (req, res) => {
  const { signedTx } = req.body;
  const web3 = new Web3(web3Url);
  try {
    const receipt = await web3.eth.sendSignedTransaction(signedTx);
    console.log("txhash:", receipt.transactionHash);
    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

txRouter.post("/sendforprice", async (req, res) => {
  const { signedTx } = req.body;
  const web3 = new Web3(web3Url);
  try {
    const receipt = await web3.eth.sendSignedTransaction(signedTx);
    console.log("txhash:", receipt.transactionHash);
    const txData = await web3.eth.getTransaction(receipt.transactionHash);
    console.log(web3.utils.hexToAscii(txData.input));
    await reservationBillToDB(receipt);
    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

txRouter.post("/required", async (req, res) => {
  const { address, tx } = req.body;
  try {
    const web3 = new Web3(web3Url);
    const gas = await web3.eth.estimateGas(tx);
    const nonce = await web3.eth.getTransactionCount(address);
    res.json({ gas, nonce });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

txRouter.post("/nonce", async (req, res) => {
  const { address } = req.body;
  const web3 = new Web3(web3Url);
  try {
    const nonce = await web3.eth.getTransactionCount(address);
    console.log(nonce);
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default txRouter;
