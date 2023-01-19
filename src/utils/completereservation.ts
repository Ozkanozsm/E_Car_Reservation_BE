import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import Web3 from "web3";
import { statusResCompleted, web3Url } from "../datas/constants";

dotenv.config();
const prisma = new PrismaClient();

const escrowpkey = process.env.ESCROW_PKEY as string;

export const completeReservation = async (reshash: string) => {
  try {
    const web3 = new Web3(web3Url);
    //find reservation
    const reservation = await prisma.reservation.findUnique({
      where: { create_tx: reshash },
    });
    console.log(reservation);

    if (reservation) {
      //send transaction to complete reservation
      const txFrom = web3.eth.accounts.privateKeyToAccount(escrowpkey).address;
      const txTo = reservation.reserved_wallet_addr;
      const txValue = Number(
        web3.utils.toWei(reservation.value.toString(), "ether")
      );
      const txData = web3.utils.toHex(reshash);
      let txGas = 0;

      //first estimate gas
      const gas = await web3.eth.estimateGas({
        from: txFrom,
        to: txTo,
        value: txValue,
        data: txData,
      });
      console.log(gas);
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
        where: { create_tx: reshash },
        data: {
          status: statusResCompleted,
          complete_tx: receipt.transactionHash,
        },
      });
      return true;
    }
  } catch (error) {
    console.log(error);
    return -5;
  }
};
