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

//blockchaine rezervasyon kontraktını çağırmak için oluşturulan tx'i gönderir
txRouter.post("/sendforcontract", async (req, res) => {
  const { signedTx } = req.body;
  console.log(signedTx);

  try {
    const web3 = new Web3(web3Url);
    const receipt = await web3.eth.sendSignedTransaction(signedTx);
    //console.log(receipt);

    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
});

//blockchaine rezervasyon ücreti için oluşturulan tx'i gönderir
txRouter.post("/sendforprice", async (req, res) => {
  const { signedTx } = req.body;
  try {
    const web3 = new Web3(web3Url);
    const receipt = await web3.eth.sendSignedTransaction(signedTx);
    const success = await reservationBillToDB(receipt);
    if (success == -1) {
      res.status(500).json({ error: "reservation not found" });
    } else if (success == -2) {
      res.status(500).json({ error: "reservation already paid" });
    } else if (success == -3) {
      res.status(500).json({ error: "reservation price is not correct" });
    } else if (success) {
      res.json({ receipt, paymentSuccess: success });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
    console.log(error);
  }
});

//oluşturulacak transaction için gereken bilgileri döndürür
txRouter.post("/required", async (req, res) => {
  const { address, tx } = req.body;

  try {
    const web3 = new Web3(web3Url);
    const gas = await web3.eth.estimateGas(tx);
    const nonce = await web3.eth.getTransactionCount(address);
    res.json({ gas, nonce });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error });
  }
});

//nonce değerini döndürür
txRouter.post("/nonce", async (req, res) => {
  const { address } = req.body;
  try {
    const web3 = new Web3(web3Url);

    const nonce = await web3.eth.getTransactionCount(address);
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default txRouter;
