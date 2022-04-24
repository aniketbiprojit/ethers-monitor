import { ethers } from "ethers"
import { Indexed } from "ethers/lib/utils"
import mongoose from "mongoose"
import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractFunctions } from "../models/ContractFunctions"
import { ContractRepository } from "../models/ContractModel"
import { Log } from "./Logger"
import { getProvider } from "./provider"

export class Sync {
	static contracts: ContractConfigData[]
	static initialSync: boolean = false
	static async init(contracts: ContractConfigData[]) {
		this.contracts = contracts
		await this.addContracts(contracts)
		await this.start(true)
		this.initialSync = true
	}

	public static async start(willStart = this.initialSync) {
		if (willStart === false) {
			return
		}
		const contracts = await ContractFunctions.getContracts()
		let arr: Promise<any>[] = []
		const limit = 5
		for (let index = 0; index < contracts.length; index++) {
			const element = contracts[index]
			arr.push(this.indexContract(element))
			if (arr.length > limit) {
				await Promise.all(arr)
				arr = []
			}
		}
	}

	private static async indexContract(contract: ContractRepository, _latestBlock?: number) {
		const contractInstance = new ethers.Contract(contract.address, contract.abi, getProvider(contract.rpcURL))
		const latestBlock = _latestBlock || (await contractInstance.provider.getBlockNumber())
		for (let index = 0; index < contract.abi.length; index++) {
			const { model, EventCollectionName, event } = this.getCollection(contract, index)
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
			if (contract.startBlock > block) {
				block = contract.startBlock
			}
			Log.info({ name: contract.name, EventCollectionName, block, latestBlock })
			const batchSize = 2_000
			if (latestBlock - block > batchSize) {
				let initialBlock = block
				Log.info(`Started indexing ${initialBlock}, ${latestBlock}:`, {
					name: contract.name,
					uid: contract.uid,
					event: event.name,
				})

				while (initialBlock + batchSize < latestBlock) {
					try {
						const queryData = await contractInstance.queryFilter(
							contractInstance.filters[event.name](),
							initialBlock,
							initialBlock + batchSize
						)
						for (let index = 0; index < queryData.length; index++) {
							const query = queryData[index]
							const m: any = { ...query, ...query.args }
							event.inputs
								.filter((elem) => elem.type === "tuple")
								.forEach((elem) => {
									let fin: any = {}
									let temp = (query as any).args[elem.name]
									Object.keys(temp).forEach((key) => {
										fin[key] = (query as any).args[elem.name][key]
										if (temp.indexed === true && temp instanceof Indexed) {
											fin[key] = (query as any).args[elem.name][key].hash
										}
									})
									m[elem.name] = fin
								})
							event.inputs
								.filter((elem) => elem.indexed === true)
								.forEach((elem) => {
									let temp = (query as any).args[elem.name]
									if (temp instanceof Indexed) m[elem.name] = temp.hash
								})
							await model.findOneAndUpdate(
								{ transactionHash: query.transactionHash },
								{ $set: m },
								{ upsert: true, new: true }
							)
						}
						Log.info({ EventCollectionName, initialBlock, latestBlock, blockDiff: latestBlock - initialBlock })
						initialBlock += batchSize

						await ContractFunctions.updateEvent(contract.uid, { ...event, indexedTill: initialBlock })
					} catch (err) {
						console.error(err)
						this.indexContract(contract, latestBlock)
						return
					}
				}
			} else {
				const queryData = await contractInstance.queryFilter(contractInstance.filters[event.name](), block, latestBlock)
				for (let index = 0; index < queryData.length; index++) {
					const query = queryData[index]
					const m: any = { ...query, ...query.args }
					event.inputs
						.filter((elem) => elem.type === "tuple")
						.forEach((elem) => {
							let fin: any = {}
							let temp = (query as any).args[elem.name]
							Object.keys(temp).forEach((key) => {
								fin[key] = (query as any).args[elem.name][key]
								if (temp.indexed === true && temp instanceof Indexed) {
									fin[key] = (query as any).args[elem.name][key].hash
								}
							})
							m[elem.name] = fin
						})
					event.inputs
						.filter((elem) => elem.indexed === true)
						.forEach((elem) => {
							let temp = (query as any).args[elem.name]
							if (temp instanceof Indexed) m[elem.name] = temp.hash
						})
					await new model(m).save()
				}
				Log.info({ EventCollectionName, block, latestBlock })
				await ContractFunctions.updateEvent(contract.uid, { ...event, indexedTill: latestBlock })
			}
			Log.debug(EventCollectionName)
			Log.debug({ Event: event.name, Inputs: event.inputs })
		}
	}

	public static getCollection(contract: ContractRepository, index: number) {
		const event = contract.abi[index]
		const EventCollectionName = `${contract.uid}-${event.name}`

		const r: any = {}
		event.inputs.forEach((elem) => {
			if (elem.type === "tuple") {
				const k: any = {}
				elem.components?.forEach((tuple_inner) => {
					k[tuple_inner.name] = String
				})
				r[elem.name] = k
			} else r[elem.name] = String
		})
		const collection = new mongoose.Schema(
			{
				transactionHash: { type: String },
				blockNumber: Number,
				...r,
			},
			{
				collection: EventCollectionName,
			}
		)
		let model =
			mongoose.models[EventCollectionName] || mongoose.model(EventCollectionName, collection, EventCollectionName)

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
