import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { userRegisterMessage, web3Url } from "../datas/constants";

const userRouter = express.Router();
const prisma = new PrismaClient();

userRouter.get("/", (req, res) => {
  res.send("user router");
});

userRouter.get("/list", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const usersList = users.map((user) => {
      return { address: user.wallet_addr };
    });
    res.send(usersList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on getting user list" });
  }
});

userRouter.get("/list/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error on getting user" });
  }
});

userRouter.post("/register", async (req, res) => {
  const { signature, address } = req.body;
  const web3 = new Web3();
  let isValid = false;
  try {
    isValid =
      web3.eth.accounts.recover(userRegisterMessage, signature) === address;
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
