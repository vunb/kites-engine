import { ILogger } from "../logger";

export interface IDiscoverOptions {
    readonly logger:ILogger;
    readonly rootDirectory:any;
    readonly mode?:any;
    readonly cacheAvailableExtensions?:any;
    readonly tempDirectory?:any;
    readonly extensionsLocationCache?:any;
}

export default function discover(config:IDiscoverOptions) {
    return Promise.reject('Not implement!')
}
