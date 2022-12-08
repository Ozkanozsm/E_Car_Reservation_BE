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
  try {
    const stations = await prisma.station.findMany();
    const stationsList = stations.map((station) => {
      return { id: station.id, address: station.address, name: station.name };
    });
    res.send(stationsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on getting station list" });
  }
});

stationRouter.get("/list/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const station = await prisma.station.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(station);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on getting station" });
  }
});

stationRouter.post("/register", async (req, res) => {
  const {
    wallet_address,
    signature,
    name,
    address,
    lat,
    lng,
    total_slots,
    price,
  } = req.body;
  const web3 = new Web3();
  let isValid = false;
  try {
    isValid =
      web3.eth.accounts.recover(stationRegisterMessage, signature) ===
      wallet_address;
  } catch (e) {
    console.log("error on parsing signature");
  }
  if (isValid) {
    try {
      const station = await prisma.station.findUnique({
        where: {
          wallet_addr: wallet_address,
        },
      });
      if (station) {
        res.json({ station });
      } else {
        const station = await prisma.station.create({
          data: {
            wallet_addr: wallet_address,
            name: name,
            address: address,
            lat: lat,
            lng: lng,
            total_slots: total_slots,
          },
        });
        console.log(station);

        const price1 = await prisma.pricing.create({
          data: {
            price: price.price1,
            start: price.start1,
            end: price.end1,
            station: {
              connect: {
                id: station.id,
              },
            },
          },
        });
        console.log(price1);

        const price2 = await prisma.pricing.create({
          data: {
            price: price.price2,
            start: price.start2,
            end: price.end2,
            station: {
              connect: {
                id: station.id,
              },
            },
          },
        });
        console.log(price2);

        res.json({ station, price1, price2 });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error on creating station" });
    }
  } else {
    res.status(400).json({ message: "invalid signature" });
  }
});

stationRouter.get("/prices", async (req, res) => {
  const { id } = req.body;
  console.log(id);

  try {
    const prices = await prisma.pricing.findMany({
      where: {
        stationId: Number(id),
      },
    });
    //return only price start and end
    const pricesList = prices.map((price) => {
      return {
        price: price.price,
        start: price.start,
        end: price.end,
      };
    });

    res.json(pricesList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on getting prices" });
  }
});

stationRouter.post("/search", async (req, res) => {
  const { search } = req.body;
  console.log(search);

  try {
    const stations = await prisma.station.findMany({
      where: {
        OR: [
          {
            address: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
      },
    });
    const stationsList = stations.map((station) => {
      return { id: station.id, address: station.address, name: station.name };
    });
    res.json(stationsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on searching station" });
  }
});

export default stationRouter;
