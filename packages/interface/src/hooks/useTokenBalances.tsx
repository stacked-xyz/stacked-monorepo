import { BigNumber, Contract, providers } from "ethers";
import { useEffect, useState } from "react";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
];

export function useTokenBalances(
    tokens: string[],
    ownerAddress: string | undefined,
    provider: providers.Provider | undefined,
): { balancesByAddress: Map<string, BigNumber>; loaded: boolean; error: Error | undefined } {
    const [ loaded, setLoaded ] = useState(false);
    const [balancesByAddress, setBalancesByAddress] = useState<Map<string, BigNumber>>(new Map<string, BigNumber>());
    const [ error, setError ] = useState<Error>();

    useEffect(() => {
        (async () => {
            let balances = new Map<string, BigNumber>();
            for (const token of tokens) {
                const tokenContract = new Contract(token, ERC20_ABI, provider);
                const balance = await tokenContract.balanceOf(ownerAddress);
                balances.set(token, balance);
            }
            setBalancesByAddress(balances);
            setLoaded(true);
        })().catch((error: Error) => {
            setError(error);
        })
    }, [tokens, ownerAddress, provider , setBalancesByAddress, setLoaded, setError])

    return { balancesByAddress, loaded, error };
}