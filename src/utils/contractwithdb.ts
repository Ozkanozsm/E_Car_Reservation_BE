import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import dotenv from "dotenv";

import { statusResCancelled, statusResPaid, web3Url } from "../datas/constants";
import { escrowAddress } from "../datas/contract";
const prisma = new PrismaClient();
const web3 = new Web3(web3Url);

dotenv.config();
const escrowpkey = process.env.ESCROW_PKEY as string;

export const newReservationToDB = async (event: any) => {
  const eventdata = event.returnValues.newRes;
  const starttime = new Date(parseInt(eventdata.startTime) * 1000);
  const startdate = starttime.toLocaleDateString();
  const starthour = starttime.getHours();
  console.log("startdate", startdate);
  console.log("starthour", starthour);
  const endtime = new Date(parseInt(eventdata.endTime) * 1000);
  const enddate = endtime.toLocaleDateString();
  const endhour = endtime.getHours();
  console.log("enddate", enddate);
  console.log("endhour", endhour);

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

      console.log(
        starttime.getDay(),
        starttime.getMonth(),
        starttime.getFullYear()
      );

      const durationInMinutes =
        (parseInt(eventdata.endTime) - parseInt(eventdata.startTime)) / 60;
      console.log("durationInMinutes", durationInMinutes);
      let tempPrice;
      if (starthour >= pricing1.start && starthour < pricing1.end) {
        console.log("pricing1");
        tempPrice = (durationInMinutes / 60) * pricing1.price;
      } else {
        console.log("pricing2");
        tempPrice = (durationInMinutes / 60) * pricing2.price;
      }
      console.log("price:", tempPrice);
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
          total_spent: user.total_spent + tempPrice,
          total_reservation: user.total_reservation + 1,
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
      console.log("new reservation created");
    }
  } catch (error) {
    console.log(error);
  }
};

export const reservationBillToDB = async (receipt: any) => {
  const txData = await web3.eth.getTransaction(receipt.transactionHash);

  if (txData.to !== escrowAddress) {
    console.log("transaction not sent to escrow");
    return -4;
  }
  const txInput = web3.utils.hexToAscii(txData.input);
  try {
    const reservation = await prisma.reservation.findUnique({
      where: {
        create_tx: txInput,
      },
    });

    if (!reservation) {
      console.log("reservation not found");
      return -1;
    }
    if (reservation.status === statusResPaid) {
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
    await prisma.reservation.update({
      where: {
        create_tx: txInput,
      },
      data: {
        bill_tx: receipt.transactionHash,
        status: statusResPaid,
      },
    });
    console.log("reservation bill created");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const reservationCancelToDB = async (event: any) => {
  const cancelledRes = event.returnValues.cancelledRes;
  const canceller = event.returnValues.canceller;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: {
        create_tx: cancelledRes,
      },
    });

    if (!reservation) {
      console.log("reservation not found");
      return;
    }
    if (reservation.status === statusResCancelled) {
      console.log("reservation already cancelled");
      return;
    }
    if (reservation.reserver_wallet_addr !== canceller) {
      console.log("canceller is not reserver");
      return;
    }
    if (reservation.status === statusResPaid) {
      const txFrom = web3.eth.accounts.privateKeyToAccount(escrowpkey).address;
      const txTo = reservation.reserver_wallet_addr;
      const txValue = Number(
        web3.utils.toWei(reservation.value.toString(), "ether")
      );
      const txData = web3.utils.toHex(reservation.create_tx);
      let txGas = 0;

      const gas = await web3.eth.estimateGas({
        from: txFrom,
        to: txTo,
        value: txValue,
        data: txData,
      });
      txGas = gas;
      const signedTx = (await web3.eth.accounts.signTransaction(
        {
          from: txFrom,
          to: txTo,
          value: txValue,
          data: txData,
          gas: txGas,
        },
        escrowpkey
      )) as any;

      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );

      await prisma.reservation.update({
        where: { create_tx: cancelledRes },
        data: {
          status: statusResCancelled,
          cancel_tx: receipt.transactionHash,
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          wallet_addr: reservation.reserver_wallet_addr,
        },
      });
      if (!user) {
        console.log("user not found");
        return;
      }
      const updatedUser = await prisma.user.update({
        where: {
          wallet_addr: reservation.reserver_wallet_addr,
        },
        data: {
          total_cancelled: user.total_cancelled + 1,
        },
      });

      console.log("reservation cancelled");
    }
  } catch (error) {
    console.log(error);
  }
};
