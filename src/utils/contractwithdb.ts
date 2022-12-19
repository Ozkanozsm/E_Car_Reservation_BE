import { PrismaClient } from "@prisma/client";
import Web3 from "web3";
import { web3Url } from "../datas/constants";
const prisma = new PrismaClient();
const web3 = new Web3(web3Url);
export const newReservationToDB = async (event: any) => {
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
        totalprice = frompricing1 + frompricing2;
      }

      console.log(totalprice);

      const createdres = await prisma.reservation.create({
        data: {
          reserver_wallet_addr: eventdata.reserver,
          reserved_wallet_addr: eventdata.station,
          start_time: reservationstart,
          duration: reservationend - reservationstart,
          value: totalprice,
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

      console.log(updatedUser);
      console.log(updatedStation);
    }
  } catch (error) {
    console.log(error);
  }

  console.log("new reservation created");
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
