import { ethers } from "ethers"

export class ProviderContainer {
	private static _defaultProvider: ethers.providers.Provider
	public static get defaultProvider(): ethers.providers.Provider {
		if (!this._defaultProvider) {
			this._defaultProvider = new ethers.providers.JsonRpcProvider('https://speedy-nodes-nyc.moralis.io/34739a5bf4f27241c9deddc2/eth/mainnet')
		}
		return this._defaultProvider
	}

	private static _defaultChainId: number
	public static async defaultChainId(): Promise<number> {
		if (!ProviderContainer._defaultChainId) {
			const network = await this.defaultProvider.getNetwork()
			this._defaultChainId = network.chainId
		}
		return ProviderContainer._defaultChainId
	}
}

export const getProvider = (rpcURL: string) => {
	return new ethers.providers.JsonRpcProvider(rpcURL)
}

export const getChainId = async (provider: ethers.providers.Provider) => {
	return (await provider.getNetwork()).chainId
}
