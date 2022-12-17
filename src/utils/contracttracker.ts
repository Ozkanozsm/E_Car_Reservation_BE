import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { contractAbi, contractAddress } from "../datas/contract";
import { web3WSUrl } from "../datas/constants";
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3WSUrl));

export const reservationContract = new web3.eth.Contract(
  contractAbi as AbiItem[],
  contractAddress
);
