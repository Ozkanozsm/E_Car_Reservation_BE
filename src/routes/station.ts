import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { stationRegisterMessage } from "../datas/constants";

const stationRouter = express.Router();

const prisma = new PrismaClient();
stationRouter.get("/", (req, res) => {
  res.send("station router");
});

stationRouter.get("/list", async (req, res) => {
  const stations = await prisma.station.findMany();
  const stationsList = stations.map((station) => {
    return { id: station.id, address: station.address, name: station.name };
  });
  res.send(stationsList);
});

stationRouter.get("/list/:id", async (req, res) => {
  const { id } = req.params;
  const station = await prisma.station.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(station);
});

stationRouter.post("/register", async (req, res) => {
  const { signature, address } = req.body;
  const web3 = new Web3();
  let isValid = false;
  try {
    isValid =
      web3.eth.accounts.recover(stationRegisterMessage, signature) === address;
  } catch (e) {
    console.log("error on parsing signature");
  }
  if (isValid) {
    const station = await prisma.station.findUnique({
      where: {
        wallet_addr: address,
      },
    });
    if (station) {
      res.json({ station });
    }
    const newStation = await prisma.station.create({
      data: {
        wallet_addr: address,
        total_slots: 1,
        address: "test",
        name: "test",
        lat: 0,
        lng: 0,
      },
    });
    res.json({ station: newStation });
  } else {
    res.json({ error: "invalid signature" });
  }
});

export default stationRouter;
