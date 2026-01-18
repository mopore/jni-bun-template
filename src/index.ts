import { readExampleDotEnv, readVersion as readVersionOption } from "./shared/helpers";
import { log } from "./shared/logger/log";


const main = (): void => {
	const version = readVersionOption().unwrapExpect("version defined");
	log.info(`Hello from Bun Template! Version: ${version}`);

	const testVarValue = readExampleDotEnv().unwrapExpect("test var defined");
	log.info(`Test value from ".env" file: ${testVarValue}`);

	// TODO: Test argument passed
}

main();