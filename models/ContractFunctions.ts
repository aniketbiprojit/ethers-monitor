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

	static getContracts() {
		return ContractModel.find()
	}

	static async updateEvent(uid: string, event: { name: string; indexedTill: number }) {
		const contract = await ContractModel.findOne({ uid })
		if (contract) {
			let abis = contract.abi
			for (let index = 0; index < abis.length; index++) {
				if (abis[index]?.name === event.name) {
					abis[index].indexedTill = event.indexedTill
				}
			}
			contract.abi = abis
			await contract.save()
			return
		}
	}

	private static getUid(address: string, chainId: number) {
		return `${address}-${chainId}`
	}
}
