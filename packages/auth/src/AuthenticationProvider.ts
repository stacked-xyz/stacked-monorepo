import { AuthContext } from "./AuthContext";
import { ethers } from "ethers";
import { AuthKitSignInData, Web3AuthModalPack } from "@safe-global/auth-kit";

export class AuthenticationProvider {
    private authModalPack: Web3AuthModalPack;
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.Signer;

    constructor() {
        AuthContext.init();
        this.authModalPack = AuthContext.getInstance().getAuthModalPack();
    }

    public async signIn(): Promise<AuthKitSignInData> {
        // Calling signIn method from the Web3AuthModalPack instance
        const authKitSignData = await this.authModalPack.signIn();
        return authKitSignData;

    }

    public async signOut(): Promise<void> {
        // Calling signOut method from the Web3AuthModalPack instance
        await this.authModalPack.signOut();
    }
}
