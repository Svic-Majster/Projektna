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

        // vstavljanje testnih uporabnikov: [ime, priimek, username, email, geslo]
        const uporabniki = [
            ['Testni', 'Uporabnik', 'testni_user', 'uporabnik@test.si', hash],
            ['Drugi', 'Uporabnik', 'drugi_user', 'user@test.si', hash],
            ['Švic', 'Mojster', 'svic_mojster', 'admin@test.si', hash]
        ];

        for (const u of uporabniki) {
            await db.query(
                'INSERT INTO uporabniki (ime, priimek, username, email, geslo) VALUES ($1, $2, $3, $4, $5)',
                u
            );
            console.log(`Uporabnik ${u[2]} (@${u[2]}) dodan.`);
        }

        console.log('\n Baza uspešno napolnjena.');
        process.exit(0);

    } catch (err) {
        console.error('\n Napaka pri seedanju:', err.message);
        process.exit(1);
    }
};

seed();