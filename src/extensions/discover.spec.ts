import { expect } from "chai";

import {discover} from "./discover";
import InitDebugLogger from "../logger";
import * as path from "path";

describe('Discover extensions', () => {
    it('should load an extension', async () => {
        let extensions:any = await discover({
            logger: InitDebugLogger('discover'),
            rootDirectory: path.resolve('test')
        })
        expect(extensions.length).eq(1);
    })
})
