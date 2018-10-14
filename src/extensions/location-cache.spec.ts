import { expect } from "chai";

import * as cache from "./location-cache";
import InitDebugLogger from "../logger";

describe('Location cache', () => {

    before(() => {
      // remove ~/test/cache folder before test
    })

    it('should get one and save it!', async () => {
        let extensions:any = await cache.get({
            logger: InitDebugLogger('location-cache'),
            rootDirectory: 'test'
        })
        expect(extensions.length).eq(1);
    })
})
