import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import Web3 from "web3";
import { web3Url } from "../datas/constants";

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
    if (reservation) {
      //send transaction to complete reservation
      const baseTx = {
        from: web3.eth.accounts.privateKeyToAccount(escrowpkey).address,
        to: reservation.reserved_wallet_addr,
        value: web3.utils.toWei(reservation.value.toString(), "ether"),
        data: web3.utils.toHex(reshash),
        gas: 21000,
      };
      //first estimate gas
      const gas = await web3.eth.estimateGas(baseTx);
      baseTx.gas = gas;
      //then sign transaction
      const signedTx = (await web3.eth.accounts.signTransaction(
        baseTx,
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
        data: { status: 5, bill_tx: receipt.transactionHash },
      });
      return true;
    }
  } catch (error) {
    console.log(error);
    return -5;
  }
};
