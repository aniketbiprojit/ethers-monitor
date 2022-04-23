import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractModel, ContractRepository } from "./ContractModel"

export class ContractFunctions {
	static add(contractData: ContractConfigData) {
		const { address, chainId } = contractData
		const uid = ContractFunctions.getUid(address, chainId)
		const contract: ContractRepository = {
			uid,
			name: contractData.name,
			address,
			abi: contractData.abi,
			chainId,
			startBlock: contractData.startBlock,
			rpcURL: contractData.rpcURL,
			indexedTill: contractData.startBlock,
		}
		return ContractModel.findOneAndUpdate({ uid }, { $set: contract }, { upsert: true, new: true })
	}

	private static getUid(address: string, chainId: number) {
		return `${address}-${chainId}`
	}
}
