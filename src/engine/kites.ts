import * as appRoot from 'app-root-path';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as nconf from 'nconf';
import * as path from 'path';
import {LoggerInstance, MemoryTransportInstance} from 'winston';

import { EventEmitter } from 'events';
import { ExtensionsManager } from '../extensions/extensions-manager';
import InitDebugLogger from '../logger';
import { EventCollectionEmitter } from './event-collection';

import pkg from '../../package.json';

export interface IKitesOptions {
    [key: string]: any;
    discover: boolean;
    rootDirectory: string;
    appDirectory: string;
    parentModuleDirectory: string;
    env: string;
    logger: any;
    mode: string;
    cacheAvailableExtensions: any;
    tempDirectory: string;
    extensionsLocationCache: string;
    extensions?: string[];
}

export class KitesCore extends EventEmitter {

    name: string;
    version: string;
    options: IKitesOptions;
    initializeListeners: EventCollectionEmitter;
    extensionsManager: ExtensionsManager;
    logger: LoggerInstance;
    private initialized: boolean;
    private fnAfterConfigLoaded: Function;
    private isReady: Promise<KitesCore>;

    constructor(options?: IKitesOptions) {
        super();
        // It may possible cause memory leaks from extensions
        this.setMaxListeners(0);

        // setup kites
        this.name = pkg.displayName;
        this.version = pkg.version;
        this.options = Object.assign(this.defaults, options);
        this.initializeListeners = new EventCollectionEmitter();
        this.extensionsManager = new ExtensionsManager(this);

        // properties
        // this.logger = this._initWinston();
        this.initialized = false;
        this.fnAfterConfigLoaded = () => this;
        this.isReady = new Promise((resolve) => {
            this.on('initialized', resolve);
        });

    }

    get defaults() {
        let parent = module.parent || module;
        return {
            appDirectory: appRoot.toString(),
            discover: true,
            env: process.env.NODE_ENV || 'development',
            logger: {
                silent: false
            },
            parentModuleDirectory: path.dirname(parent.filename),
            rootDirectory: path.resolve(__dirname, '../../../'),
        };
    }

    get configFileName() {
        if (this.options.env === 'production') {
            return 'prod.config.json';
        } else if (this.options.env === 'test') {
            return 'test.config.json';
        } else {
            return 'dev.config.json';
        }
    }

    get defaultConfigFile() {
        return 'kites.config.json';
    }

    /**
     * Root directory - Used to searches extensions
     * Default in node_modules
     */
    get rootDirectory() {
        return this.options.rootDirectory;
    }

    /**
     * App directory - Used to seaches app configuration
     */
    get appDirectory() {
        return this.options.appDirectory;
    }

    /**
     * Get default path from appDirectory
     * @param {string} value
     * @param {string} defaultValue
     */
    defaultPath(value: string, defaultValue: string) {
        if (typeof value === 'undefined') {
            return path.resolve(this.appDirectory, defaultValue || '');
        } else if (path.isAbsolute(value)) {
            return value;
        } else {
            return path.resolve(this.appDirectory, value);
        }
    }

    /**
     * Kites fire on ready
     * @param callback
     */
    ready(callback: Function) {
        this.isReady.then((kites) => callback(kites));
        return this;
    }

    /**
     * Use a function as a kites extension
     * TODO: pass string to load folder and discover extension Function in this path
     * @param extension
     */
    use(extension: Function) {
        this.extensionsManager.use(extension);
    }

    /**
     * Enable auto discover extensions
     */
    discover() {
        this.options.discover = true;
        return this;
    }

    /**
     * Assign config loaded callback
     * @param fn Function
     */
    afterConfigLoaded(fn: Function) {
        this.fnAfterConfigLoaded = fn;
        return this;
    }

    /**
     * Kites initialize
     */
    async init() {
        await this._initOptions();
        this.logger.info(`Initializing ${this.name}@${this.version} in mode "${this.options.env}"${this.options.loadConfig ? ', using configuration file ' + this.options.configFile : ''}`);

        if (this.options.logger && this.options.logger.silent === true) {
            await this._silentLogs(this.logger);
        }

        await this.extensionsManager.init();
        await this.initializeListeners.fire();

        this.logger.info('kites initialized!');
        this.initialized = true;
        this.emit('initialized', this);
        return this;
    }

    private _initOptions() {
        return Promise.reject('Not implement!');
    }

    private _silentLogs(logger: LoggerInstance) {
        if (logger.transports) {
            _.keys(logger.transports).forEach((name) => {
                logger.transports[name].silent = true;
            });
        }
    }

    private _loadConfig() {
        return Promise.reject('Not implement!');
    }

}
