import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { registerMessage, web3Url } from "../datas/constants";

const userRouter = express.Router();
const prisma = new PrismaClient();

userRouter.get("/", (req, res) => {
  res.send("user router");
});

userRouter.get("/list/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(user);
});

userRouter.post("/balance", async (req, res) => {
  const web3 = new Web3(web3Url);
  const { address } = req.body;
  try {
    const balance = await web3.eth.getBalance(address as string);
    console.log(balance);

    res.json({ balance });
  } catch (e) {
    res.json(e);
  }
});

userRouter.post("/register", async (req, res) => {
  const { signature, address } = req.body;
  const web3 = new Web3();
  let isValid = false;
  try {
    isValid = web3.eth.accounts.recover(registerMessage, signature) === address;
  } catch (e) {
    console.log("error on parsing signature");
  }
  if (isValid) {
    const user = await prisma.user.findUnique({
      where: {
        wallet_addr: address,
      },
    });

    if (user) {
      res.json(user);
    } else {
      const newUser = await prisma.user.create({
        data: {
          wallet_addr: address,
        },
      });
      res.json(newUser);
    }
  } else {
    res.status(400).json({ message: "invalid signature" });
  }
});

export default userRouter;
