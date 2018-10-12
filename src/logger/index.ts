import winston from "winston";

export interface LogMethod extends winston.LogMethod {
}

export interface ILogger {
    info:LogMethod;
    warn:LogMethod;
    error:LogMethod;
    debug:LogMethod;
}

export {DebugTransport} from './debug-transport'
