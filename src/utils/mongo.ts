import assert from "assert"
import mongoose from "mongoose"
import { Log } from "./Logger"

export class MongoContainer {
	static async init(connection_url: string, db_name: string): Promise<typeof mongoose> {
		try {
			const url = `${connection_url}/${db_name}`

			const connection = await mongoose.connect(url, {
				dbName: db_name,
			})
			Log.debug("connection started")
			assert(connection === mongoose && `Failed to connect`)
			Log.info("Connected to database: ", db_name)

			return connection
		} catch (err) {
			Log.error(__filename, err)
			throw err
		}
	}
}
