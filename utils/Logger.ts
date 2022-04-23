export enum LogLevelEnum {
	debug,
	info,
	warn,
	error,
}

export class Log {
	public static logLevel: LogLevelEnum = 0

	private static getDate(): string {
		let date = new Date()
		let dStr = date.toLocaleDateString() + " " + date.toLocaleTimeString()
		return dStr
	}
	public static debug(fmt: any, ...additions: any[]): void {
		if (this.logLevel > LogLevelEnum.debug) {
			return
		}
		console.debug(`[debug]  ` + this.getDate(), fmt, ...additions)
	}
	public static info(fmt: any = "", ...additions: any[]): void {
		if (this.logLevel > LogLevelEnum.info) {
			return
		}
		console.info("\x1b[36m%s\x1b[0m", `[info] `, "\x1b[0m", this.getDate(), fmt, ...additions)
	}
	public static warn(fmt: any = "", ...additions: any[]): void {
		if (this.logLevel > LogLevelEnum.warn) {
			return
		}

		console.warn("\x1b[33m%s\x1b[0m", `[warn] `, "\x1b[0m", this.getDate(), fmt, ...additions)
	}
	public static error(fmt: any = "", ...additions: any[]): void {
		if (this.logLevel > LogLevelEnum.error) {
			return
		}

		Log.error("\x1b[31m%s\x1b[0m", `[error] ` + " " + this.getDate() + " ", fmt, "\x1b[0m", ...additions)
	}
}
