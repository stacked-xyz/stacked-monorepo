import { cache, useState, useEffect } from "react";

export interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    chainId: number;
    logoURI: string;
}

export interface Tokens {
    tokens: Token[];
}

export const UnknownToken: Token = {
    symbol: "N/A",
    name: "N/A",
    address: "N/A",
    decimals: 18,
    chainId: 0,
    logoURI: ""
}

const missingTokens = [
  {
    symbol: "1INCH",
    name: "",
    address: "0x7f7440C5098462f833E123B44B8A03E1d9785BAb",
    decimals: 18,
    chainId: 100,
    logoURI: "",
  },
];

export function useTokens(chainID: number) {
    const [ tokens, setTokens ] = useState<Token[]>([]);
    useEffect(() => {
        (async () => {
            const tokens = await getTokens()
            setTokens(tokens.concat(missingTokens).filter((token) => token.chainId === chainID))
        })().catch((error) => {
        })
    }, [setTokens, chainID])

    return { tokens, tokensMap: tokensMap(tokens) }
}

const tokensMap = cache(function _tokensMap(tokens: Token[]) {
    const map = new Map<string, Token>();
    tokens.forEach((token) => {
        map.set(token.address.toLowerCase(), token);
    });
    return map;
})

const getTokens = cache(async function _getTokens(): Promise<Token[]> {
    const json = await fetch(
        "https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwap.json",
        { mode: "cors" }
    );

    const data = await json.json() as Tokens;
    return data.tokens
})