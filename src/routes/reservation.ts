import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { completeReservation } from "../utils/completereservation";

const reservationRouter = express.Router();
const prisma = new PrismaClient();

reservationRouter.get("/", (req, res) => {
  res.send("reservation router");
});

reservationRouter.post("/price", async (req, res) => {
  const { reservationHash } = req.body;
  console.log(reservationHash);

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { create_tx: reservationHash },
    });
    console.log(reservation);

    res.json(reservation);
  } catch (error) {
    res.status(500).json(error);
  }
});

reservationRouter.post("/complete", async (req, res) => {
  const { reservationHash, signature, address } = req.body;
  console.log(reservationHash);
  let isValid;
  try {
    const web3 = new Web3();
    isValid = web3.eth.accounts.recover(reservationHash, signature) === address;
    if (!isValid) {
      res.json({ error: "invalid signature" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  if (!isValid) {
    return;
  } else {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { create_tx: reservationHash },
      });
      if (reservation) {
        const iscomplete = await completeReservation(reservationHash);
        if (iscomplete === -5) {
          res.status(500).json({ error: "error on completing reservation" });
        }
        if (iscomplete === true) {
          res.json({ success: true });
        }
      } else {
        res.json({ error: "reservation not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
});

reservationRouter.get("/getbyid/:id", async (req, res) => {
  const { id } = req.params;
  const intid = parseInt(id);
  if (isNaN(intid)) {
    res.status(500).json({ error: `id ${id} is not a number` });
    return;
  } else {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: {
          id: intid,
        },
        include: {
          reserver: true,
          station: true,
        },
      });
      res.json(reservation);
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

reservationRouter.get("/getbyaddress/:address", async (req, res) => {
  const { address } = req.params;
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        reserver_wallet_addr: address,
      },
      include: {
        station: true,
      },
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json(error);
  }
});

reservationRouter.get("/all", async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        reserver: true,
        station: true,
      },
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default reservationRouter;
