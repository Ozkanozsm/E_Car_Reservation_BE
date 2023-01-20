import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { contractAbi, contractAddress } from "../datas/contract";
import { statusResLate, statusResPaid, web3WSUrl } from "../datas/constants";
import { newReservationToDB } from "./contractwithdb";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { web3Url } from "../datas/constants";
dotenv.config();
const prisma = new PrismaClient();

const escrowpkey = process.env.ESCROW_PKEY as string;
const web3 = new Web3(web3Url);

export const latenessTracker = setInterval(async () => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        status: statusResPaid,
      },
    });
    console.log("-----late reservation check-----");
    let lateResFound = false;

    for (let i = 0; i < reservations.length; i++) {
      const reservation = reservations[i];
      if (reservation.start_time < Date.now() / 1000) {
        lateResFound = true;
        console.log(
          "late reservation found, starttime:",
          reservation.start_time,
          "now:",
          Date.now() / 1000,
          "reservation id:",
          reservation.id
        );
        try {
          const amount20 = (reservation.value * 20) / 100;
          const amount80 = reservation.value - amount20;
          const resCreateTx = reservation.create_tx;

          const txMessage = resCreateTx + " late";
          const txFrom =
            web3.eth.accounts.privateKeyToAccount(escrowpkey).address;
          const txTo = reservation.reserved_wallet_addr;
          const txValue = Number(
            web3.utils.toWei(amount20.toString(), "ether")
          );
          const txValue2 = Number(
            web3.utils.toWei(amount80.toString(), "ether")
          );
          const txData = web3.utils.asciiToHex(txMessage);
          const firstNonce = await web3.eth.getTransactionCount(txFrom);

          const txGas = await web3.eth.estimateGas({
            from: txFrom,
            to: txTo,
            value: txValue,
            data: txData,
            nonce: firstNonce,
          });
          const signedTx = (await web3.eth.accounts.signTransaction(
            {
              from: txFrom,
              to: txTo,
              value: txValue,
              data: txData,
              gas: txGas,
              nonce: firstNonce,
            },
            escrowpkey
          )) as any;
          const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
          );
          console.log("late fee tx hash:", receipt.transactionHash);

          await new Promise((r) => setTimeout(r, 1500));

          const txGas2 = await web3.eth.estimateGas({
            from: txFrom,
            to: reservation.reserver_wallet_addr,
            value: txValue2,
            data: txData,
          });
          const createdTx2 = {
            from: txFrom,
            to: reservation.reserver_wallet_addr,
            value: txValue2,
            data: txData,
            gas: txGas2,
          };

          const receipt2 = await web3.eth.sendTransaction(createdTx2);
          console.log("refund tx hash:", receipt2.transactionHash);

          await prisma.reservation.update({
            where: { create_tx: resCreateTx },
            data: {
              status: statusResLate,
              complete_tx: receipt.transactionHash,
              cancel_tx: receipt2.transactionHash,
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (!lateResFound) {
      console.log("no late reservations found");
    }
    console.log("-----late reservation check end-----");
  } catch (error) {
    console.log(error);
    console.log("-----late reservation check failed-----");
  }
}, 60000);
