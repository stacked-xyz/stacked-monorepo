import fleekStorage from "@fleekhq/fleek-storage-js";
import { Composition, token } from "./types";
import "dotenv/config";
import fs from "fs";

export class CompositionRepo {
   private isInitialised: boolean = false;
   private fleekSecret: string = "";
   private fleekKey: string = "";
   private supportedTokens: token[] = [];

   public async init() {
      if (!this.isInitialised) {
         if (
            !process.env.REACT_APP_FLEEK_KEY ||
            !process.env.REACT_APP_FLEEK_SECRET
         ) {
            throw new Error("Fleek key and secret must be provided");
         }

         try {
            this.fleekKey = process.env.REACT_APP_FLEEK_KEY;
            this.fleekSecret = process.env.REACT_APP_FLEEK_SECRET;
            this.supportedTokens = await this.getSupportedTokens();
         } catch (e) {
            console.error(e);
         }
         this.isInitialised = true;
      }
   }

   public async updateComposition(
      user: string,
      composition: Composition,
      chainId: number
   ): Promise<void> {
      this.validateComposition(composition, chainId);
      await this.setComposition(user, composition);
   }

   public async getComposition(user: string): Promise<Composition> {
      if (!user) {
         throw new Error("User public key must be provided");
      }

      let composition: Composition;

      const downloadParams = {
         apiKey: this.fleekKey,
         apiSecret: this.fleekSecret,
         key: user,
      };

      try {
         let compositionRaw = (await fleekStorage.get(downloadParams)).data;
         composition = JSON.parse(compositionRaw);
      } catch (e) {
         throw new Error(`Error downloading composition: ${e}`);
      }

      return composition;
   }

   private async getSupportedTokens(): Promise<token[]> {
      const json = await fetch(
         "https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CowSwap.json",
         { mode: "cors" }
      );
      const data = await json.json();
      return data.tokens;
   }

   private validateComposition(
      composition: Composition,
      chainId: number
   ): void {
      try {
         if (composition.assets.length != composition.allocations.length) {
            throw new Error("Assets and allocations must be the same length");
         }
         for (let asset in composition.assets) {
            if (
               !this.supportedTokens.some(
                  (token) =>
                     token.address.toLowerCase() === asset.toLowerCase() &&
                     token.chainId === chainId
               )
            ) {
               throw new Error("Asset not supported" + asset);
            }
         }
         const sum: number = composition.allocations.reduce(
            (sum, value) => sum + value,
            0
         );
         if (sum != 1) {
            throw new Error("Allocation must sum to 100%");
         }
      } catch (e) {
         throw new Error(`Error validating composition: ${e}`);
      }
   }

   private async setComposition(
      user: string,
      composition: Composition
   ): Promise<boolean> {
      if (!user) {
         throw new Error("User public key must be provided");
      }

      let uploadResult;

      const uploadParams = {
         apiKey: this.fleekKey,
         apiSecret: this.fleekSecret,
         key: user,
         data: JSON.stringify(composition),
      };

      try {
         uploadResult = await fleekStorage.upload(uploadParams);
         console.log(`Uploaded composition for user(${user})`, uploadResult);
      } catch (e) {
         throw new Error(`Error uploading composition for user(${user}): ${e}`);
      }

      return true;
   }
}
