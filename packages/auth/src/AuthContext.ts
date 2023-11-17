import { Web3AuthModalPack, Web3AuthConfig } from "@safe-global/auth-kit";
import { Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

export class AuthContext {
   private static instance: AuthContext;
   private web3AuthModalPack: Web3AuthModalPack;

   private constructor() {
      // Private constructor ensures the Singleton pattern
   }

   public static async init() {
      if (!this.instance) {
         this.instance = new AuthContext();

         // Configure safe stuff
         // https://web3auth.io/docs/sdk/pnp/web/modal/initialize#arguments
         const options: Web3AuthOptions = {
            clientId:
               process.env.CLIENT_ID ||
               "BNgmLOYGOV5Zw0VsoCKlZ6i1ylOqMuCBvkxlTAISsyBX6-9YvHhFmu228dSeigr0XZEx9xFVNwf0AsR7B_ed4LI",
            web3AuthNetwork: "testnet",
            chainConfig: {
               chainNamespace: CHAIN_NAMESPACES.EIP155,
               chainId: "0x5",
               // https://chainlist.org/
               rpcTarget: "https://rpc.ankr.com/eth_goerli",
            },
            uiConfig: {
               theme: "dark",
               loginMethodsOrder: ["google", "facebook"],
            },
         };

         // https://web3auth.io/docs/sdk/pnp/web/modal/initialize#configuring-adapters
         const modalConfig = {
            [WALLET_ADAPTERS.TORUS_EVM]: {
               label: "torus",
               showOnModal: false,
            },
            [WALLET_ADAPTERS.METAMASK]: {
               label: "metamask",
               showOnDesktop: true,
               showOnMobile: false,
            },
         };

         // https://web3auth.io/docs/sdk/pnp/web/modal/whitelabel#whitelabeling-while-modal-initialization
         const openloginAdapter = new OpenloginAdapter({
            loginSettings: {
               mfaLevel: "mandatory",
            },
            adapterSettings: {
               uxMode: "popup",
               whiteLabel: {
                  name: "Safe",
               },
            },
         });

         const web3AuthConfig: Web3AuthConfig = {
            txServiceUrl: "https://safe-transaction-goerli.safe.global",
         };

         this.instance.web3AuthModalPack = new Web3AuthModalPack(
            web3AuthConfig
         );
         await this.instance.web3AuthModalPack.init({
            options,
            adapters: [openloginAdapter],
            modalConfig,
         });
      }
   }

   public static getInstance(): AuthContext {
      if (!this.instance) {
         throw new Error("AuthContext is not initialized. Call init() first.");
      }
      return this.instance;
   }

   public getAuthModalPack(): Web3AuthModalPack {
      return this.web3AuthModalPack;
   }
}
