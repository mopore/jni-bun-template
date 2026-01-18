import winston from "winston";
import { parseEnvVariable } from "../SharedFunctions";
import { enums } from "../enums/enums";

export const LOG_SETUP_NAME = "LOG_SETUP";
export enum LogSetup {
	PRODUCTION = "prod",
	DEVELOPMENT = "dev",
}

const colorizedDevFormat = winston.format.printf(({ level, message, timestamp }) => {
	const greyTimestamp = `\x1b[90m${timestamp}\x1b[39m`;
	return `${greyTimestamp} ${level}: ${message}`;
});

const plainFormat = winston.format.printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const loglevel = ((): LogSetup => {
	const logSetupOption = parseEnvVariable(LOG_SETUP_NAME);
	if (logSetupOption.isNone()){
		const errorMessage = 'failed to setup logger. "LOG_SETUP" not properly defined.';
		console.error(errorMessage);
		console.trace();
		throw new Error(errorMessage);
	}
	const logSetup = logSetupOption.unwrapExpect("log setup name definied");
	return enums.to(LogSetup, logSetup);
})();


export class ExtendedLogger {
	private readonly logger: winston.Logger;

	constructor(options: winston.LoggerOptions) {
		this.logger = winston.createLogger(options);
	}

	trace(): void {
		console.trace();
	}

	error(message: unknown, ...optionalParams: unknown[]): void {
		this.logger.error(typeof message === "string" ? message : String(message), optionalParams);
	}

	warn(message: unknown, ...optionalParams: unknown[]): void {
		this.logger.warn(typeof message === "string" ? message : String(message), optionalParams);
	}

	info(message: unknown, ...optionalParams: unknown[]): void {
		this.logger.info(typeof message === "string" ? message : String(message), optionalParams);
	}

	debug(message: unknown, ...optionalParams: unknown[]): void {
		this.logger.debug(typeof message === "string" ? message : String(message), optionalParams);
	}
}

const createLogger = (options: winston.LoggerOptions): ExtendedLogger => {
	return new ExtendedLogger(options);
};

let internalLog: ExtendedLogger;

switch (loglevel) {
	case LogSetup.PRODUCTION:
		internalLog = createLogger({
			level: "info",
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				plainFormat
			),
			transports: [new winston.transports.Console()],
		});
		break;
	case LogSetup.DEVELOPMENT:
		internalLog = createLogger({
			level: "debug",
			transports: [
				// Console → colored
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
						winston.format.colorize(),
						colorizedDevFormat
					),
				}),
				// File (error) → plain
				new winston.transports.File({
					dirname: "logs",
					filename: "error.log",
					level: "error",
					format: winston.format.combine(
						winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
						plainFormat
					),
				}),
				// File (all) → plain
				new winston.transports.File({
					dirname: "logs",
					filename: "all.log",
					format: winston.format.combine(
						winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
						plainFormat
					),
				}),
			],
		});
		break;
	default:
		throw new Error("Log level not supported");
}

export const log: ExtendedLogger = internalLog;
