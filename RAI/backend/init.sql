-- Brisanje za testiranje
DROP TABLE IF EXISTS tedenska_lestvica;
DROP TABLE IF EXISTS zunanji_viri;
DROP TABLE IF EXISTS senzorski_podatki;
DROP TABLE IF EXISTS treningi;
DROP TABLE IF EXISTS clani_skupine;
DROP TABLE IF EXISTS skupine;
DROP TABLE IF EXISTS uporabniki;
DROP TYPE IF EXISTS workout_type;

-- workout types
CREATE TYPE workout_type AS ENUM ('hoja', 'tek', 'kolesarjenje');

-- Uporabniki
CREATE TABLE uporabniki (
    id SERIAL PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    geslo VARCHAR(255) NOT NULL,
    skupni_xp INT DEFAULT 0,
    trenutni_nivo INT DEFAULT 1,
    datum_registracije TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skupine
CREATE TABLE skupine (
    id SERIAL PRIMARY KEY,
    ime_skupine VARCHAR(50) NOT NULL,
    koda_za_pridruzitev VARCHAR(10) UNIQUE NOT NULL
);

-- Clani skupine
CREATE TABLE clani_skupine (
    skupina_id INT NOT NULL,
    uporabnik_id INT NOT NULL,
    datum_pridruzitve TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (skupina_id, uporabnik_id),
    CONSTRAINT fk_skupina FOREIGN KEY (skupina_id) REFERENCES skupine(id) ON DELETE CASCADE,
    CONSTRAINT fk_uporabnik FOREIGN KEY (uporabnik_id) REFERENCES uporabniki(id) ON DELETE CASCADE
);

-- Treningi
CREATE TABLE treningi (
    id SERIAL PRIMARY KEY,
    uporabnik_id INT NOT NULL,
    vrsta_workouta workout_type NOT NULL,
    skupne_tocke INT DEFAULT 0,
    razdalja_km FLOAT DEFAULT 0,
    vremenski_bonus FLOAT DEFAULT 1.0,
    prometni_bonus FLOAT DEFAULT 1.0,
    slika_potrditve VARCHAR(255),
    ai_status VARCHAR(20) DEFAULT 'v_obdelavi',
    zacetek_vadbe TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    konec_vadbe TIMESTAMP NULL,
    CONSTRAINT fk_trening_uporabnik FOREIGN KEY (uporabnik_id) REFERENCES uporabniki(id) ON DELETE CASCADE
);

-- Senzorski podatki 
CREATE TABLE senzorski_podatki (
    id BIGSERIAL PRIMARY KEY,
    trening_id INT NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    pospesek_x FLOAT,
    pospesek_y FLOAT,
    pospesek_z FLOAT,
    casovni_zig TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_senzorski_trening FOREIGN KEY (trening_id) REFERENCES treningi(id) ON DELETE CASCADE
);

-- Tedenska lestvica
CREATE TABLE tedenska_lestvica (
    id SERIAL PRIMARY KEY,
    uporabnik_id INT NOT NULL,
    skupina_id INT NOT NULL,
    teden_v_letu INT NOT NULL,
    leto INT NOT NULL,
    skupne_tocke INT DEFAULT 0,
    CONSTRAINT fk_lestvica_uporabnik FOREIGN KEY (uporabnik_id) REFERENCES uporabniki(id) ON DELETE CASCADE,
    CONSTRAINT fk_lestvica_skupina FOREIGN KEY (skupina_id) REFERENCES skupine(id) ON DELETE CASCADE
);

-- Zunanji viri
-- ni direktno povezano z fk 
-- primerjava preko lat in lng
CREATE TABLE zunanji_viri (
    id SERIAL PRIMARY KEY,
    viri_ime VARCHAR(50), 
    podatki_json JSONB,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    kraj VARCHAR(100),
    datum_zajema TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);