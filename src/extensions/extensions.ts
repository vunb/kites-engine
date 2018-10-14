import { IKitesOptions } from '../engine/kites';
import { KitesCore } from '../main';

export type ExtensionMainDefinition = (kites: KitesCore, options: IKitesOptions) => void;

export class KitesExtention {
    main: Function|ExtensionMainDefinition;
    name: string;
    options?: boolean|any;
    directory: string;
    dependencies?: Array<string|Function>;
}
