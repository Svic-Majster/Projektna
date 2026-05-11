const db = require('./db');
const bcrypt = require('bcrypt');

const seed = async () => {
    try {
        console.log('Začetek testa');

        // Prepreci napako pri vecih zagonih
        await db.query('DELETE FROM uporabniki WHERE email LIKE $1', ['%@test.si']);

        // priprava gesla
        const saltRounds = 10;
        const hash = await bcrypt.hash('testni123', saltRounds);

        // vstavljanje testnih uporabnikov
        const uporabniki = [
            ['Testni Uporabnik', 'uporabnik@test.si', hash],
            ['Drugi Uporabnik', 'user@test.si', hash],
            ['Švic Mojster', 'admin@test.si', hash]
        ];

        for (const u of uporabniki) {
            await db.query(
                'INSERT INTO uporabniki (ime, email, geslo) VALUES ($1, $2, $3)',
                u
            );
            console.log(`Uporabnik ${u[0]} dodan.`);
        }

        console.log('\n Baza uspešno napolnjena.');
        process.exit(0);

    } catch (err) {
        console.error('\n Napaka pri seedanju:', err.message);
        process.exit(1);
    }
};

seed();