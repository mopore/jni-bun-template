import { expect } from "chai";
import { readFileSync } from "node:fs";

describe("logger module", () => {
	it("does not import from SharedFunctions (must stay a leaf module)", () => {
		const source = readFileSync("src/shared/logger/log.ts", "utf8");
		expect(source).to.not.match(/from\s+["']\.\.\/SharedFunctions["']/);
	});
});
