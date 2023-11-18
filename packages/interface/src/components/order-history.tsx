import { OrderBookApi } from "@cowprotocol/cow-sdk";
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
interface Order {
    type: string;
    time: string;
    from: string;
    to: string;
    validTo: string;
    status: string;
}
interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    chainId: number;
    logoURI: string;
}
const MAX = 8;

const missingTokens = [
    {
    symbol: "1INCH",
    name: "",
    address: "0x7f7440C5098462f833E123B44B8A03E1d9785BAb",
    decimals: 18,
    chainId: 100,
    logoURI: "",
    }
];

export async function OrderHistory({ wallet, chainId }: { wallet: string, chainId: number }) {
    wallet = "0x9EB8c96CDfF9712c0f428E26B1E9bad2d07e3091";
    chainId = 100;
    let cowTokens = await getTokens();
    cowTokens = cowTokens.concat(missingTokens);


    const options = { month: 'short' };
    const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const orderBookApi = new OrderBookApi({ chainId });
    const rawOrders = await orderBookApi.getOrders({ owner: wallet });
    //console.log(rawOrders);
    let orders: Order[] = [];


    for (const order of rawOrders) {
        console.log(order);
        let creationDate = new Date(order.creationDate);
        let tillDate = new Date(order.validTo * 1000);

        const formattedCreationDate = `${creationDate.getDate()} ${creationDate.toLocaleDateString('en-US', options)} ${creationDate.getFullYear()}, ${formatter.format(creationDate)}`;
        const formattedTillDate = `${tillDate.getDate()} ${tillDate.toLocaleDateString('en-US', options)} ${tillDate.getFullYear()}, ${formatter.format(tillDate)}`;
       
        const fromToken:Token = cowTokens.find((token: Token) => token.address.toLowerCase() === order.sellToken.toLowerCase() && token.chainId === chainId );
        const toToken:Token = cowTokens.find((token: Token) => token.address.toLowerCase() === order.buyToken.toLowerCase() && token.chainId === chainId );
        const fromAmount:string = utils.formatUnits(order.sellAmount, Math.min(MAX, fromToken.decimals));
        const toAmount:string = utils.formatUnits(order.buyAmount, Math.min(MAX, fromToken.decimals));

        orders.push({
            type: order.kind,
            time: formattedCreationDate,
            from: `${fromAmount} ${fromToken.symbol}`,
            to: `${toAmount} ${toToken.symbol}`,
            validTo: formattedTillDate,
            status: order.status
        })

    }


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
            {orders.map((order) => (
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

async function getTokens() {
    const json = await fetch(
        "https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwap.json",
        { mode: "cors" }
    );
    const data = await json.json();
    return data.tokens;
}