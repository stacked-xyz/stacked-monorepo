import { useState, useEffect, cache } from "react";
import { OrderBookApi, Order } from "@cowprotocol/cow-sdk";

export type { Order }

export function useOrderHistory(
    address: string,
    chainId: number
): { orders: Order[]; loaded: boolean, error: Error | undefined } {
    const [ loaded, setLoaded ] = useState(false);
    const [ orders, setOrders ] = useState<Order[]>([]);
    const [ error, setError ] = useState<Error>();

    useEffect(() => {
        (async () => {
            const orderBookApi = new OrderBookApi({ chainId });
            setOrders(await orderBookApi.getOrders({ owner: address }));
            setLoaded(true);
        })().catch((error: Error) => {
            setError(error);
        })
    }, [address, chainId, setLoaded, setOrders, setError])

    return { loaded, orders, error}
}
