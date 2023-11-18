import {
  OrderBookApi,
  OrderKind,
  Address,
  SigningScheme,
  OrderQuoteSideKindSell,
  OrderCreation,
} from "@cowprotocol/cow-sdk";
import { BigNumber, Contract } from "ethers";
import settlementContractAbi from "./settlementContractAbi.json";

import Safe from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";

interface AssetAllocation {
  token: Address;
  allocation: number;
}

type Orders = Array<{
  id: string;
  order: OrderCreation;
  signTx: MetaTransactionData;
}>;

export async function sendOrders(
  safeSdk: Safe,
  safeService: SafeApiKit,
  orderBookApi: OrderBookApi,
  settlementContractAddress: Address,
  receiver: Address,
  senderAddress: Address,
  assetAllocations: AssetAllocation[],
  sellToken: Address,
  amount: BigNumber
): Promise<any> {
  const orders: Orders = [];

  const settlementContract = new Contract(
    settlementContractAddress,
    settlementContractAbi
  );

  for (const assetAllocation of assetAllocations) {
    const order = {
      sellToken: sellToken,
      buyToken: assetAllocation.token,
      kind: OrderKind.SELL as unknown as OrderQuoteSideKindSell, // Fucked.
      sellAmountBeforeFee: amount
        .mul(assetAllocation.allocation)
        .div(100)
        .toString(),
      from: receiver,
    };

    const quoteResponse = await orderBookApi.getQuote(order);

    const { buyToken, validTo, buyAmount, sellAmount, feeAmount } =
      quoteResponse.quote;

    // Prepare the RAW order
    const orderCreation = {
      kind: OrderKind.SELL, // SELL or BUY
      receiver,
      from: receiver,
      sellToken,
      buyToken,

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
    };

    const id = await orderBookApi.sendOrder(orderCreation);
    console.log(id);
    orders.push({
      id,
      order: orderCreation,
      signTx: (await settlementContract.populateTransaction.setPreSignature!(
        id,
        true
      )) as any,
    });
  }

  const presignTx = await safeSdk.createTransaction({
    safeTransactionData: orders.map(({ signTx }) => ({
      ...signTx,
      value: "0",
      operation: OperationType.Call,
    })),
  });
  // const executeTxResponse = await safeSdk.executeTransaction(presignTx);
  // console.log(executeTxResponse);

  // const nonce = await safeService.getNextNonce(receiver); Do we need ?
  const safeTxHash = await safeSdk.getTransactionHash(presignTx);
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
  console.log(safeTxHash);
  console.log(senderSignature);

  await safeService.proposeTransaction({
    safeAddress: receiver,
    safeTransactionData: presignTx.data,
    safeTxHash,
    senderAddress,
    senderSignature: senderSignature.data,
  });

  return orders;
}
