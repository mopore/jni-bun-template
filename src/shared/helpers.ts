import fs from "fs";
import { none, optionalDefined, type Option } from "./optional/optional";
import { log } from "./logger/log";


type PackageInfo = {
	name: string,
	version: string,
}

export const readVersionOption = (): Option<string> => {
	try{
		const rawText =	fs.readFileSync("package.json",  "utf8");
		const packageInfo = JSON.parse(rawText) as PackageInfo;
		return optionalDefined(packageInfo.version);
	} catch (error) {
		const errorMessage = `Could not read version: ${error}`;
		log.error(errorMessage);
		return none();
	}
}

export const readExampleDotEnvOption = (): Option<string> => {
	const testVarRawValue = process.env["TEST_VAR"];
	let testVarValue: string | undefined;
	try{
		testVarValue = String(testVarRawValue ?? "");
		if (testVarValue.trim().length === 0) {
			const errorMessage = `Missing 'TEST_VAR' defined in .env file in project's root.`;
			console.error(errorMessage);
			console.trace();
			return none();
		}
		return optionalDefined(testVarValue);
	} catch (error) {
		const errorMessage = `INTERNAL ERROR - Could not load from ".env": ${error}`;
		log.error(errorMessage);
		process.exit(9);
	}
}

export const readCliArgsOption = (): Option<string> => {
	const args = process.argv.slice(2);
	
	if (args.length === 0) {
		return none();
	}
	
	const combinedArgs = args.join(" ");
	return optionalDefined(combinedArgs);
}