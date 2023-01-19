import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
//TEST COMMIT TO FIX GIT
import userRouter from "./routes/user";
import stationRouter from "./routes/station";
import gasRouter from "./routes/gas";
import { reservationContract, conTracker } from "./utils/contracttracker";
import contractRouter from "./routes/contract";
import txRouter from "./routes/transaction";
import { newReservationToDB } from "./utils/contractwithdb";
import walletRouter from "./routes/wallet";
import reservationRouter from "./routes/reservation";
import { latenessTracker } from "./utils/latenessTracker";

dotenv.config();
const contractTracker = conTracker;
const lateTracker = latenessTracker;
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
//todo make contractTracker modular

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});
