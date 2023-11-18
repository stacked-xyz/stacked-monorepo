import Safe from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import * as ethers from "ethers";
import { OrderBookApi } from "@cowprotocol/cow-sdk";

require("dotenv").config(".env");

import { sendOrders } from "./index";

const SAFE_ADDRESS = "0xa2A90829733969a9A559501157a0d3dd1A862BAd";
// const SIGNER_ADDRESS = "0x489AAF2B98185066012882DD7D28C52d1c9A1f09";
const SIGNER_PK = process.env.GOERLI_SIGNER_PK!;
const RPC_URL = process.env.GOERLI_RPC_URL!;
// const TX_SERVICE_URL = "https://safe-transaction-goerli.safe.global/";
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
  // const safeApiKit = new SafeApiKit({
  //   txServiceUrl: TX_SERVICE_URL,
  //   ethAdapter,
  // });

  const { orders, signatureTxResponse } = await sendOrders(
    safeSdk,
    orderBookApi,
    provider,
    SETTLEMENT_CONTRACT_ADDRESS,
    SAFE_ADDRESS,
    [
      { token: DAI, weight: 0.5 },
      { token: WETH, weight: 0.5 },
    ],
    USDC
  );

  console.log(signatureTxResponse);
  for (const order of orders) {
    console.log(order.id);
  }
}

main().catch((e: any) => console.error(e));
