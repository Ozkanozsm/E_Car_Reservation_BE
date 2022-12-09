import express from "express";
import Web3 from "web3";
import { web3Url } from "../datas/constants";

const walletRouter = express.Router();

walletRouter.get("/", (req, res) => {
  res.send("wallet router");
});

walletRouter.post("/balance", async (req, res) => {
  const { address } = req.body;
  try {
    const web3 = new Web3(web3Url);
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(address),
      "ether"
    );
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: "error on getting balance" });
  }
});

export default walletRouter;
