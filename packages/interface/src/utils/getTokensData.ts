import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { useComposition } from "@/store/allocationsContext";
import { ethers, Contract } from "ethers";
import erc20Abi from "../../../orders/src/erc20Abi.json";

export type tokenData = {
    address: string,
    name: string,
    ticker: string,
    decimals: number,
    balance: number
 }
 

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");
const { ownerAddress } = useAccountAbstraction();
const { composition } = useComposition();
const assets = composition?.assets

export async function getBalances(): Promise<tokenData[]> {
    if (assets && assets.length > 0) {
        return Promise.all(
            assets.map(async (address) => {
            // get erc20 balance using ether
            const contract = new Contract(address, erc20Abi, provider);
            return {
                address: address,
                name: await contract.name(),
                ticker: await contract.symbol(),
                decimals: await contract.decimals(),
                balance: await contract.balanceOf(ownerAddress),
            };
          })
        );
    }
    return [];
  }