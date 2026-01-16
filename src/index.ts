import { readVersion } from "./shared/helpers";
import { log } from "./shared/logger/log";


const main = (): void => {
	const version = readVersion();
	log.info(`Hello from Bun Template! Version: ${version}`);
}

main();