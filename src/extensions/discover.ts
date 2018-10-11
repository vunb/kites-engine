import { LoggerInstance } from "winston";

export interface IDiscoverOptions {
    readonly logger:LoggerInstance;
    readonly rootDirectory:any;
    readonly mode:any;
    readonly cacheAvailableExtensions:any;
    readonly tempDirectory:any;
    readonly extensionsLocationCache:any;
}
