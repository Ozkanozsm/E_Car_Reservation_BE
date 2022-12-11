import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";

import userRouter from "./routes/user";
import stationRouter from "./routes/station";
import gasRouter from "./routes/gas";
import { reservationContract } from "./utils/contracttracker";
import contractRouter from "./routes/contract";
import txRouter from "./routes/transaction";
import { newReservationToDB } from "./utils/contractwithdb";
import walletRouter from "./routes/wallet";
import reservationRouter from "./routes/reservation";

dotenv.config();

const contractTracker = reservationContract.events
  .allEvents()
  .on("connected", () => {
    console.log("connected");
  })
  .on("data", async (event: any) => {
    const eventtype = event.event;
    if (eventtype === "NewReservation") {
      console.log("----New Reservation----");
      const eventdata = event.returnValues.newRes;
      console.log(
        "reserver:",
        eventdata.reserver,
        "station:",
        eventdata.station
      );
      console.log(
        "startTime:",
        eventdata.startTime,
        "endTime:",
        eventdata.endTime
      );
      await newReservationToDB(event);
    } else if (eventtype === "CancelReservation") {
      console.log("----Cancel Reservation----");
      const eventdata = event.returnValues.cancelledRes;
      console.log(
        "reserver:",
        eventdata.reserver,
        "station:",
        eventdata.station
      );
      console.log(
        "startTime:",
        eventdata.startTime,
        "endTime:",
        eventdata.endTime
      );
    }
  });

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("e-car reservation backend");
});

app.use("/user", userRouter);
app.use("/station", stationRouter);
app.use("/gas", gasRouter);
app.use("/contract", contractRouter);
app.use("/transaction", txRouter);
app.use("/wallet", walletRouter);
app.use("/reservation", reservationRouter);

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});
