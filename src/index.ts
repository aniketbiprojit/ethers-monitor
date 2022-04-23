import "../loadEnv"
import { join } from "path"
import { getListOfContracts, filterABIForEvents } from "./utils/contracts"
import { getConfig } from "./utils/getConfig"

const main = async () => {
	const configFile = join(__dirname, "..", "config.json")
	let config = await getConfig(configFile)
	let contractsDir = config.contracts

	const contracts = await getListOfContracts(contractsDir)
	const filteredAbi = filterABIForEvents(contracts)
	console.log(filteredAbi.map((elem) => ({ name: elem.name, chainId: elem.chainId })))
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
