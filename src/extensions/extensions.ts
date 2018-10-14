import { KitesCore } from '../main';

export type KitesExtensionDefinition = (kites: KitesCore, definition: KitesExtention) => void;

export class KitesExtention {
    main: Function|KitesExtensionDefinition;
    name: string;
    options?: boolean|any;
    directory: string;
    dependencies?: Array<string|Function|KitesExtensionDefinition>;
}
