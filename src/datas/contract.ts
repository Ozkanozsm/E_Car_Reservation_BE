export const contractAddress = "0x5a688FeAF5460E140c13Bc7A12A2ad2505cd878A";
export const escrowAddress = "0xe4F399b0e2EDe652d964430D8e9a61d001c64A1a";
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
