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

    it('mora uspesno izvesti celotno seed skripto (uporabniki, skupine, treningi, lokacije)', async () => {
        mockQuery.mockImplementation((sql) => {
            if (sql.includes('INSERT INTO uporabniki')) {
                return Promise.resolve({ rows: [{ id: 1 }] }); // admin bo dobil ID 1
            }
            if (sql.includes('INSERT INTO skupine')) {
                return Promise.resolve({ rows: [{ id: 10 }] });
            }
            if (sql.includes('INSERT INTO treningi')) {
                return Promise.resolve({ rows: [{ id: 99 }] }); // mock ID treninga za lokacije
            }
            return Promise.resolve({ rows: [], rowCount: 1 });
        });

        const waitForExit = new Promise((resolve) => {
            exitSpy.mockImplementation((code) => {
                resolve(code);
            });
        });

        // izoliran zagon seed skripte 
        jest.isolateModules(() => {
            require('../../../RAI/backend/db/seed');
        });

        const exitCode = await waitForExit;
        
        expect(exitCode).toBe(0);

        // Preverimo, če se na začetku počistijo treningi
        expect(mockQuery).toHaveBeenNthCalledWith(1, 
            expect.stringContaining('DELETE FROM treningi'), 
            ['%@test.si']
        );

        // Preverimo, če se počisti skupina
        expect(mockQuery).toHaveBeenNthCalledWith(2, 
            expect.stringContaining('DELETE FROM skupine'), 
            ['TEST12']
        );

        // Preverimo, če se na koncu posodobi skupni_xp za admina
        expect(mockQuery).toHaveBeenLastCalledWith(
            'UPDATE uporabniki SET skupni_xp = $1 WHERE id = $2',
            [1431, 1] 
        );

        expect(mockQuery).createBtn = expect.stringContaining('INSERT INTO lokacije_treninga');
        
        expect(exitSpy).toHaveBeenCalledWith(0);
    });
});