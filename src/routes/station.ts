import { PrismaClient } from "@prisma/client";
import express from "express";

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

export default stationRouter;
