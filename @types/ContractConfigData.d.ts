import { ethers } from "ethers"

export type ContractConfigData = {
	name: string
	address: string
	abi: Array<
		{
			type: string
		} & Record<string, any>
	>
	provider: ethers.providers.Provider
	chainId: number
	startBlock: number
}
