import { sendOrders } from ".";

import Safe from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { BigNumber } from "ethers";
import * as ethers from "ethers";
import { OrderBookApi } from "@cowprotocol/cow-sdk";

const SAFE_ADDRESS = "0xa2A90829733969a9A559501157a0d3dd1A862BAd";
const SIGNER_ADDRESS = "0x489AAF2B98185066012882DD7D28C52d1c9A1f09";
const SIGNER_PK =
  "0xd27ba1bd42e0faa9e76eab37c8efdb314d5def1e1e81ccb71b15fa2e225f2a07";
const RPC_URL = "https://goerli.infura.io/v3/22bcdedae77e493c8b3de2cf109e11fb";
const TX_SERVICE_URL = "https://safe-transaction-goerli.safe.global/";
const SETTLEMENT_CONTRACT_ADDRESS =
  "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";
const USDC = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C";
const WETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const DAI = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
// const RELAYER = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";

const chainId = 5;

const orderBookApi = new OrderBookApi({ chainId });

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(SIGNER_PK, provider);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  const safeSdk = await Safe.create({ ethAdapter, safeAddress: SAFE_ADDRESS });
  const safeApiKit = new SafeApiKit({
    txServiceUrl: TX_SERVICE_URL,
    ethAdapter,
  });

  const orders = await sendOrders(
    safeSdk,
    safeApiKit,
    orderBookApi,
    SETTLEMENT_CONTRACT_ADDRESS,
    SAFE_ADDRESS,
    SIGNER_ADDRESS,
    [
      { token: DAI, allocation: 50 },
      { token: WETH, allocation: 50 },
    ],
    USDC,
    BigNumber.from("100000000000000000")
  );

  for (const order of orders) {
    console.log(order.id);
  }
}

main().catch((e: any) => console.error(e));
