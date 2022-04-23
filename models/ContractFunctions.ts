import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractModel, ContractRepository } from "./ContractModel"

export class ContractFunctions {
	static async add(contractData: ContractConfigData) {
		const { address, chainId } = contractData
		const uid = ContractFunctions.getUid(address, chainId)
		const contract: ContractRepository = {
			uid,
			name: contractData.name,
			address,
			abi: contractData.abi.map((elem) => ({ ...elem, indexedTill: 0 })),
			chainId,
			startBlock: contractData.startBlock,
			rpcURL: contractData.rpcURL,
			indexedTill: contractData.startBlock,
		}
		const contractInstance = await ContractModel.findOne({ uid })
		if (!contractInstance) {
			return await ContractModel.findOneAndUpdate(
				{ uid },
				{ $set: { ...contract, abi: contract.abi } },
				{ upsert: true, new: true }
			)
		} else {
			contractInstance.rpcURL = contractData.rpcURL
		}
		return contractInstance
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
			await ContractModel.updateOne({ uid }, { $set: { abi: abis } })

			return
		}
	}

	private static getUid(address: string, chainId: number) {
		return `${address}-${chainId}`
	}
}
