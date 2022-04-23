import mongoose from "mongoose"
import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractFunctions } from "../models/ContractFunctions"
import { ContractRepository } from "../models/ContractModel"
import { Log } from "./Logger"

export class Sync {
	static contracts: ContractConfigData[]
	static async init(contracts: ContractConfigData[]) {
		Sync.contracts = contracts
		await Sync.addContracts(contracts)
		await Sync.start()
	}

	private static async start() {
		const contracts = await ContractFunctions.getContracts()
		for (let index = 0; index < contracts.length; index++) {
			const element = contracts[index]
			await Sync.indexContract(element)
		}
	}

	private static async indexContract(contract: ContractRepository) {
		for (let index = 0; index < contract.abi.length; index++) {
			const { EventCollectionName, event } = Sync.getCollection(contract, index)

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
		const collection = new mongoose.Schema({
			...r,
		})
		const model = mongoose.model(EventCollectionName, collection, EventCollectionName)
		return { collection, model, EventCollectionName, event }
	}

	private static async addContracts(contracts: ContractConfigData[]) {
		for (let index = 0; index < contracts.length; index++) {
			const contract = await ContractFunctions.add(contracts[index])
			Log.info(`\n\nAdding: `, { name: contract.name, uid: contract.uid })
			Log.info("Events found:")
		}
	}
}
