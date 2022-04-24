import { ethers } from "ethers"

export type ContractConfigData = {
	name: string
	address: string
	abi: Array<{
		type: string
		name: string
		inputs: { name: string; type: string; indexed: boolean; components?: any[] }[]
	}>
	provider: ethers.providers.Provider
	chainId: number
	startBlock: number
	rpcURL: string
}
