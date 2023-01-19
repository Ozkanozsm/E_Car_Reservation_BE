export const contractAddress = "0xB0A3b2Efd3295cCdb7C8871a5586F4ef9A8b606C";
export const escrowAddress = "0xcF57C5E9576Ce4f49e12bDb8d8602a9D2B385E89";
export const contractAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "cancelledRes",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "canceller",
        type: "address",
      },
    ],
    name: "CancelReservation",
    type: "event",
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
  {
    inputs: [
      {
        internalType: "string",
        name: "resToCancel",
        type: "string",
      },
    ],
    name: "cancelReservation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
];
