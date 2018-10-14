import debug from "debug";
import { Transport, TransportOptions } from "winston";

export class DebugTransport extends Transport {

    private _debug:debug.IDebugger;

    constructor(options?:TransportOptions) {
        super(options)
        this.name = 'debug';
        this._debug = debug('kites');
    }

    log(level:string, msg:string, meta:any, callback:Function) {
        this._debug(`${level} ${msg}`);
        callback(null, true);
    }
}

export default function (options?:TransportOptions) {
    return new DebugTransport(options)
}
