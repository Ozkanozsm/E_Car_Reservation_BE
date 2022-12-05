import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { web3Url } from "../datas/constants";

const gasRouter = express.Router();
const prisma = new PrismaClient();

gasRouter.get("/", (req, res) => {
  res.send("gas router");
});

gasRouter.post("/calculategas", async (req, res) => {
  const { from, to, value, data } = req.body;
  const web3 = new Web3(web3Url);
  const gasPrice = await web3.eth.estimateGas({
    from: from,
    to: to,
    value: value,
    data: data ? web3.utils.asciiToHex(data) : undefined,
  });
  res.json({ gasPrice });
});

export default gasRouter;
