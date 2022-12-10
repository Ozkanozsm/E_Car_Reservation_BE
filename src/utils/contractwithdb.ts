import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import { web3Url } from "../datas/constants";
const prisma = new PrismaClient();
const web3 = new Web3(web3Url);
export const newReservationToDB = async (event: any) => {
  console.log("EVENT:", event);
  const eventdata = event.returnValues.newRes;
  try {
    const station = await prisma.station.findUnique({
      where: {
        wallet_addr: eventdata.station,
      },
      include: {
        pricing: true,
      },
    });
    if (!station) {
      console.log("station not found");
      return;
    } else {
      console.log("station found");
      console.log(station.pricing);
      const reservationstart = parseInt(eventdata.startTime);
      const reservationend = parseInt(eventdata.endTime);
      const pricing1 = station.pricing[0];
      const pricing2 = station.pricing[1];

      //calculate total price
      let totalprice = 0;
      if (
        pricing1.start <= reservationstart &&
        reservationend <= pricing2.start
      ) {
        console.log("pricing1");

        totalprice = (reservationend - reservationstart) * pricing1.price;
      } else if (
        pricing2.start <= reservationstart &&
        reservationend <= pricing2.end
      ) {
        console.log("pricing2");

        totalprice = (reservationend - reservationstart) * pricing2.price;
      } else if (
        pricing1.start <= reservationstart &&
        reservationend <= pricing2.end
      ) {
        const frompricing1 = (pricing1.end - reservationstart) * pricing1.price;
        const frompricing2 = (reservationend - pricing2.start) * pricing2.price;
        console.log("pricing1 and pricing2");
        console.log("frompricing1: " + frompricing1);
        console.log("frompricing2: " + frompricing2);
        totalprice = frompricing1 + frompricing2;
      }

      console.log(totalprice);

      await prisma.reservation.create({
        data: {
          reserver_wallet_addr: eventdata.reserver,
          reserved_wallet_addr: eventdata.station,
          start_time: reservationstart,
          duration: reservationstart - reservationend,
          value: totalprice,
          reserved_time: new Date(),
          create_tx: event.transactionHash,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }

  console.log("new reservation created");
};

export const reservationBillToDB = async (receipt: any) => {
  const txData = await web3.eth.getTransaction(receipt.transactionHash);
  const txInput = web3.utils.hexToAscii(txData.input);
  console.log(txInput);
  try {
    await prisma.reservation.update({
      where: {
        create_tx: txInput,
      },
      data: {
        bill_tx: receipt.transactionHash,
        status: 1,
      },
    });
    console.log("reservation bill created");
  } catch (error) {
    console.log(error);
  }
};
