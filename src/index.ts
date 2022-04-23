import "../loadEnv"
import { Log, LogLevelEnum } from "./utils/Logger"
import { join } from "path"
import { getListOfContracts, filterABIForEvents } from "./utils/contracts"
import { getConfig } from "./utils/getConfig"
import { MongoContainer } from "./utils/mongo"

const main = async () => {
	Log.logLevel = LogLevelEnum.info

	await MongoContainer.init(process.env.MONGO_HOST as string, process.env.MONGO_DB as string)

	const configFile = join(__dirname, "..", "config.json")
	let config = await getConfig(configFile)
	let contractsDir = config.contracts

	const contracts = await getListOfContracts(contractsDir)
	const filteredAbi = filterABIForEvents(contracts)
	Log.info(filteredAbi.map((elem) => ({ name: elem.name, chainId: elem.chainId })))
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		Log.error(error)
		process.exit(1)
	})
