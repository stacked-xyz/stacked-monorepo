import {
  OrderBookApi,
  OrderKind,
  Address,
  SigningScheme,
  OrderQuoteSideKindSell,
  OrderQuoteSideKindBuy,
  OrderCreation,
  OrderQuoteRequest,
} from "@cowprotocol/cow-sdk";
import { BigNumber, Contract, providers } from "ethers";

import settlementContractAbi from "./settlementContractAbi.json";
import erc20Abi from "./erc20Abi.json";

import Safe from "@safe-global/protocol-kit";
// import SafeApiKit from "@safe-global/api-kit";
import {
  OperationType,
  SafeTransaction,
} from "@safe-global/safe-core-sdk-types";
// import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";

interface AssetWeight {
  token: Address;
  weight: number;
}

type TargetAllocation = AssetWeight[];

interface ScalingFactor {
  token: Address;
  scalingFactor: number;
}

type ScalingFactors = ScalingFactor[];

type OrderWithId = OrderCreation & { id: string };

const PRECISION = 10000;

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

type Balances = Array<{ token: Address; balance: BigNumber }>;

export async function getBalances(
  safeAddress: Address,
  targetAllocation: TargetAllocation,
  provider: providers.Provider
): Promise<Balances> {
  return Promise.all(
    targetAllocation.map(async (asset) => {
      // get erc20 balance using ether
      const contract = new Contract(asset.token, erc20Abi, provider);
      return {
        token: asset.token,
        balance: await contract.balanceOf(safeAddress),
      };
    })
  );
}

export async function getBalancesInBaseAsset(
  orderBookApi: OrderBookApi,
  safeAddress: Address,
  balances: Balances,
  baseAsset: Address
): Promise<Balances> {
  return Promise.all(
    balances.map(async (asset) => {
      if (asset.token == baseAsset) {
        return asset;
      }

      const order = {
        sellToken: asset.token,
        buyToken: baseAsset,
        kind: OrderKind.SELL as unknown as OrderQuoteSideKindSell, // Fucked.
        sellAmountBeforeFee: asset.balance.toString(),
        from: safeAddress,
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

export function getScalingFactors(
  balances: Balances,
  targetAllocation: TargetAllocation
): ScalingFactors {
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
        scalingFactor: 0,
      };
    }
    const targetBalance = totalBalance
      .mul((targetWeight * PRECISION).toFixed())
      .div(PRECISION);
    const scalingFactor =
      asset.balance.mul(PRECISION).div(targetBalance).toNumber() / PRECISION;

    return {
      token: asset.token,
      scalingFactor,
    };
  });
}

const E = 0.0001;

export async function buildOrders(
  orderBookApi: OrderBookApi,
  balances: Balances,
  scalingFactors: ScalingFactors,
  baseAsset: Address,
  safeAddress: Address
): Promise<OrderCreation[]> {
  const scalingFactorMap = scalingFactors.reduce<Record<Address, number>>(
    (acc, asset) => {
      acc[asset.token] = asset.scalingFactor;
      return acc;
    },
    {}
  );

  const orders: OrderCreation[] = [];
  for (const asset of balances) {
    const scalingFactor = scalingFactorMap[asset.token]!;
    if (asset.token === baseAsset || Math.abs(1 - scalingFactor) < E) continue;
    const targetBalance = asset.balance
      .mul((scalingFactor * PRECISION).toFixed())
      .div(PRECISION);

    let quote: OrderQuoteRequest;
    if (targetBalance.gt(asset.balance)) {
      // Buy Portfolio Asset with Base Asset
      quote = {
        sellToken: baseAsset,
        buyToken: asset.token,
        kind: OrderQuoteSideKindBuy.BUY,
        buyAmountAfterFee: targetBalance.sub(asset.balance).toString(),
        from: safeAddress,
      };
    } else {
      quote = {
        sellToken: asset.token,
        buyToken: baseAsset,
        kind: OrderQuoteSideKindSell.SELL, // Fucked.
        sellAmountBeforeFee: asset.balance.sub(targetBalance).toString(),
        from: safeAddress,
        receiver: safeAddress,
      };
    }

    const quoteResponse = await orderBookApi.getQuote(quote);

    const { validTo, buyAmount, sellAmount, feeAmount } = quoteResponse.quote;

    orders.push({
      kind: quote.kind as string as OrderKind,
      receiver: safeAddress,
      from: safeAddress,
      sellToken: quote.sellToken,
      buyToken: quote.buyToken,
      partiallyFillable: false, // "false" is for a "Fill or Kill" order, "true" for allowing "Partial execution" which is not supported yet
      // Deadline
      validTo,
      // Limit Price
      //    You can apply some slippage tolerance here to make sure the trade is executed.
      //    CoW protocol protects from MEV, so it can work with higher slippages
      sellAmount,
      buyAmount,

      // Use the fee you received from the API
      feeAmount,

      // The appData allows you to attach arbitrary information (meta-data) to the order. Its explained in their own section. For now, you can use this 0x0 value
      appData:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      signingScheme: SigningScheme.PRESIGN,
      signature: "0x",
    });
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

export async function buildSignatureTx(
  settlementContractAddress: Address,
  safeSdk: Safe,
  orders: OrderWithId[]
): Promise<SafeTransaction> {
  const settlementContract = new Contract(
    settlementContractAddress,
    settlementContractAbi
  );

  return safeSdk.createTransaction({
    safeTransactionData: await Promise.all(
      orders.map(
        async ({ id }) =>
        ({
          ...(await settlementContract.populateTransaction.setPreSignature!(
            id,
            true
          )),
          to: settlementContractAddress,
          value: "0",
          operation: OperationType.Call,
        } as any)
      )
    ),
  });
}

export async function sendOrders(
  safeSdk: Safe,
  orderBookApi: OrderBookApi,
  provider: providers.Provider,
  settlementContractAddress: Address,
  safeAddress: Address,
  targetAllocation: TargetAllocation,
  baseAsset: Address
): Promise<any> {
  targetAllocation = targetAllocationWithDefault(targetAllocation, baseAsset);
  const balances = await getBalances(safeAddress, targetAllocation, provider);
  console.log("Balances: ", balances);

  const balancesInBaseAsset = await getBalancesInBaseAsset(
    orderBookApi,
    safeAddress,
    balances,
    baseAsset
  );
  console.log("BalancesInBaseAsset: ", balancesInBaseAsset);

  const scalingFactors = getScalingFactors(
    balancesInBaseAsset,
    targetAllocation
  );
  console.log("ScalingFactors: ", scalingFactors);

  const orders = await buildOrders(
    orderBookApi,
    balances,
    scalingFactors,
    baseAsset,
    safeAddress
  );
  console.log(orders);

  const ordersWithId = await sendOrdersToCow(orderBookApi, orders);
  const signatureTx = await buildSignatureTx(
    settlementContractAddress,
    safeSdk,
    ordersWithId
  );
  const signatureTxResponse = await safeSdk.executeTransaction(signatureTx);

  return { orders: ordersWithId, signatureTxResponse };
}
