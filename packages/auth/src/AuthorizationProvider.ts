import { AuthContext } from "./AuthContext";
import { ethers } from "ethers";
import { Web3AuthModalPack } from "@safe-global/auth-kit";

export class AuthorizationProvider {
   // Should have code or functions to do with signing transactions
   private authModalPack: Web3AuthModalPack;
   private provider: ethers.providers.Web3Provider;
   private signer: ethers.Signer;

   constructor() {
      //Too much in init 🤷
      AuthContext.init();
      this.authModalPack = AuthContext.getInstance().getAuthModalPack();

      if (!this.authModalPack) {
         throw new Error("AuthModalPack is not initialized");
      }

      const provider = this.authModalPack.getProvider();
      if (!provider) {
         throw new Error("Provider is not initialized");
      }

      this.provider = new ethers.providers.Web3Provider(provider);
      this.signer = this.provider.getSigner();
   }

   public async signTransaction(
      tx: ethers.providers.TransactionRequest
   ): Promise<ethers.providers.TransactionResponse> {
      return await this.signer.sendTransaction(tx);
   }
}
