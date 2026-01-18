import { readCliArgsOption, readExampleDotEnvOption, readVersionOption } from "./shared/helpers";
import { log } from "./shared/logger/log";


const main = (): void => {
	const version = readVersionOption().unwrapExpect("version defined");
	log.info(`Hello from Bun Template! Version: ${version}`);

	const testVarValue = readExampleDotEnvOption().unwrapExpect("test var defined");
	log.info(`Test value from ".env" file: ${testVarValue}`);

	const cliArgs = readCliArgsOption();
	if (cliArgs.isNone()){
		log.info("Define some CLI args to be shown here!");
		return;
	}

	log.info(`Args from cli: ${cliArgs.unwrapExpect("cli args defined")}`);
}

main();