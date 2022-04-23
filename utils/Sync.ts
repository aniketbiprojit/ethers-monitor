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
			Log.info(`Adding or added: ${contract.name}(${contract.uid})`)
			Log.debug("Events found:")
			for (let index = 0; index < contract.abi.length; index++) {
				const element = contract.abi[index]
				Log.debug(element.name)
			}
		}
	}
}
