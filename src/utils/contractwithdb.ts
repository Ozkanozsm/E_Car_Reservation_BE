import { PrismaClient } from "@prisma/client";
import express from "express";
import Web3 from "web3";
import { userRegisterMessage, web3Url } from "../datas/constants";
const prisma = new PrismaClient();
const web3 = new Web3(web3Url);
export const newReservationToDB = async (event: any) => {
  const eventdata = event.returnValues.newRes;
  await prisma.reservation.create({
    data: {
      reserver_wallet_addr: eventdata.reserver,
      reserved_wallet_addr: eventdata.station,
      start_time: parseInt(eventdata.startTime),
      duration: parseInt(eventdata.endTime) - parseInt(eventdata.startTime),
      value: 1,
      reserved_time: new Date(),
      create_tx: event.transactionHash,
    },
  });
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
