import {
   OrderBookApi,
   OrderKind,
   Address,
   OrderQuoteSideKindSell,
   OrderCreation,
   OrderQuoteRequest,
   OrderSigningUtils,
   SupportedChainId,
} from "@cowprotocol/cow-sdk";
import { BigNumber, Contract, Signer, providers } from "ethers";

import settlementContractAbi from "./settlementContractAbi.json";
import erc20Abi from "./erc20Abi.json";

import Safe from "@safe-global/protocol-kit";
// import SafeApiKit from "@safe-global/api-kit";
import {
   OperationType,
   SafeTransaction,
} from "@safe-global/safe-core-sdk-types";
// import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";

export interface AssetWeight {
   token: Address;
   weight: number;
}

export type TargetAllocation = AssetWeight[];

type OrderWithId = OrderCreation & { id: string };

const PRECISION = 10000;

function logBalances(balances: Balances) {
   console.log(
      "---------------------------------------------------------------------"
   );
   balances.forEach((b) => {
      console.log(`${b.token}: ${b.balance.toString()}`);
   });
   console.log(
      "---------------------------------------------------------------------"
   );
}

/**
 * Set baseAsset (USDC) to 0 weight in target allocation if it's not present.
 */
export function targetAllocationWithDefault(
   targetAllocation: TargetAllocation,
   baseAsset: Address
): TargetAllocation {
   if (targetAllocation.find((a) => a.token === baseAsset)) {
      return targetAllocation;
   } else {
      return [
         ...targetAllocation,
         {
            token: baseAsset,
            weight: 0,
         },
      ];
   }
}

export type Balance = { token: Address; balance: BigNumber };
export type Balances = Balance[];
type BalanceMap = Record<Address, BigNumber>;

export async function getBalances(
   signerAddress: Address,
   targetAllocation: TargetAllocation,
   provider: providers.Provider
): Promise<Balances> {
   return Promise.all(
      targetAllocation.map(async (asset) => {
         // get erc20 balance using ether
         const contract = new Contract(asset.token, erc20Abi, provider);
         return {
            token: asset.token,
            balance: await contract.balanceOf(signerAddress),
         };
      })
   );
}

export async function getBalancesInBaseAsset(
   orderBookApi: OrderBookApi,
   signerAddress: Address,
   balances: Balances,
   baseAsset: Address
): Promise<Balances> {
   return Promise.all(
      balances.map(async (asset) => {
         if (asset.token == baseAsset || asset.balance.isZero()) {
            return asset;
         }

         const order = {
            sellToken: asset.token,
            buyToken: baseAsset,
            kind: OrderKind.SELL as unknown as OrderQuoteSideKindSell, // Fucked.
            sellAmountBeforeFee: asset.balance.toString(),
            from: signerAddress,
         };

         const quoteResponse = await orderBookApi.getQuote(order);
         const balance = BigNumber.from(quoteResponse.quote.buyAmount);

         return {
            token: asset.token,
            balance,
         };
      })
   );
}

export function getTargetBalancesInBaseAsset(
   balances: Balances,
   targetAllocation: TargetAllocation
): Balances {
   const targetAllocationMap = targetAllocation.reduce<Record<Address, number>>(
      (acc, asset) => {
         acc[asset.token] = asset.weight;
         return acc;
      },
      {}
   );

   const totalBalance = balances.reduce<BigNumber>(
      (sum, asset) => sum.add(asset.balance),
      BigNumber.from(0)
   );

   return balances.map((asset) => {
      const targetWeight = targetAllocationMap[asset.token]!;
      if (targetWeight === 0) {
         return {
            token: asset.token,
            balance: BigNumber.from(0),
         };
      }
      return {
         token: asset.token,
         balance: totalBalance
            .mul((targetWeight * PRECISION).toFixed())
            .div(PRECISION),
      };
   });
}

const E = 0.001;

type PercentageDelta = Array<{ token: Address; pctDelta: number }>;

function percentageDelta(a: Balances, b: Balances): PercentageDelta {
   const aMap = a.reduce<Record<Address, BigNumber>>((acc, asset) => {
      acc[asset.token] = asset.balance;
      return acc;
   }, {});

   return b.map((asset) => {
      const bBalance = asset.balance;
      const aBalance = aMap[asset.token]!;

      const diff = bBalance.sub(aMap[asset.token]!);

      if (aBalance.isZero()) {
         if (bBalance.isZero()) {
            return {
               token: asset.token,
               pctDelta: 0,
            };
         }
         return {
            token: asset.token,
            pctDelta: Infinity,
         };
      } else {
         const pctDelta =
            diff.mul(PRECISION).div(aMap[asset.token]!).toNumber() / PRECISION;
         return {
            token: asset.token,
            pctDelta,
         };
      }
   });
}

function getMinAndMax(
   currentBalancesInBase: Balances,
   targetBalancesInBase: Balances
): [Balance, Balance] {
   const targetBalancesInBaseMap = targetBalancesInBase.reduce<
      Record<Address, BigNumber>
   >((acc, asset) => {
      acc[asset.token] = asset.balance;
      return acc;
   }, {});

   let min = undefined;
   let max = undefined;
   let minDiff = undefined;
   let maxDiff = undefined;

   for (const asset of currentBalancesInBase) {
      const assetDiff = asset.balance.sub(
         targetBalancesInBaseMap[asset.token]!
      );
      // const assetDiff = targetBalancesInBaseMap[asset.token]!.sub(asset.balance);
      console.log(asset.token, assetDiff.toString());

      if (min == undefined && max == undefined) {
         min = asset;
         max = asset;
         minDiff = assetDiff;
         maxDiff = assetDiff;
         continue;
      }
      if (assetDiff.gt(maxDiff!)) {
         max = asset;
         maxDiff = assetDiff;
      }
      if (assetDiff.lt(minDiff!)) {
         min = asset;
         minDiff = assetDiff;
      }
   }

   return [min!, max!];
}

async function findMinMaxOrder(
   targetBalancesInBaseAssetMap: BalanceMap,
   targetBalancesInBase: Balances,
   currentBalancesInBase: Balances,
   baseAsset: Address,
   orderBookApi: OrderBookApi,
   signerAddress: Address
): Promise<{
   top: Balance;
   bottom: Balance;
   amountOfTopToSellInBase: BigNumber;
   amountOfTopToSell: BigNumber;
}> {
   const [bottom, top] = getMinAndMax(
      currentBalancesInBase,
      targetBalancesInBase
   );
   const bottomDiff = bottom.balance.sub(
      targetBalancesInBaseAssetMap[bottom.token]!
   );
   const topDiff = top.balance.sub(targetBalancesInBaseAssetMap[top.token]!);

   let deltaInBase;
   if (bottomDiff.abs().gt(topDiff.abs())) {
      deltaInBase = topDiff.abs();
   } else {
      deltaInBase = bottomDiff.abs();
   }

   let amountOfTopToSell = deltaInBase;

   if (top.token != baseAsset) {
      const quoteTopInBaseResp = await orderBookApi.getQuote({
         sellToken: baseAsset,
         buyToken: top.token!,
         kind: OrderKind.SELL as unknown as OrderQuoteSideKindSell, // Fucked.
         sellAmountBeforeFee: deltaInBase.toString(),
         from: signerAddress,
      });
      amountOfTopToSell = BigNumber.from(quoteTopInBaseResp.quote.buyAmount);
   }

   return {
      top: top,
      bottom: bottom,
      amountOfTopToSellInBase: deltaInBase,
      amountOfTopToSell,
   };
}

export async function buildOrders(
   signer: Signer,
   orderBookApi: OrderBookApi,
   currentBalancesInBase: Balances,
   targetBalancesInBase: Balances,
   baseAsset: Address,
   signerAddress: Address
): Promise<OrderCreation[]> {
   const targetBalancesInBaseMap = targetBalancesInBase.reduce<
      Record<Address, BigNumber>
   >((acc, asset) => {
      acc[asset.token] = asset.balance;
      return acc;
   }, {});

   const orders: OrderCreation[] = [];
   let delta = percentageDelta(currentBalancesInBase, targetBalancesInBase);
   while (delta.find((d) => d.pctDelta > E)) {
      const { top, bottom, amountOfTopToSellInBase, amountOfTopToSell } =
         await findMinMaxOrder(
            targetBalancesInBaseMap,
            targetBalancesInBase,
            currentBalancesInBase,
            baseAsset,
            orderBookApi,
            signerAddress
         );

      console.log(top, bottom, amountOfTopToSellInBase.toString());

      currentBalancesInBase = currentBalancesInBase.map((asset) => {
         let balance = BigNumber.from(asset.balance);
         if (asset.token == bottom.token) {
            balance = balance.add(amountOfTopToSellInBase);
         }
         if (asset.token == top.token) {
            balance = balance.sub(amountOfTopToSellInBase);
         }
         return { token: asset.token, balance };
      });
      logBalances(currentBalancesInBase);
      delta = percentageDelta(currentBalancesInBase, targetBalancesInBase);
      console.log(delta);

      const quote: OrderQuoteRequest = {
         sellToken: top.token,
         buyToken: bottom.token,
         kind: OrderQuoteSideKindSell.SELL,
         sellAmountBeforeFee: amountOfTopToSell.toString(),
         from: signerAddress,
      };

      console.log(quote);
      const quoteResponse = await orderBookApi.getQuote(quote);

      let { buyAmount, sellAmount, feeAmount } = quoteResponse.quote;
      const buyAmountBN = BigNumber.from(buyAmount);
      const buyAmountWithSlippage = buyAmountBN
         .sub(
            buyAmountBN.div(100).mul(2) /// 2% slippage
         )
         .toString();

      const order = {
         kind: quote.kind as string as OrderKind,
         receiver: signerAddress,
         from: signerAddress,
         sellToken: quote.sellToken,
         buyToken: quote.buyToken,
         partiallyFillable: false, // "false" is for a "Fill or Kill" order, "true" for allowing "Partial execution" which is not supported yet
         // Deadline
         validTo: Math.floor(new Date().getTime() / 1000) + 2 * 60,
         // Limit Price
         //    You can apply some slippage tolerance here to make sure the trade is executed.
         //    CoW protocol protects from MEV, so it can work with higher slippages
         sellAmount,
         buyAmount: buyAmountWithSlippage,

         // Use the fee you received from the API
         feeAmount,

         // The appData allows you to attach arbitrary information (meta-data) to the order. Its explained in their own section. For now, you can use this 0x0 value
         appData:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
      };

      const signedOrder = await OrderSigningUtils.signOrder(
         order,
         SupportedChainId.GNOSIS_CHAIN,
         signer
      );

      orders.push({
         ...order,
         ...signedOrder,
      } as any);
   }

   return orders;
}

export async function sendOrdersToCow(
   orderBookApi: OrderBookApi,
   orders: OrderCreation[]
): Promise<OrderWithId[]> {
   return Promise.all(
      orders.map(async (order) => {
         return {
            ...order,
            id: await orderBookApi.sendOrder(order),
         };
      })
   );
}

export async function sendOrders(
   provider: providers.Provider,
   signer: Signer,
   signerAddress: Address,
   orderBookApi: OrderBookApi,
   targetAllocation: TargetAllocation,
   baseAsset: Address
): Promise<any> {
   targetAllocation = targetAllocationWithDefault(targetAllocation, baseAsset);
   const balances = await getBalances(
      signerAddress,
      targetAllocation,
      provider
   );
   logBalances(balances);

   const spender = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";

   for (const asset of targetAllocation) {
      const assetContract = new Contract(asset.token, erc20Abi, signer);
      const allowance = await assetContract.allowance(signerAddress, spender);
      console.log(allowance);
      if (allowance.isZero()) {
         await assetContract.approve(
            spender,
            "115792089237316195423570985008687907853269984665640564039457584007913129639935"
         );
      }
   }

   const currentBalancesInBaseAsset = await getBalancesInBaseAsset(
      orderBookApi,
      signerAddress,
      balances,
      baseAsset
   );
   logBalances(currentBalancesInBaseAsset);

   const targetBalancesInBaseAsset = getTargetBalancesInBaseAsset(
      currentBalancesInBaseAsset,
      targetAllocation
   );

   logBalances(targetBalancesInBaseAsset);

   const orders = await buildOrders(
      signer,
      orderBookApi,
      currentBalancesInBaseAsset,
      targetBalancesInBaseAsset,
      baseAsset,
      signerAddress
   );
   const ordersWithId = await sendOrdersToCow(orderBookApi, orders);
   return ordersWithId;
   // const signatureTx = await buildSignatureTx(
   //   settlementContractAddress,
   //   safeSdk,
   //   ordersWithId
   // );
   // return { orders: ordersWithId, signatureTxResponse };
}
