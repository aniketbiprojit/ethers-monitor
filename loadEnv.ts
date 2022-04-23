import { config } from "dotenv"
import { join } from "path"

const absolutePathFOrBuild = join(__dirname, "..")
config({ path: join(absolutePathFOrBuild, ".env") })
