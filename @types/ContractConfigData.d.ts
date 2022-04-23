import { ethers } from "ethers"

export type ContractConfigData = {
	name: string
	address: string
	abi: Array<{
		type: string
		inputs: { name: string; type: string; indexed: boolean }[]
	}>
	provider: ethers.providers.Provider
	chainId: number
	startBlock: number
	rpcURL: string
}
