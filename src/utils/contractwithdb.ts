import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import { web3Url } from "../datas/constants";
const prisma = new PrismaClient();
const web3 = new Web3(web3Url);
export const newReservationToDB = async (event: any) => {
  const eventdata = event.returnValues.newRes;
  console.log("eventdata", eventdata);
  //starttime is epoch to date and hour
  const starttime = new Date(parseInt(eventdata.startTime) * 1000);
  const startdate = starttime.toLocaleDateString();
  const starthour = starttime.getHours();
  console.log("startdate", startdate);
  console.log("starthour", starthour);
  //endtime is epoch to date and hour
  const endtime = new Date(parseInt(eventdata.endTime) * 1000);
  const enddate = endtime.toLocaleDateString();
  const endhour = endtime.getHours();
  console.log("enddate", enddate);
  console.log("endhour", endhour);
  //check if reservation is in the same day
  let sameDay = false;
  if (startdate === enddate) {
    console.log("same day");
    sameDay = true;
  } else {
    console.log("not same day");
  }

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
      const pricing1 = station.pricing[0];
      const pricing2 = station.pricing[1];
      console.log("pricing1", pricing1);
      console.log("pricing2", pricing2);

      const tempPrice = 0;
      const reservationstart = parseInt(eventdata.startTime);
      const reservationend = parseInt(eventdata.endTime);

      const createdres = await prisma.reservation.create({
        data: {
          reserver_wallet_addr: eventdata.reserver,
          reserved_wallet_addr: eventdata.station,
          start_time: reservationstart,
          duration: reservationend - reservationstart,
          value: tempPrice,
          reserved_time: new Date(),
          create_tx: event.transactionHash,
        },
      });
      const user = await prisma.user.findUnique({
        where: {
          wallet_addr: eventdata.reserver,
        },
      });
      if (!user) {
        console.log("user not found");
        return;
      }
      const updatedUser = await prisma.user.update({
        where: {
          wallet_addr: eventdata.reserver,
        },
        data: {
          Reservations: {
            connect: {
              id: createdres.id,
            },
          },
        },
      });
      const updatedStation = await prisma.station.update({
        where: {
          wallet_addr: eventdata.station,
        },
        data: {
          Reservations: {
            connect: {
              id: createdres.id,
            },
          },
        },
      });

      //console.log(updatedUser);
      //console.log(updatedStation);
      console.log("new reservation created");
    }
  } catch (error) {
    console.log(error);
  }
};

export const reservationBillToDB = async (receipt: any) => {
  const txData = await web3.eth.getTransaction(receipt.transactionHash);
  console.log(txData);

  //TODO check if price sent to escrow
  if (
    txData.to !==
    web3.eth.accounts.privateKeyToAccount(process.env.ESCROW_PKEY as string)
      .address
  ) {
    console.log("transaction not sent to escrow");
    return -4;
  }

  const txInput = web3.utils.hexToAscii(txData.input);
  try {
    //find reservation
    const reservation = await prisma.reservation.findUnique({
      where: {
        create_tx: txInput,
      },
    });

    if (!reservation) {
      console.log("reservation not found");
      return -1;
    }
    //check if reservation is paid
    if (reservation.status === 1) {
      console.log("reservation already paid");
      return -2;
    }

    if (
      web3.utils.toWei(reservation.value.toString(), "ether") !==
      txData.value.toString()
    ) {
      console.log("reservation price is not correct");
      return -3;
    }
    //update reservation status
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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
