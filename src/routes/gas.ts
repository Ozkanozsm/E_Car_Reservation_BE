import express from "express";
import Web3 from "web3";
import { web3Url } from "../datas/constants";

const gasRouter = express.Router();

gasRouter.get("/", (req, res) => {
  res.send("gas router");
});

gasRouter.post("/estimate", async (req, res) => {
  const { tx } = req.body;
  try {
    const web3 = new Web3(web3Url);
    const gasPrice = await web3.eth.estimateGas(tx);
    res.json({ gasPrice });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default gasRouter;
