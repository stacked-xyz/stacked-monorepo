import fleekStorage from "@fleekhq/fleek-storage-js";
import { Composition, token } from "./types";
import "dotenv/config";

export class CompositionRepo {
  private isInitialised: boolean = false;
  //   private fleekSecret: string = "";
  //   private fleekKey: string = "";
  private supportedTokens: token[] = [];

  public async init() {
    if (!this.isInitialised) {
      // if (
      //   !process.env.NEXT_APP_FLEEK_KEY ||
      //   !process.env.NEXT_APP_FLEEK_SECRET
      // ) {
      //   throw new Error("Fleek key and secret must be provided");
      // }

      try {
        //   this.fleekKey = process.env.NEXT_APP_FLEEK_KEY;
        //   this.fleekSecret = process.env.NEXT_APP_FLEEK_SECRET;
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
      apiKey: "DlJ495iN08EqqR4pumMtjA==",
      apiSecret: "3JjL/0UuKHSKP9jgv4kxNAPdB6V8JbcuyyLC99pUdnA=",
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

  private validateComposition(composition: Composition, chainId: number): void {
    try {
      if (composition.assets.length != composition.allocations.length) {
        throw new Error("Assets and allocations must be the same length");
      }

      for (let index = 0; index < composition.assets.length; index++) {
        const asset = composition.assets[index];

        if (
          !this.supportedTokens.some(
            (token) => token.symbol.toLowerCase() === asset?.toLowerCase()
            // token.chainId === chainId
          )
        ) {
          throw new Error("Asset not supported" + asset);
        }
      }

      const sum: number = composition.allocations.reduce(
        (sum, value) => sum + value,
        0
      );
      if (sum != 100) {
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
      apiKey: "DlJ495iN08EqqR4pumMtjA==",
      apiSecret: "3JjL/0UuKHSKP9jgv4kxNAPdB6V8JbcuyyLC99pUdnA=",
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
