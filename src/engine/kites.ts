import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import * as appRoot from "app-root-path";
import * as nconf from "nconf";
import {LoggerInstance, MemoryTransportInstance} from "winston";

import { EventEmitter } from "events";
import { EventCollectionEmitter } from "./event-collection";
import { ExtensionsManager } from "../extensions/extensions-manager";
import { ILogger, DebugTransport } from "../logger";

import pkg from "../../package.json";

export interface IKitesOptions {
    readonly discover:boolean;
    readonly rootDirectory:string;
    readonly appDirectory:string;
    readonly parentModuleDirectory:string;
    readonly env:string;
    readonly logger:ILogger;
}

export class KitesCore extends EventEmitter {

    name:string;
    version:string;
    options:IKitesOptions;
    initializeListeners:EventCollectionEmitter;
    extensionsManager:ExtensionsManager;
    logger:ILogger;
    private _initialized:boolean;
    private _fnAfterConfigLoaded:Function;
    private _ready:Promise<KitesCore>;

    constructor(options?:IKitesOptions) {
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
        this._initialized = false;
        this._fnAfterConfigLoaded = () => this;
        this._ready = new Promise((resolve) => {
            this.on('initialized', resolve);
        })

    }

    get defaults() {
        let parent = module.parent || module;
        return {
            discover: true,
            rootDirectory: path.resolve(__dirname, '../../../'),
            appDirectory: appRoot.toString(),
            parentModuleDirectory: path.dirname(parent.filename),
            env: process.env.NODE_ENV || 'development',
            logger: {
                silent: false
            }
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
    defaultPath(value:string, defaultValue:string) {
        if (typeof value === 'undefined') {
            return path.resolve(this.appDirectory, defaultValue || '');
        } else if (path.isAbsolute(value)) {
            return value;
        } else {
            return path.resolve(this.appDirectory, value);
        }
    }

    init() {
        // return this._initOptions().then(() => {
        //     if (this.options.logger && this.options.logger.silent === true) {
        //         this._silentLogs(this.logger);
        //     }

        //     this.logger.info(`Initializing ${this.name}@${this.version} in mode "${this.options.env}"${this.options.loadConfig? ', using configuration file ' + this.options.configFile : ''}`);
        //     return this.extensionsManager.init();
        // }).then(() => {
        //     return this.initializeListeners.fire();
        // }).then(() => {
        //     this.logger.info('kites initialized!');
        //     this._initialized = true;
        //     this.emit('initialized', this);
        //     return this;
        // })
    }
}
