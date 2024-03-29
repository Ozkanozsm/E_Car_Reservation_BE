import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import {
  statusResCompleted,
  statusResCancelled,
  statusResPaid,
} from "../datas/constants";
import { completeReservation } from "../utils/completereservation";
const reservationRouter = express.Router();
const prisma = new PrismaClient();

reservationRouter.get("/", (req, res) => {
  res.send("reservation router");
});

//oluşturulmuş rezervasyonun fiyat bilgisini döndürür
reservationRouter.post("/price", async (req, res) => {
  const { reservationHash } = req.body;
  console.log(reservationHash);

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { create_tx: reservationHash },
    });
    //console.log(reservation);

    res.json(reservation);
  } catch (error) {
    res.status(500).json(error);
  }
});

//oluşturulmuş rezervasyonu tamamlar
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
        //rezervasyon varsa
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

//oluşturulmuş rezervasyonun bilgilerini verilen rezervasyon id'sine göre döndürür
reservationRouter.get("/byid/:id", async (req, res) => {
  const { id } = req.params;
  const intid = parseInt(id);
  if (isNaN(intid)) {
    //girilmiş id sayı değilse
    res.status(500).json({ error: `id ${id} is not a number` });
  } else {
    try {
      //girilmiş id sayı ise
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
      //rezervasyon bulunamadıysa
      res.status(500).json(error);
    }
  }
});

reservationRouter.get("/byuseraddress/:address", async (req, res) => {
  const { address } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        wallet_addr: address,
      },
      include: {
        Reservations: true,
      },
    });
    if (user) {
      res.json(user);
    } else {
      res.json({ error: "user not found" });
    }
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

reservationRouter.get("/bystationaddress/:stationaddress", async (req, res) => {
  const { stationaddress } = req.params;
  try {
    const station = await prisma.station.findUnique({
      where: {
        wallet_addr: stationaddress,
      },
      include: {
        Reservations: true,
      },
    });
    if (station) {
      res.json(station);
    } else {
      res.json({ error: "station not found" });
    }
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

reservationRouter.get("/bystationid/:stationid", async (req, res) => {
  const { stationid } = req.params;
  const intid = parseInt(stationid);
  if (isNaN(intid)) {
    res.status(500).json({ error: `id ${stationid} is not a number` });
  } else {
    try {
      const station = await prisma.station.findUnique({
        where: {
          id: intid,
        },
        include: {
          Reservations: true,
        },
      });
      if (station) {
        res.json(station);
      } else {
        res.json({ error: "station not found" });
      }
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
});

//tüm rezervasyonları döndürür
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
    console.log(error);
  }
});

//rezervasyon uygun mu kontrol eder
reservationRouter.post("/check", async (req, res) => {
  const { stationId, startDate, duration } = req.body;
  const intid = parseInt(stationId);
  const newResStartTime = parseInt(startDate);
  const newResDuration = parseInt(duration);
  const newResEndTime = newResStartTime + newResDuration;

  if (isNaN(intid)) {
    res.status(500).json({ error: `id ${stationId} is not a number` });
  } else {
    try {
      //check if startDate is in the future
      const now = Math.floor(Date.now() / 1000);
      if (newResStartTime < now) {
        res.json({ message: "start date is in the past", available: 0 });
        return;
      }
      const station = await prisma.station.findUnique({
        where: {
          id: intid,
        },
        include: {
          pricing: true,
        },
      });
      if (station) {
        const activeReservations = await prisma.reservation.findMany({
          where: {
            reserved_wallet_addr: station.wallet_addr,
            status: statusResPaid,
          },
        });
        let intersectionCounter = 0;

        for (let i = 0; i < activeReservations.length; i++) {
          const reservation = activeReservations[i];
          const reservationStart = reservation.start_time;
          const reservationEnd = reservation.start_time + reservation.duration;
          console.log(reservationStart, reservationEnd);
          console.log(newResStartTime, newResEndTime);

          if (
            newResEndTime <= reservationStart ||
            newResStartTime >= reservationEnd
          ) {
            //no intersection
          } else {
            intersectionCounter++;
          }
        }
        console.log(intersectionCounter);

        if (intersectionCounter >= station.total_slots) {
          res.json({ available: 0, message: "no available slots" });
          return;
        } else {
          //calculate estimated price
          const pricing1 = station.pricing[0];
          const pricing2 = station.pricing[1];
          const starthour = new Date(newResStartTime * 1000).getHours();
          console.log("starthour:", starthour);
          const durationInMinutes = newResDuration / 60;
          let tempPrice;
          if (starthour >= pricing1.start && starthour < pricing1.end) {
            console.log("pricing1");
            tempPrice = (durationInMinutes / 60) * pricing1.price;
          } else {
            console.log("pricing2");
            tempPrice = (durationInMinutes / 60) * pricing2.price;
          }
          console.log("price:", tempPrice);

          res.json({ available: 1, price: tempPrice });
        }
      } else {
        res.status(500).json({ error: "station not found" });
        return;
      }
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
});

export default reservationRouter;
