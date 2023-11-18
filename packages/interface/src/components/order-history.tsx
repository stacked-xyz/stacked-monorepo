import { useState } from "react";
import { utils, BigNumber } from "ethers";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTokens, Token, UnknownToken } from "@/hooks/useTokens";
import { useOrderHistory, Order } from "@/hooks/useOrderHistory";

const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const formatDate = (date: Date) => {
    return `${date.getDate()} ` + 
           `${date.toLocaleDateString('en-US', {month: 'short'})} ` +
           `${date.getFullYear()}, ${formatter.format(date)}`;
}

export function OrderHistory() {
    // Load these from state
    const wallet = "0x9EB8c96CDfF9712c0f428E26B1E9bad2d07e3091";
    const chainID = 100;

    const { tokensMap } = useTokens(chainID);
    const { orders, loaded } = useOrderHistory(wallet, chainID);

    const parsedOrders = orders.map((order) => {
        const fromToken:Token = tokensMap.get(order.sellToken.toLowerCase()) || UnknownToken;
        const toToken:Token = tokensMap.get(order.buyToken.toLowerCase()) || UnknownToken;

        const fromAmount = utils.formatUnits(order.sellAmount, fromToken.decimals);
        const toAmount = utils.formatUnits(order.buyAmount, fromToken.decimals);

        return {
            type: order.kind,
            time: formatDate(new Date(order.creationDate)),
            from: `${fromAmount} ${fromToken.symbol}`,
            to: `${toAmount} ${toToken.symbol}`,
            validTo: formatDate(new Date(order.validTo + 1000)),
            status: order.status
        }
    })

    return (
        <Table>
            <TableCaption>Order History.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Order Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Valid until</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {parsedOrders.map((order) => (
                <TableRow key={order.time}>
                    <TableCell className="font-medium">{order.type}</TableCell>
                    <TableCell>{order.time}</TableCell>
                    <TableCell>{order.from}</TableCell>
                    <TableCell>{order.to}</TableCell>
                    <TableCell>{order.validTo}</TableCell>
                    <TableCell><div>{order.status}</div></TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    );
}
