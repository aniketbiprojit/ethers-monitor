import { ethers } from "ethers"
import { readdirSync } from "fs"
import { isAbsolute, join } from "path"
import { getChainId, getProvider, ProviderContainer } from "./provider"

type ContractConfigData = {
	name: string
	address: string
	abi: Array<
		{
			type: string
		} & Record<string, any>
	>
	provider: ethers.providers.Provider
	chainId: number
}

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
					if (importedData?.name === undefined) {
						importedData.name = elem.replace(".json", "")
					}
					if (importedData.provider === undefined) {
						importedData.provider = ProviderContainer.defaultProvider
						try {
							importedData.chainId = await ProviderContainer.defaultChainId()
						} catch (err) {
							console.error(err)
							console.error("Failed to load chain id for contract(default provider): " + importedData.name)
						}
					} else {
						importedData.provider = getProvider(importedData.provider)
						try {
							importedData.chainId = await getChainId(importedData.provider)
						} catch (err) {
							console.error(err)
							console.error("Failed to load chain id for contract(custom provider): " + importedData.name)
						}
					}
					return importedData
				})
		)
	).filter(async (elem) => {
		const keys = Object.keys(elem)
		return keys.includes("abi") && keys.includes("address")
	}) as ContractConfigData[]
}
export const filterABIForEvents = (contracts: ContractConfigData[]) => {
	return contracts.map((elem) => {
		elem.abi = elem.abi.filter((abiElem) => {
			return abiElem.type === "event"
		})
		return elem
	})
}
