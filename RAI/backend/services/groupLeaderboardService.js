const db = require('../db'); 

async function getLeaderboard(skupinaId) {
    const query = `
        SELECT u.ime, u.priimek, u.username, u.skupni_xp 
        FROM uporabniki u
        JOIN clani_skupine cs ON u.id = cs.uporabnik_id
        WHERE cs.skupina_id = $1
        ORDER BY u.skupni_xp DESC;
    `;

    try {
        const result = await db.query(query, [skupinaId]);
        return result.rows;
    } catch (error) {
        console.error("Napaka v groupLeaderboardService:", error);
        throw new Error("Neuspešno pridobivanje leaderboarda");
    }
}

async function getGroupName(skupinaId) {
    const query = 'SELECT ime_skupine FROM skupine WHERE id = $1';
    const result = await db.query(query, [skupinaId]);
    return result.rows[0]?.ime_skupine || 'Neznana skupina';
}

module.exports = {
    getLeaderboard,
    getGroupName
};