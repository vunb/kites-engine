import os from "os";
import path from "path";
import _fs from "fs";
import _mkdirp from "mkdirp";
import {promisify} from "util";

import { IDiscoverOptions } from "./discover";
import { KitesExtention } from "./extensions";
import { walkSync } from "./fs";

const KITES_CONFIG_FILE = 'kites.config.js';
const mkdirp = promisify(_mkdirp);
const stat = promisify(_fs.stat);
const readFile = promisify(_fs.readFile);
const writeFile = promisify(_fs.writeFile);
var pathToLocationCache:string;

export function get(config:IDiscoverOptions) {
    let tempDirectory = config.tempDirectory || os.tmpdir();
    pathToLocationCache = path.join(tempDirectory, 'extensions', 'locations.json');

    if (config.mode === 'kites-development' || config.extensionsLocationCache === false) {
        config.logger.info('Skipping extensions location cache when NODE_ENV=kites-development or when option extensionsLocationCache === false, crawling now');

        return Promise.resolve(walkSync(config.rootDirectory, KITES_CONFIG_FILE));
    }

    return Promise.reject('Not implement!');
}

export async function save(extensions:Array<KitesExtention>, config:IDiscoverOptions) {
    let directories = extensions
        .map((e) => path.join(e.directory, KITES_CONFIG_FILE))
        .filter(x => x.indexOf(path.join(__dirname, '../../../')) > -1);

    let tempDirectory = config.tempDirectory || os.tmpdir();
    await mkdirp(path.join(tempDirectory, 'extensions'));
    await (stat(pathToLocationCache).catch(() => writeFile(pathToLocationCache, JSON.stringify({}), 'utf-8')));
    let content = await readFile(pathToLocationCache, 'utf-8');
    let nodes:any = {};
    try {
        nodes = JSON.parse(content);
    } catch(err) {
        // file is corrupted, nevermind and override all
    }

    nodes[path.join(__dirname, '../../../')] = {
        locations: directories,
        lastSync: new Date().getTime()
    }
    config.logger.debug('Writing extension locations cache to ' + pathToLocationCache);
    await writeFile(pathToLocationCache, JSON.stringify(nodes), 'utf-8');
}
