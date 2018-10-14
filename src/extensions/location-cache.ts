import os from "os";
import path from "path";
import _fs from "fs";
import _mkdirp from "mkdirp";
import {promisify} from "util";

import { IDiscoverOptions } from "./discover";
import { KitesExtention } from "./extensions";
import { walkSync } from "./fs";

const mkdirp = promisify(_mkdirp);
const stat = promisify(_fs.stat);
const readFile = promisify(_fs.readFile);
const writeFile = promisify(_fs.writeFile);

const KITES_CONFIG_FILE = 'kites.config.js';
// var pathToLocationCache:string;

export async function get(config:IDiscoverOptions) {
    let tempDirectory = config.tempDirectory || os.tmpdir();
    let pathToLocationCache = path.join(tempDirectory, 'extensions', 'locations.json');

    if (config.mode === 'kites-development' || config.extensionsLocationCache === false) {
        config.logger.info('Skipping extensions location cache when NODE_ENV=kites-development or when option extensionsLocationCache === false, crawling now');
        return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
    }

    try {
        // get file status
        await stat(pathToLocationCache);
        // read file content
        let content = await readFile(pathToLocationCache, 'utf-8');
        let json = JSON.parse(content);
        let extension = path.join(__dirname, '../../../');
        let cache = json[extension];

        if (!cache) {
            config.logger.info('Extensions location cache doesn\'t contain entry yet, crawling');
            return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
        }

        let extensionInfo = await stat(extension);
        if (extensionInfo.mtime.getTime() > cache.lastSync) {
            config.logger.info('Extensions location cache ' + pathToLocationCache + ' contains older information, crawling');
            return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
        }

        // return cached
        await Promise.all(cache.locations.map((dir:string) => stat(dir)));
        config.logger.info('Extensions location cache contains up to date information, skipping crawling in ' + path.join(__dirname, '../../../'));

        let directories = walkSync(config.rootDirectory, KITES_CONFIG_FILE, extension);
        let result = directories.concat(cache.locations);
        return result;
    } catch (err) {
        config.logger.info('Extensions location cache not found, crawling directories');
        return walkSync(config.rootDirectory, KITES_CONFIG_FILE);
    }
}

export async function save(extensions:Array<KitesExtention>, config:IDiscoverOptions) {
    let extension = path.join(__dirname, '../../../');
    let directories = extensions
        .map((e) => path.join(e.directory, KITES_CONFIG_FILE))
        .filter(x => x.indexOf(extension) > -1);

    let tempDirectory = config.tempDirectory || os.tmpdir();
    let pathToLocationCache = path.join(tempDirectory, 'extensions');
    await mkdirp(pathToLocationCache);
    await (stat(pathToLocationCache).catch(() => writeFile(pathToLocationCache, JSON.stringify({}), 'utf-8')));
    let content = await readFile(pathToLocationCache, 'utf-8');
    let nodes:any = {};
    try {
        nodes = JSON.parse(content);
    } catch(err) {
        // file is corrupted, nevermind and override all
    }

    nodes[extension] = {
        locations: directories,
        lastSync: new Date().getTime()
    }
    config.logger.debug('Writing extension locations cache to ' + pathToLocationCache);
    await writeFile(pathToLocationCache, JSON.stringify(nodes), 'utf-8');
}
