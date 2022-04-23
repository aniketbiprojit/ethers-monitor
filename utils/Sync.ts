import { ContractConfigData } from "../@types/ContractConfigData"
import { ContractFunctions } from "../models/ContractFunctions"
import { Log } from "./Logger"

export class Sync {
	static contracts: ContractConfigData[]
	static async init(contracts: ContractConfigData[]) {
		Sync.contracts = contracts
		await Sync.addContracts(contracts)
	}

	private static async addContracts(contracts: ContractConfigData[]) {
		for (let index = 0; index < contracts.length; index++) {
			const contract = await ContractFunctions.add(contracts[index])
			Log.info(`Adding: `, { name: contract.name, uid: contract.uid })
			Log.info("Events found:")
			for (let index = 0; index < contract.abi.length; index++) {
				const element = contract.abi[index]
				Log.info({ Event: element.name, Inputs: element.inputs })
			}
		}
	}
}
