import { log } from "./logger/log.js";
import { none, optionalDefined, type Option } from "./optional/optional.js";

export function parseEnvVariable(envName: string): Option<string>{
	const envRawValue = process.env[envName];
	let envValue: string | undefined;
	try {
		envValue = String(envRawValue ?? "");
		if (envValue.trim().length === 0 ){
			console.error(`Value for environment variable "${envName} is not set.`);
			return none();
		}
	}
	catch {
		const errorMessage = `Could not parse environment variable '${envName}'. Please check.`;
		console.error(errorMessage);
		return none();
	}
	return optionalDefined(envValue);
}

export const sleepAsync = async (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms))
};

export const managedCallAsync = async <T>(
	func: () => Promise<T>,
	retryCount: number,
	retryDelayMs: number,
): Promise<T> => {
	for (let i = 0; i <= retryCount; i++){
		try {
			return await func();
		}
		catch (err: unknown){
			log.warn(`Call failed. Retrying in ${retryDelayMs/1000} sec(s). Error: ${err}`);
			await sleepAsync(retryDelayMs);
		}
	}
	const errorMessage = `Call failed after ${retryCount}`;
	log.error(errorMessage);
	log.trace();
	throw new Error(errorMessage);
}

/** Run mapper on items from an AsyncIterable with a hard concurrency cap.
 *  Collects and returns a flattened array of results.
 */
export async function mapConcurrentAsync<T, U>(
	source: AsyncIterable<T>,
	mapper: (item: T) => Promise<U[]>, // mapper may return 0..n results (like your checkPath)
	concurrency: number
): Promise<U[]> {
	const inFlight = new Set<Promise<void>>();
	const out: U[] = [];
	let firstError: unknown;

	const schedule: (item: T) => Promise<void> = async (item: T) => {
		try {
			const results = await mapper(item);
			if (Array.isArray(results)){
				out.push(...results);
			}
		} catch (e) {
			if (firstError !== undefined){
				firstError = e;
			}
		}
	};

	// Request new input from source respecting the concurrency cap
	for await (const item of source) {
		const p = schedule(item).finally(() => inFlight.delete(p));
		inFlight.add(p);

		if (inFlight.size >= concurrency) {
			// Wait until at least one finishes
			await Promise.race(inFlight);
			if (firstError !== undefined) break; // fast-fail if desired
		}
	}

	// Drain remaining work
	await Promise.allSettled(inFlight);
	if (firstError !== undefined) {
		throw firstError as Error;
	}

	return out;
}
