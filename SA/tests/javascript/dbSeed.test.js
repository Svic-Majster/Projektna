const bcrypt = require('bcrypt');

// ustvarimo mock db za test
const mockQuery = jest.fn();
jest.mock('../../../RAI/backend/db', () => ({
    query: mockQuery
}));

describe('Testiranje baze - Seed.js skripta', () => {
    let exitSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // exitSpy da ne vgasne celega testnega procesa
        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
        // izklopimo console izpise
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        exitSpy.mockRestore();
    });

it('mora uspesno pobrisati stare in vstaviti 3 nove testne uporabnike', async () => {
        mockQuery.mockResolvedValue({ rowCount: 1 });

        // izoliran zagon seed skripte 
        jest.isolateModules(() => {
            require('../../../RAI/backend/db/seed');
        });

        // cakamo next tick
        await new Promise(process.nextTick);

        // preveri ce se je skripta koncala brez napak
        expect(exitSpy).toHaveBeenCalledWith(0);
    });
});