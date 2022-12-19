export const contractAddress = "0x999aC95ac03A0f53631dB0ebF1cdb8C15e06cb00";
export const escrowAddress = "0x84db1899ef0d44E9b95112AA5c34CB5D40A51bB7";
export const contractAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "station",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "cancelReservation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "reserver",
            type: "address",
          },
          {
            internalType: "address",
            name: "station",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Reservationmaker.Reservation",
        name: "cancelledRes",
        type: "tuple",
      },
    ],
    name: "CancelReservation",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "station",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "makeReservation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "reserver",
            type: "address",
          },
          {
            internalType: "address",
            name: "station",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Reservationmaker.Reservation",
        name: "newRes",
        type: "tuple",
      },
    ],
    name: "NewReservation",
    type: "event",
  },
];
