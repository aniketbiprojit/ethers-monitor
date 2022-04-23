import express, { Request } from "express"
import cors from "cors"
import { Log } from "../utils/Logger"
import { ContractModel } from "../models/ContractModel"
import { Sync } from "../utils/Sync"

export class ExpressConfig {
	public app: express.Application
	public port: number
	constructor(port: string | number) {
		this.app = express()
		this.port = parseInt(port.toString())

		this.setupMiddleware()

		this.setupControllers()
		this.init()
	}

	setupMiddleware() {
		this.app.use(cors())
		this.app.use(express.json())
	}

	setupControllers() {
		this.app.get("/", (_, res) => {
			res.send("Hello World!")
		})

		this.app.post(
			"/",
			async (
				req: Request<
					any,
					any,
					{
						address: string
						chainId: number
						event: {
							name: string
						}
						query: any
					}
				>,
				res
			) => {
				const { address, chainId, event, query } = req.body

				const contractInstance = await ContractModel.findOne({ address, chainId })
				if (contractInstance) {
					const eventABI = contractInstance.abi.filter((elem) => {
						return elem.name === event?.name
					})
					if (eventABI.length > 0) {
						const { model } = Sync.getCollection(contractInstance, contractInstance.abi.indexOf(eventABI[0]))
						res.send((await model.find(query)).map((elem) => elem.toJSON()))
					} else {
						res.status(404).send("Event not found")
						return
					}
				} else {
					res.status(404).send("Contract not found")
					return
				}
			}
		)
	}

	init() {
		try {
			this.app.listen(this.port, () => {
				Log.info(`Listening on port ${this.port}`)
			})
		} catch (err) {
			console.error(err)
		}
	}
}
