import { PrismaClient } from "@prisma/client";
import express from "express";

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
    res.json(reservation);
  } catch (error) {
    res.status(500).json(error);
  }
});
export default reservationRouter;
