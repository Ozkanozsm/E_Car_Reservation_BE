import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { contractAbi, contractAddress } from "../datas/contract";
import { web3WSUrl } from "../datas/constants";
import { newReservationToDB } from "./contractwithdb";
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3WSUrl));

export const reservationContract = new web3.eth.Contract(
  contractAbi as AbiItem[],
  contractAddress
);

export const tracker = reservationContract.events
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
