import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { stationRegisterMessage } from "../datas/constants";

const stationRouter = express.Router();

const prisma = new PrismaClient();
stationRouter.get("/", (req, res) => {
  res.send("station router");
});

//tüm istasyonları listeler
stationRouter.get("/list", async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        pricing: true,
      },
    });
    const stationsList = stations.map((station: any) => {
      return {
        id: station.id,
        address: station.address,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        total_slots: station.total_slots,
        pricing: station.pricing,
        wallet: station.wallet_addr,
      };
    });
    res.send(stationsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on getting station list" });
  }
});

stationRouter.get("/list/:id", async (req, res) => {
  const { id } = req.params;

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

//TODO check if station tries to register without necessary data
stationRouter.post("/register", async (req, res) => {
  const {
    wallet_address,
    signature,
    name,
    address,
    lat,
    lng,
    total_slots,
    prices,
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
            pricing: {
              create: [
                {
                  price: prices.price1,
                  start: prices.start1,
                  end: prices.end1,
                },
                {
                  price: prices.price2,
                  start: prices.start2,
                  end: prices.end2,
                },
              ],
            },
          },
        });

        res.json({ station });
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

  try {
    const prices = await prisma.pricing.findMany({
      where: {
        stationId: Number(id),
      },
    });
    //return only price start and end
    const pricesList = prices.map((price: any) => {
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
    const stationsList = stations.map((station: any) => {
      return { id: station.id, address: station.address, name: station.name };
    });
    res.json(stationsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on searching station" });
  }
});

stationRouter.post("/changeprice", async (req, res) => {
  const { signature, wallet_address, prices } = req.body;
  console.log(prices);

  const web3 = new Web3();
  let isValid = false;
  try {
    isValid =
      web3.eth.accounts.recover(JSON.stringify(prices), signature) ===
      wallet_address;
  } catch (e) {
    console.log("error on parsing signature");
  }
  if (isValid) {
    try {
      const stationandprices = await prisma.station.findUnique({
        where: {
          wallet_addr: wallet_address,
        },
        include: {
          pricing: true,
        },
      });
      if (stationandprices) {
        //change price1
        await prisma.pricing.update({
          where: {
            id: stationandprices.pricing[0].id,
          },
          data: {
            price: prices.price1,
            start: prices.start1,
            end: prices.end1,
          },
        });
        //change price2
        await prisma.pricing.update({
          where: {
            id: stationandprices.pricing[1].id,
          },
          data: {
            price: prices.price2,
            start: prices.start2,
            end: prices.end2,
          },
        });
        res.json({ prices });
      } else {
        res.status(400).json({ message: "station not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error on creating station" });
    }
  } else {
    res.status(400).json({ message: "invalid signature" });
  }
});

stationRouter.post("/info", async (req, res) => {
  const { address } = req.body;

  try {
    const station = await prisma.station.findUnique({
      where: {
        wallet_addr: address,
      },
      include: {
        pricing: true,
      },
    });
    if (station) {
      const stationInfo = {
        name: station.name,
        address: station.address,
        lat: station.lat,
        lng: station.lng,
        total_slots: station.total_slots,
        pricing: station.pricing,
      };
      console.log(stationInfo);

      res.json({ stationInfo });
    } else {
      res.status(400).json({ message: "station not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error on creating station" });
  }
});

export default stationRouter;
