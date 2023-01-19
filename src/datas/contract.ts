export const contractAddress = "0x71b56B4AE126fFD6E8133eAC43e6B276493105F7";
export const escrowAddress = "0x680C4c4Ca6cb24aE01371f0CBc372c94afE6c350";
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
