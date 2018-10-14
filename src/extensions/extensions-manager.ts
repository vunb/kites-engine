import { EventEmitter } from 'events';
import { KitesCore } from '../main';
import { KitesExtention } from './extensions';

export class ExtensionsManager extends EventEmitter {
    protected kites: KitesCore;
    protected availableExtensions: KitesExtention[];
    protected usedExtensions: KitesExtention[];

    constructor(kites: KitesCore) {
        super();

        this.kites = kites;
        this.availableExtensions = [];
        this.usedExtensions = [];
    }

    get extensions() {
        return this.availableExtensions.filter((e) => !e.options || e.options.enabled !== false);
    }

}
