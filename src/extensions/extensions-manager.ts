import { EventEmitter } from "events";
import { KitesCore } from "../kites";

export interface IKitesExtention {
    readonly options:boolean|any;
}

export class ExtensionsManager extends EventEmitter {
    kites:KitesCore;
    availableExtensions:Array<IKitesExtention>;
    usedExtensions:Array<IKitesExtention>;

    constructor(kites:KitesCore) {
        super()

        this.kites = kites;
        this.availableExtensions = [];
        this.usedExtensions = [];
    }

    get extensions() {
        return this.availableExtensions.filter((e) => !e.options || e.options.enabled !== false)
    }


}
