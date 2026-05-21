module.paths.push('../../../RAI/backend/node_modules');
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

        // preveri ce se je izvedel DELETE
        expect(mockQuery).toHaveBeenNthCalledWith(1, 
            'DELETE FROM uporabniki WHERE email LIKE $1', 
            ['%@test.si']
        );

        // preverimo ce so se izvedli vsi klici
        expect(mockQuery).toHaveBeenCalledTimes(4);

        // preverimo ce je bil dodan admin
        expect(mockQuery).toHaveBeenLastCalledWith(
            'INSERT INTO uporabniki (ime, priimek, username, email, geslo) VALUES ($1, $2, $3, $4, $5)',
            expect.arrayContaining(['Švic', 'Mojster', 'svic_mojster', 'admin@test.si'])
        );

        // preveri ce se je skripta koncala brez napak
        expect(exitSpy).toHaveBeenCalledWith(0);
    });
});