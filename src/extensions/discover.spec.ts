import os from "os";
import { expect } from "chai";

import discover from "./discover";
import { ILogger, LogMethod } from "../logger";

class TestLogger implements ILogger {
    info:LogMethod;
    warn: LogMethod;
    error: LogMethod;
    debug: LogMethod;
}

describe('Discover', () => {
    it('should load an extension', async () => {
        let _logger = new TestLogger();
        let extensions:any = await discover({
            logger: new TestLogger(),
            rootDirectory: __dirname
        })
        expect(extensions.length).eq(1);
    })
})
