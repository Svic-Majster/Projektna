const db = require('../db');
const bcrypt = require('bcrypt');

const koordinateTreningov = {
    cords1: [
        { lat: 46.552894255, lng: 15.615057889 }, { lat: 46.552931268, lng: 15.615076176 },
        { lat: 46.553044906, lng: 15.615139442 }, { lat: 46.553163226, lng: 15.61520283 },
        { lat: 46.55327338, lng: 15.615269088 }, { lat: 46.553462884, lng: 15.615364133 },
        { lat: 46.553574576, lng: 15.615424291 }, { lat: 46.553613957, lng: 15.615447209 },
        { lat: 46.553695793, lng: 15.615498532 }, { lat: 46.553807459, lng: 15.615570351 },
        { lat: 46.553442259, lng: 15.61693769 }, { lat: 46.553342738, lng: 15.617126858 },
        { lat: 46.551360833, lng: 15.617840556 }, { lat: 46.551064047, lng: 15.617641758 },
        { lat: 46.551667351, lng: 15.614896382 }, { lat: 46.551753719, lng: 15.614741876 },
        { lat: 46.552584203, lng: 15.614916556 }, { lat: 46.552775448, lng: 15.615005066 }
    ],
    cords2: [
        { lat: 46.54824, lng: 15.594926 }, { lat: 46.548211, lng: 15.594816 },
        { lat: 46.547842, lng: 15.595247 }, { lat: 46.547363, lng: 15.596469 },
        { lat: 46.546164, lng: 15.599163 }, { lat: 46.544155, lng: 15.601912 },
        { lat: 46.541424, lng: 15.605385 }, { lat: 46.539992, lng: 15.608695 },
        { lat: 46.541911, lng: 15.1078 }, { lat: 46.544213, lng: 15.613291 },
        { lat: 46.54605, lng: 15.615592 }, { lat: 46.54826, lng: 15.612406 },
        { lat: 46.550578, lng: 15.60914 }, { lat: 46.552477, lng: 15.607932 },
        { lat: 46.554817, lng: 15.605828 }, { lat: 46.555853, lng: 15.603853 }
    ],
    cords3: [
        { lat: 46.555185, lng: 15.645403 }, { lat: 46.555303, lng: 15.643043 },
        { lat: 46.555766, lng: 15.638434 }, { lat: 46.55635, lng: 15.635725 },
        { lat: 46.558033, lng: 15.634885 }, { lat: 46.560086, lng: 15.629779 },
        { lat: 46.560781, lng: 15.626443 }, { lat: 46.561556, lng: 15.622279 },
        { lat: 46.563731, lng: 15.61994 }, { lat: 46.564776, lng: 15.619858 },
        { lat: 46.565634, lng: 15.619218 }, { lat: 46.566436, lng: 15.617182 },
        { lat: 46.56775, lng: 15.615668 }, { lat: 46.568484, lng: 15.615324 },
        { lat: 46.567472, lng: 15.61439 }
    ],
    cords4: [
        { lat: 46.562059, lng: 15.650309 }, { lat: 46.561957, lng: 15.649184 },
        { lat: 46.562307, lng: 15.648162 }, { lat: 46.564013, lng: 15.648171 },
        { lat: 46.566079, lng: 15.648167 }, { lat: 46.567017, lng: 15.648069 },
        { lat: 46.566458, lng: 15.648824 }, { lat: 46.56571, lng: 15.649612 },
        { lat: 46.564522, lng: 15.650042 }, { lat: 46.563111, lng: 15.65006 },
        { lat: 46.563011, lng: 15.651508 }, { lat: 46.562134, lng: 15.651694 },
        { lat: 46.56211, lng: 15.650341 }
    ]
};

function izracunajXP(vrsta, razdaljaKm, zacetekStr, konecStr) {
    const trajanjeSekunde = (new Date(konecStr) - new Date(zacetekStr)) / 1000;
    const trajanjeMinute = trajanjeSekunde / 60;
    
    let faktor = 0;
    if (vrsta === 'tek') faktor = 10;
    if (vrsta === 'hoja') faktor = 6;
    if (vrsta === 'kolesarjenje') faktor = 3;

    const xp = (trajanjeMinute * 10) + ((razdaljaKm * 10) * faktor);
    return Math.round(xp);
}

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
            console.log(`Uporabnik ${u.username} (ID: ${novId}) dodan.`);
        }

        const svicMojsterId = uporabnikiIdji['svic_mojster'];

        const resSkupina = await db.query(
            `INSERT INTO skupine (ime_skupine, koda_za_pridruzitev, owner_id) 
             VALUES ($1, $2, $3) 
             RETURNING id`,
            ['testna ekipa', 'TESTKODA1', svicMojsterId]
        );
        const skupinaId = resSkupina.rows[0].id;

        for (const username in uporabnikiIdji) {
            await db.query(
                `INSERT INTO clani_skupine (skupina_id, uporabnik_id) VALUES ($1, $2)`,
                [skupinaId, uporabnikiIdji[username]]
            );
        }

        console.log(`\nDodajamo 4 realistične workoute z XP preračunom za svic_mojster...`);

        const treningi = [
            {
                vrsta: 'tek',
                razdalja: 1.06,
                zacetek: '2026-05-25 08:00:00',
                konec: '2026-05-25 08:06:00',
                koordinate: koordinateTreningov.cords1
            },
            {
                vrsta: 'kolesarjenje',
                razdalja: 4.19,
                zacetek: '2026-05-26 17:15:00',
                konec: '2026-05-26 17:35:00',
                koordinate: koordinateTreningov.cords2
            },
            {
                vrsta: 'hoja',
                razdalja: 3.39,
                zacetek: '2026-05-27 10:00:00',
                konec: '2026-05-27 10:45:00',
                koordinate: koordinateTreningov.cords3
            },
            {
                vrsta: 'tek',
                razdalja: 1.66,
                zacetek: '2026-05-28 19:00:00',
                konec: '2026-05-28 19:12:00',
                koordinate: koordinateTreningov.cords4
            }
        ];

        let skupniIzracunanXp = 0;

        for (const t of treningi) {
            const tocke = izracunajXP(t.vrsta, t.razdalja, t.zacetek, t.konec);
            skupniIzracunanXp += tocke;

            const resTrening = await db.query(
                `INSERT INTO treningi 
                 (uporabnik_id, vrsta_workouta, status_treninga, skupne_tocke, razdalja_km, vremenski_bonus, zacetek_vadbe, konec_vadbe) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [svicMojsterId, t.vrsta, 'zakljuceno', tocke, t.razdalja, false, t.zacetek, t.konec]
            );

            const novTreningId = resTrening.rows[0].id;
            console.log(`Dodan ${t.vrsta}: ${t.razdalja}km, trajanje: ${(new Date(t.konec)-new Date(t.zacetek))/60000}min -> Izračunan XP: ${tocke}`);

            for (const koord of t.koordinate) {
                await db.query(
                    `INSERT INTO lokacije_treninga (trening_id, latitude, longitude, hitrost) 
                     VALUES ($1, $2, $3, $4)`,
                    [novTreningId, koord.lat, koord.lng, 12.5]
                );
            }
        }

        await db.query('UPDATE uporabniki SET skupni_xp = $1 WHERE id = $2', [skupniIzracunanXp, svicMojsterId]);
        console.log(`\nPosodobljen končni skupni XP za svic_mojster na: ${skupniIzracunanXp}`);

        console.log('Baza uspešno napolnjena s pravimi koordinatami in točkovanjem.');
        process.exit(0);

    } catch (err) {
        console.error('\nNapaka pri seedanju:', err.message);
        process.exit(1);
    }
};

seed();