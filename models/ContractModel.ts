import { getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose"

@modelOptions({
	schemaOptions: {
		timestamps: true,
		collection: "Contract",
	},
	options: {
		allowMixed: Severity.ALLOW,
	},
})
export class ContractRepository {
	// uid => `{address}-{chainId}`
	@prop()
	uid: string

	@prop()
	name: string

	@prop()
	address: string

	@prop()
	abi: Array<
		{
			type: string
		} & Record<string, any>
	>

	@prop()
	chainId: number

	@prop()
	startBlock: number

	@prop()
	indexedTill: number
}

export const ContractModel = getModelForClass(ContractRepository)
