import { existsSync } from "fs"

export async function getConfig(configFile: string) {
	let config: { contracts?: string | undefined } = {}

	if (existsSync(configFile)) {
		config = (await import(configFile)).default
	}
	if (!config?.contracts) {
		config.contracts = "./contracts"
	}
	return config as { contracts: string }
}
