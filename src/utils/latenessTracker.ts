import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { contractAbi, contractAddress } from "../datas/contract";
import { web3WSUrl } from "../datas/constants";
import { newReservationToDB } from "./contractwithdb";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { web3Url } from "../datas/constants";
dotenv.config();
const prisma = new PrismaClient();

const escrowpkey = process.env.ESCROW_PKEY as string;
const web3 = new Web3(web3Url);

export const latenessTracker = setInterval(async () => {
  //get all reservations which have status 1
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 1,
    },
  });
  console.log("reservations");

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    //if reservation is late log
    if (reservation.start_time < Date.now()) {
      console.log("late", reservation);
      //send 20 percent of amount to reserved_wallet_addr
      const amount20 = (reservation.value * 20) / 100;
      const resCreateTx = reservation.create_tx;
      /*
      const txMessage = resCreateTx + " late payment 20 percent";
      const txFrom = web3.eth.accounts.privateKeyToAccount(escrowpkey).address;
      const txTo = reservation.reserved_wallet_addr;
      const txValue = Number(web3.utils.toWei(amount20.toString(), "ether"));
      const txData = web3.utils.toHex(txMessage);
      let txGas = 0;

      //first estimate gas
      const gas = await web3.eth.estimateGas({
        from: txFrom,
        to: txTo,
        value: txValue,
        data: txData,
      });
      txGas = gas;
      //then sign transaction
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

      //then send transaction
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      console.log(receipt);
      //update reservation status
      await prisma.reservation.update({
        where: { create_tx: resCreateTx },
        data: { status: 5, complete_tx: receipt.transactionHash },
      });
      return true;
      */
    }
  }
}, 5000);
