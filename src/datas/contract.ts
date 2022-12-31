export const contractAddress = "0x00211aEc84Ac4304F0d563521E706D2f39B3fD3c";
export const escrowAddress = "0xcF57C5E9576Ce4f49e12bDb8d8602a9D2B385E89";
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
