import { expect } from "chai";

import discover from "./discover";
import InitDebugLogger from "../logger";

describe('Discover', () => {
    it('should load an extension', async () => {
        let extensions:any = await discover({
            logger: InitDebugLogger('discover'),
            rootDirectory: '../../test'
        })
        expect(extensions.length).eq(1);
    })
})
