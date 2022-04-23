import { ethers } from "ethers"
import mongoose from "mongoose"
import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractFunctions } from "../models/ContractFunctions"
import { ContractRepository } from "../models/ContractModel"
import { Log } from "./Logger"
import { getProvider } from "./provider"

export class Sync {
	static contracts: ContractConfigData[]
	static async init(contracts: ContractConfigData[]) {
		Sync.contracts = contracts
		await Sync.addContracts(contracts)
		await Sync.start()
	}

	public static async start() {
		const contracts = await ContractFunctions.getContracts()
		for (let index = 0; index < contracts.length; index++) {
			const element = contracts[index]
			await Sync.indexContract(element)
		}
	}

	private static async indexContract(contract: ContractRepository) {
		const contractInstance = new ethers.Contract(contract.address, contract.abi, getProvider(contract.rpcURL))
		const latestBlock = await contractInstance.provider.getBlockNumber()
		for (let index = 0; index < contract.abi.length; index++) {
			const { model, EventCollectionName, event } = Sync.getCollection(contract, index)
			const fetchedData = await model.find().sort({ blockNumber: -1 }).limit(1)

			let block =
				fetchedData.length > 0
					? fetchedData[0].blockNumber > contract.startBlock
						? fetchedData[0].blockNumber
						: contract.startBlock
					: contract.startBlock
			if (event.indexedTill && block < event.indexedTill) {
				block = event.indexedTill
			}
			Log.info({ EventCollectionName, block, latestBlock })
			const batchSize = 2000
			if (latestBlock - block > batchSize) {
				let initialBlock = block
				for (let index = initialBlock; index < (latestBlock - initialBlock) / batchSize; index++) {
					const queryData = await contractInstance.queryFilter(
						contractInstance.filters[event.name](),
						initialBlock,
						initialBlock + batchSize
					)
					for (let index = 0; index < queryData.length; index++) {
						const query = queryData[index]
						await model.findOneAndUpdate(
							{ ...query, ...query.args },
							{ $set: { ...query, ...query.args } },
							{ upsert: true, new: true }
						)
					}
					Log.info({ EventCollectionName, block, latestBlock })
					initialBlock += batchSize
					await ContractFunctions.updateEvent(contract.uid, { ...event, indexedTill: initialBlock })
				}
			} else {
				const queryData = await contractInstance.queryFilter(contractInstance.filters[event.name](), block, latestBlock)
				for (let index = 0; index < queryData.length; index++) {
					const query = queryData[index]
					await new model({ ...query, ...query.args }).save()
				}
				Log.info({ EventCollectionName, block, latestBlock })
				await ContractFunctions.updateEvent(contract.uid, { ...event, indexedTill: latestBlock })
			}
			Log.debug(EventCollectionName)
			Log.debug({ Event: event.name, Inputs: event.inputs })
		}
	}

	private static getCollection(contract: ContractRepository, index: number) {
		const event = contract.abi[index]
		const EventCollectionName = `${contract.uid}-${event.name}`
		const r: any = {}
		event.inputs.forEach((elem) => {
			r[elem.name] = String
		})
		const collection = new mongoose.Schema(
			{
				transactionHash: String,
				blockNumber: Number,
				...r,
			},
			{
				collection: EventCollectionName,
			}
		)
		const model = mongoose.model(EventCollectionName, collection, EventCollectionName)
		return { collection, model, EventCollectionName, event }
	}

	private static async addContracts(contracts: ContractConfigData[]) {
		for (let index = 0; index < contracts.length; index++) {
			const contract = await ContractFunctions.add(contracts[index])
			console.log()
			Log.info(`Added:`, { name: contract.name, uid: contract.uid })
		}
	}
}
