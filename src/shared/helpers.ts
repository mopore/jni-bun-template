import fs from "fs";
import { log } from "./logger/log.js";


type PackageInfo = {
	name: string,
	version: string,
}

export const readVersion = (): string => {
	try{
		const rawText =	fs.readFileSync("package.json",  "utf8");
		const packageInfo = JSON.parse(rawText) as PackageInfo;
		const version = packageInfo.version
		return version;
	} catch (error) {
		const errorMessage = `Could not read version: ${error}`;
		log.error(errorMessage);
		console.trace();
		throw new Error(errorMessage);
	}
}
