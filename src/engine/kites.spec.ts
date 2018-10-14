import { expect } from 'chai';
import {KitesCore} from './kites';

describe('kites engine', () => {

    it('should fire ready callback', async () => {
        var core = new KitesCore({
            discover: false
        });

        core = await core.ready((kites) => {
            kites.logger.info('Kites is ready!');
            expect(kites).instanceOf(KitesCore);
        }).init();

        core.logger.info('Kites has initialized!');
    });

    it('should use function as an extension', async () => {
        var extensionInitialized = false;
        var core = new KitesCore({
            discover: false
        });

        core = await core.use({
            directory: '',
            main: (kites, options) => {
                kites.logger.info('Kites extension is running!');
                kites.guest = true;
                extensionInitialized = true;
            },
            name: 'test',
        }).init();

        expect(extensionInitialized).eq(true, 'extension has initialized!');
        expect(core.guest).eq(true, 'attach an object to kites!');
    });

});
