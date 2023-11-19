import { Chain } from "../models/chain";

export const gnosisChain: Chain = {
   id: "0x64",
   token: "xDai",
   shortName: "gno",
   label: "Gnosis Chain",
   rpcUrl: "https://rpc.gnosischain.com",
   blockExplorerUrl: "https://gnosisscan.io",
   color: "#3e6957",
   transactionServiceUrl: "https://safe-transaction-gnosis-chain.safe.global",
   baseAssetAddress: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d" // wxdai
};

export const goerliChain: Chain = {
   id: "0x5",
   token: "gETH",
   label: "Görli",
   shortName: "gor",
   rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
   blockExplorerUrl: "https://goerli.etherscan.io",
   color: "#fbc02d",
   transactionServiceUrl: "https://safe-transaction-goerli.safe.global",
   baseAssetAddress: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C" // usdc
};

export const mainnetChain: Chain = {
   id: "0x1",
   token: "ETH",
   label: "Ethereum",
   shortName: "eth",
   rpcUrl: "https://cloudflare-eth.com",
   blockExplorerUrl: "https://etherscan.io",
   color: "#DDDDDD",
   transactionServiceUrl: "https://safe-transaction-mainnet.safe.global",
   baseAssetAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
};

export const chains: Chain[] = [gnosisChain, goerliChain, mainnetChain];
export const initialChain = gnosisChain;
