import os from "os";
import path from "path";
import _fs from "fs";
import _mkdirp from "mkdirp";
import Promise from "bluebird";

import { IDiscoverOptions } from "./discover";
import { walkSync } from "./fs";

const mkdirp = Promise.promisify(_mkdirp);
const fs = Promise.promisifyAll(_fs);
var pathToLocationCache;

export function get(config:IDiscoverOptions) {
    let tmpDirectory = config.tempDirectory || os.tmpdir();
    pathToLocationCache = path.join(tmpDirectory, 'extensions', 'locations.json');

    if (config.mode === 'kites-development' || config.extensionsLocationCache === false) {
        config.logger.info('Skipping extensions location cache when NODE_ENV=kites-development or when option extensionsLocationCache === false, crawling now');

        return Promise.resolve(walkSync(config.rootDirectory, 'kites.config.js'));
    }

    return Promise.reject('Not implement!');
}
