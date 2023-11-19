import * as ethers from "ethers";
import { OrderBookApi } from "@cowprotocol/cow-sdk";

require("dotenv").config(".env");

import { sendOrders } from "./index";

export const GOERLI_SAFE_ADDRESS = "0xa2A90829733969a9A559501157a0d3dd1A862BAd";
export const GNOSIS_SAFE_ADDRESS = "0x9EB8c96CDfF9712c0f428E26B1E9bad2d07e3091";
export const SIGNER_ADDRESS = "0x489AAF2B98185066012882DD7D28C52d1c9A1f09";

const SIGNER_PK = process.env.SIGNER_PK!;
const RPC_URL = process.env.GNOSIS_RPC_URL!;

// const TX_SERVICE_URL = "https://safe-transaction-goerli.safe.global/";
export const GOERLI_SETTLEMENT_CONTRACT_ADDRESS =
   "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";
export const GNOSIS_SETTLEMENT_CONTRACT_ADDRESS =
   "0x9008D19f58AAbD9eD0D60971565AA8510560ab41";
export const GOERLI_USDC = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C";
export const GOERLI_WETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
export const GOERLI_DAI = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
// const RELAYER = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";
//
export const GNOSIS_WXDAI = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d";
export const GNOSIS_WBTC = "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252";
export const GNOSIS_WETH = "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1";
export const GNOSIS_1INCH = "0x7f7440c5098462f833e123b44b8a03e1d9785bab";

const chainId = 100; // 5;

const orderBookApi = new OrderBookApi({ chainId });

async function main() {
   const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
   const signer = new ethers.Wallet(SIGNER_PK, provider);

   const { orders, signatureTxResponse } = await sendOrders(
      provider,
      signer,
      SIGNER_ADDRESS,
      orderBookApi,
      [
         { token: GNOSIS_WBTC, weight: 0 },
         { token: GNOSIS_WETH, weight: 0 },
         { token: GNOSIS_WXDAI, weight: 1 },
      ],
      GNOSIS_WXDAI
   );

   console.log(signatureTxResponse);
   for (const order of orders) {
      console.log(order.id);
   }
}

main().catch((e: any) => console.error(e));
