import "../loadEnv"
import { Log, LogLevelEnum } from "../utils/Logger"
import { join } from "path"
import { getListOfContracts, filterABIForEvents } from "../utils/contracts"
import { getConfig } from "../utils/getConfig"
import { MongoContainer } from "../utils/mongo"
import { ExpressConfig } from "../app/ExpressConfig"
import { Sync } from "../utils/Sync"
import cron from "node-cron"

class Initialize {
	static async init() {
		Log.logLevel = LogLevelEnum.info

		await MongoContainer.init(process.env.MONGO_HOST as string, process.env.MONGO_DB as string)

		const configFile = join(__dirname, "..", "config.json")
		let config = await getConfig(configFile)
		let contractsDir = config.contracts

		const contracts = await getListOfContracts(contractsDir)
		const filteredAbi = filterABIForEvents(contracts)

		Log.info(filteredAbi.map((elem) => ({ name: elem.name, chainId: elem.chainId })))
		const port = (process.env.PORT as string) || 8080

		new ExpressConfig(port)
		await Sync.init(filteredAbi)

		cron.schedule(process.env.CRON_SCHEDULE || "*/10 * * * *", async () => {
			await Sync.start()
			console.log("running a task")
		})
	}
}

Initialize.init()
