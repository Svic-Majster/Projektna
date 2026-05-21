const bcrypt = require('bcrypt');

// ustvarimo mock db za test
const mockQuery = jest.fn();
jest.mock('../../../RAI/backend/db', () => ({
    query: mockQuery
}));

describe('Testiranje baze - Seeder skripta', () => {
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

    it('mora uspešno zagnati seeder', async () => {
        
    });
});