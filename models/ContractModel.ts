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
	@prop({ unique: true, required: true })
	uid: string

	@prop({ required: true })
	name: string

	@prop({ required: true })
	address: string

	@prop({ required: true })
	abi: Array<
		{
			type: string
			name: string
			inputs: Array<{ name: string; type: string; indexed: boolean }>
			indexedTill?: number
		} & Record<string, any>
	>

	@prop({ required: true })
	chainId: number

	@prop({ default: 0 })
	startBlock: number

	@prop()
	indexedTill: number

	@prop({ required: true })
	rpcURL: string
}

export const ContractModel = getModelForClass(ContractRepository)
