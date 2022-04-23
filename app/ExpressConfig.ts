import express from "express"
import cors from "cors"
import { Log } from "../utils/Logger"

export class ExpressConfig {
	public app: express.Application
	public port: number
	constructor(port: string | number) {
		this.app = express()
		this.port = parseInt(port.toString())

		this.setupMiddleware()

		this.init()
	}

	setupMiddleware() {
		this.app.use(cors())
		this.app.use(express.json())
	}

	init() {
		this.app.listen(this.port, () => {
			Log.info(`Listening on port ${this.port}`)
		})
	}
}
