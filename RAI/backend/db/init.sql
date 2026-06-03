-- Brisanje za testiranje
DROP TABLE IF EXISTS tedenska_lestvica;
DROP TABLE IF EXISTS zunanji_viri;
DROP TABLE IF EXISTS obdelani_podatki_ai;
DROP TABLE IF EXISTS senzorski_podatki;
DROP TABLE IF EXISTS treningi;
DROP TABLE IF EXISTS clani_skupine;
DROP TABLE IF EXISTS skupine;
DROP TABLE IF EXISTS uporabniki;
DROP TYPE IF EXISTS workout_type;
DROP TYPE IF EXISTS login_status;
-- workout types
CREATE TYPE workout_type AS ENUM ('hoja', 'tek', 'kolesarjenje');
-- status face login
CREATE TYPE login_status AS ENUM ('uspesno', 'zavrnjeno_nizek_ujemanje', 'obraz_ni_zaznan');

-- Uporabniki
CREATE TABLE uporabniki (
    id SERIAL PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    priimek VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    geslo VARCHAR(255) NOT NULL,
    skupni_xp INT DEFAULT 0,
    datum_registracije TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profilna_slika VARCHAR(255) NULL,
    referencna_slika VARCHAR(255) NULL,
    vektor_obraza JSONB NULL
);

-- Skupine
CREATE TABLE skupine (
    id SERIAL PRIMARY KEY,
    ime_skupine VARCHAR(50) NOT NULL,
    koda_za_pridruzitev VARCHAR(10) UNIQUE NOT NULL,
    owner_id INT REFERENCES uporabniki(id) ON DELETE SET NULL
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
    status_treninga VARCHAR(20) DEFAULT 'v_teku',    
    skupne_tocke INT DEFAULT 0,
    razdalja_km FLOAT DEFAULT 0,
    vremenski_bonus FLOAT DEFAULT 1.0,
    zacetek_vadbe TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    konec_vadbe TIMESTAMP NULL,
    
    CONSTRAINT fk_trening_uporabnik FOREIGN KEY (uporabnik_id) REFERENCES uporabniki(id) ON DELETE CASCADE
);

CREATE TABLE lokacije_treninga (
    id SERIAL PRIMARY KEY,
    trening_id INT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    hitrost FLOAT DEFAULT 0,
    cas_zapisa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_lokacija_trening FOREIGN KEY (trening_id) REFERENCES treningi(id) ON DELETE CASCADE
);

CREATE TABLE obdelani_podatki_ai (
    id SERIAL PRIMARY KEY,
    uporabnik_id INT NOT NULL,
    slika_prijave VARCHAR(255) NOT NULL,
    status_prijave login_status NOT NULL,
    ai_confidence FLOAT DEFAULT 0.0,
    casovni_zig TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_uporabnik FOREIGN KEY (uporabnik_id) REFERENCES uporabniki(id) ON DELETE CASCADE
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
CREATE TABLE zunanji_viri (
    id SERIAL PRIMARY KEY,
    viri_ime VARCHAR(50) NOT NULL,
    tip_vira VARCHAR(20) NOT NULL,
    podatki_json JSONB NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    kraj VARCHAR(100),
    ekstremno_vreme BOOLEAN DEFAULT FALSE,
    datum_zajema TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zunanji_viri_lokacija_tip ON zunanji_viri(tip_vira, lat, lng);