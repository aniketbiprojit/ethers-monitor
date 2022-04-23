import { ethers } from "ethers"
import { readdirSync } from "fs"
import { isAbsolute, join } from "path"
import { ContractConfigData } from "../@types/ContractConfigData"
import { Log } from "./Logger"
import { getChainId, getProvider, ProviderContainer } from "./provider"

export const getListOfContracts = async (contractsDir: string) => {
	return (
		await Promise.all(
			readdirSync(contractsDir)
				.filter((file) => {
					return file.endsWith(".json")
				})
				.map(async (elem) => {
					let completePath: string
					if (isAbsolute(contractsDir)) {
						completePath = join(contractsDir, elem)
					} else {
						completePath = join(__dirname, "..", "..", contractsDir, elem)
					}
					const importedData = (await import(completePath)).default
					importedData.address = ethers.utils.getAddress(importedData.address)
					if (importedData?.name === undefined) {
						importedData.name = elem.replace(".json", "")
					}
					if (importedData.provider === undefined) {
						importedData.provider = ProviderContainer.defaultProvider
						try {
							importedData.chainId = await ProviderContainer.defaultChainId()
						} catch (err) {
							Log.error(err)
							Log.error("Failed to load chain id for contract(default provider): " + importedData.name)
						}
					} else {
						importedData.provider = getProvider(importedData.provider)
						try {
							importedData.chainId = await getChainId(importedData.provider)
						} catch (err) {
							Log.error(err)
							Log.error("Failed to load chain id for contract(custom provider): " + importedData.name)
						}
					}
					importedData.rpcURL = importedData?.provider?.connection?.url || "" // importedData.provider as ethers.providers.Provider
					if (importedData.startBlock) {
						try {
							importedData.startBlock = parseInt(importedData?.startBlock?.toString())
						} catch (err) {
							Log.error("Failed to parse startBlock")
							importedData.startBlock = 0
						}
					} else {
						importedData.startBlock = 0
					}
					return importedData
				})
		)
	)
		.filter((elem) => {
			const keys = Object.keys(elem)
			return keys.includes("abi") && keys.includes("address")
		})
		.filter((elem) => elem.chainId !== undefined) as ContractConfigData[]
}
export const filterABIForEvents = (contracts: ContractConfigData[]) => {
	return contracts.map((elem) => {
		elem.abi = elem.abi.filter((abiElem) => {
			return abiElem.type === "event"
		})
		return elem
	})
}
