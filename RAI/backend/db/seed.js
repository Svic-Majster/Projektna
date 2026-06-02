const db = require('../db');
const bcrypt = require('bcrypt');

const seed = async () => {
    try {
        console.log('Začetek testa');

        await db.query(
            `DELETE FROM treningi 
             WHERE uporabnik_id IN (SELECT id FROM uporabniki WHERE email LIKE $1)`, 
            ['%@test.si']
        );

        await db.query('DELETE FROM skupine WHERE koda_za_pridruzitev = $1', ['TESTKODA1']);
        await db.query('DELETE FROM uporabniki WHERE email LIKE $1', ['%@test.si']);

        const saltRounds = 10;
        const hash = await bcrypt.hash('testni123', saltRounds);

        const uporabnikiPodatki = [
            { ime: 'Testni', priimek: 'Uporabnik', username: 'testni_user', email: 'uporabnik@test.si', geslo: hash, xp: 450 },
            { ime: 'Drugi', priimek: 'Uporabnik', username: 'drugi_user', email: 'user@test.si', geslo: hash, xp: 660 },
            { ime: 'Švic', priimek: 'Mojster', username: 'svic_mojster', email: 'admin@test.si', geslo: hash, xp: 0 }
        ];

        const uporabnikiIdji = {};

        for (const u of uporabnikiPodatki) {
            const res = await db.query(
                `INSERT INTO uporabniki (ime, priimek, username, email, geslo, skupni_xp) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id`,
                [u.ime, u.priimek, u.username, u.email, u.geslo, u.xp]
            );
            
            const novId = res.rows[0].id;
            uporabnikiIdji[u.username] = novId;
            console.log(`Uporabnik ${u.username} (ID: ${novId}, XP: ${u.xp}) dodan.`);
        }

        const svicMojsterId = uporabnikiIdji['svic_mojster'];

        const resSkupina = await db.query(
            `INSERT INTO skupine (ime_skupine, koda_za_pridruzitev, owner_id) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            ['testna ekipa', 'TESTKODA1', svicMojsterId]
        );
        const skupinaId = resSkupina.rows[0].id;
        console.log(`Skupina 'testna ekipa' (ID: ${skupinaId}, Owner ID: ${svicMojsterId}) ustvarjena.`);

        for (const username in uporabnikiIdji) {
            const uId = uporabnikiIdji[username];
            await db.query(
                `INSERT INTO clani_skupine (skupina_id, uporabnik_id) 
                 VALUES ($1, $2)`,
                [skupinaId, uId]
            );
            console.log(`Uporabnik ${username} dodan v skupino.`);
        }

        console.log(`\nDodamo 4 workoute za uporabnika svic_mojster (ID: ${svicMojsterId})...`);

        const treningi = [
            {
                vrsta: 'tek',
                status: 'zakljuceno',
                tocke: 150,
                razdalja: 5.2,
                vreme_bonus: 1.0,
                zacetek: '2026-05-25 08:00:00',
                konec: '2026-05-25 08:35:00'
            },
            {
                vrsta: 'kolesarjenje',
                status: 'zakljuceno',
                tocke: 320,
                razdalja: 22.4,
                vreme_bonus: 1.0,
                zacetek: '2026-05-26 17:15:00',
                konec: '2026-05-26 18:30:00'
            },
            {
                vrsta: 'hoja',
                status: 'zakljuceno',
                tocke: 50,
                razdalja: 3.1,
                vreme_bonus: 1.5,
                zacetek: '2026-05-27 10:00:00',
                konec: '2026-05-27 11:00:00'
            },
            {
                vrsta: 'tek',
                status: 'zakljuceno',
                tocke: 210,
                razdalja: 7.5,
                vreme_bonus: 1.0,
                zacetek: '2026-05-28 19:00:00',
                konec: '2026-05-28 19:45:00'
            }
        ];

        for (const t of treningi) {
            await db.query(
                `INSERT INTO treningi 
                 (uporabnik_id, vrsta_workouta, status_treninga, skupne_tocke, razdalja_km, vremenski_bonus, lat_vadbe, lng_vadbe, zacetek_vadbe, konec_vadbe) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [svicMojsterId, t.vrsta, t.status, t.tocke, t.razdalja, t.vreme_bonus, t.lat, t.lng, t.zacetek, t.konec]
            );
        }

        const skupniXp = treningi.reduce((sum, t) => sum + t.tocke, 0);
        await db.query('UPDATE uporabniki SET skupni_xp = $1 WHERE id = $2', [skupniXp, svicMojsterId]);
        console.log(`Posodobljen skupni XP za svic_mojster na: ${skupniXp}`);

        console.log('\nBaza uspešno napolnjena.');
        process.exit(0);

    } catch (err) {
        console.error('\nNapaka pri seedanju:', err.message);
        process.exit(1);
    }
};

seed();