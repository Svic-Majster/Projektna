import os
import shutil
import sys
import numpy as np
import cv2 as cv
from unittest.mock import patch

# nastavimo path isto ko prej 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ORV')))
from procesiraj_slike import pridobi_poti_map, nalozi_seznam_slik, izboljsaj_kontrast_obraza, augmentiraj_svetlost, razdeli_in_procesiraj_slike  # type: ignore

# test ko mapa obstaja
def test_pridobi_poti_map_ko_izvor_obstaja():
    # zacasne testne mape
    test_raw = "data/test_raw_poti"
    test_processed = "data/test_processed_poti"
    uporabnik_id = 1
    
    izvorna_pot = os.path.join(test_raw, str(uporabnik_id))
    
    # ustvarimo izvorno mapo
    os.makedirs(izvorna_pot, exist_ok=True)
    
    # pridobimo poti z funkcijo
    izv, train, test = pridobi_poti_map(uporabnik_id, surova_baza=test_raw, predelana_baza=test_processed)
    
    # assert preverjanje
    assert izv == izvorna_pot
    assert train == os.path.join(test_processed, str(uporabnik_id), "train")
    assert test == os.path.join(test_processed, str(uporabnik_id), "test")
    
    # preverimo ce train pa test obstajata
    assert os.path.exists(train)
    assert os.path.exists(test)
    
    # zbrisemo testne mape
    if os.path.exists("data"):
        shutil.rmtree(test_raw, ignore_errors=True)
        shutil.rmtree(test_processed, ignore_errors=True)

# test ko mapa ne obstaja
def test_pridobi_poti_map_ko_izvor_ne_obstaja():
    test_raw = "data/test_raw_poti_ne_obstaja"
    test_processed = "data/test_processed_poti_ne_obstaja"
    uporabnik_id = 2
    
    # ce obstaja jo zbrisemo
    if os.path.exists(test_raw):
        shutil.rmtree(test_raw)
        
    # poklicemo funkcijo
    izv, train, test = pridobi_poti_map(uporabnik_id, surova_baza=test_raw, predelana_baza=test_processed)
    
    # se vedno more vrnit path
    assert izv == os.path.join(test_raw, str(uporabnik_id))
    
    # mapi nesmeta bit ker ni ivora
    assert not os.path.exists(train)
    assert not os.path.exists(test)

# iskanje slik in ignoriranje drugih datotek
def test_nalozi_seznam_slik_uspesno():
    testna_mapa = "data/test_iskanja_slik"
    os.makedirs(testna_mapa, exist_ok=True)
    
    # ustvarimo fake files (en txt ko ga more ignorirat)
    testne_datoteke = ["slika1.jpg", "slika2.jpg", "slika3.png", "porocilo.txt"]
    
    for ime in testne_datoteke:
        polna_pot = os.path.join(testna_mapa, ime)
        with open(polna_pot, "w") as f:
            f.write("lazni podatki") # samo nardimo file da obstaja na disku
            
    # iscemo slike z naso fun
    najdene_slike = nalozi_seznam_slik(testna_mapa)
    
    # fun more najt 3 slike (brez .txt)
    assert len(najdene_slike) == 3

    # preverimo ce je naslo prave 3    
    imena_najdenih = [os.path.basename(pot) for pot in najdene_slike]
    assert "slika1.jpg" in imena_najdenih
    assert "slika2.jpg" in imena_najdenih
    assert "slika3.png" in imena_najdenih
    assert "porocilo.txt" not in imena_najdenih
    
    # zbrisemo po testu
    shutil.rmtree(testna_mapa, ignore_errors=True)

# ko mapa ne obstaja vrne prazno
def test_nalozi_seznam_slik_neobstojeca_mapa():
    neobstojeca_mapa = "data/mapa_ne_obstaja"
    
    # da res ne obstaja
    if os.path.exists(neobstojeca_mapa):
        shutil.rmtree(neobstojeca_mapa)
        
    # moja fun
    rezultat = nalozi_seznam_slik(neobstojeca_mapa)
    
    # preveri da je prazno namesto da faila
    assert rezultat == []

# preverjanje dimenzij in ce je sivinsko
def test_izboljsaj_kontrast_obraza():

    # naredimo fake barvno sliko
    visina, sirina = 100, 100
    lazna_barvna_slika = np.random.randint(0, 256, (visina, sirina, 3), dtype=np.uint8)
    
    # funckija za izbolsanje kontrasta
    obdelana_slika = izboljsaj_kontrast_obraza(lazna_barvna_slika)
    
    # preverimo da ni prazno
    assert obdelana_slika is not None
    
    # preverimo dimenzije da so iste pa da ma .shape samo dva kanala
    assert obdelana_slika.shape == (visina, sirina)
    
    # preverimo tip podatkov
    assert obdelana_slika.dtype == np.uint8

# preveri spreminjanje svetlosti
def test_augmentiraj_svetlost():
    # vsi piksli majo vrednost 100
    slika_osnova = np.array([[100, 100], [100, 100]], dtype=np.uint8)
    
    # damo x1.5 na vsakega
    slika_svetla = augmentiraj_svetlost(slika_osnova, 1.5)
    
    # preverimo ce so vsi enaki 150
    assert np.all(slika_svetla == 150)
    assert slika_svetla.dtype == np.uint8

    # vsi piksli majo vrednost 200
    slika_visoka = np.array([[200, 200], [200, 200]], dtype=np.uint8)
    
    # vsak piksel x2 ampak omeji na 255 ker je to max
    slika_prezgana = augmentiraj_svetlost(slika_visoka, 2.0)
    
    # preveri ce je prav omejilo
    assert np.all(slika_prezgana == 255)

# preveri razdelitev in augmentacijo
@patch('procesiraj_slike.pridobi_poti_map')
def test_razdeli_in_procesiraj_slike(mock_pridobi_poti):
    # zacasne testne poti
    test_raw = "data/test_raw_split"
    test_processed = "data/test_processed_split"
    uporabnik_id = 1
    
    izvorna_pot = os.path.join(test_raw, str(uporabnik_id))
    pot_train = os.path.join(test_processed, str(uporabnik_id), "train")
    pot_test = os.path.join(test_processed, str(uporabnik_id), "test")
    
    # funkcija uporabi testne poti
    mock_pridobi_poti.return_value = (izvorna_pot, pot_train, pot_test)
    
    # ustvarimo testne mape na disku
    os.makedirs(izvorna_pot, exist_ok=True)
    os.makedirs(pot_train, exist_ok=True)
    os.makedirs(pot_test, exist_ok=True)
    
    # ustvarimo 10 fake slik
    za_zapis = np.zeros((200, 200, 3), dtype=np.uint8)
    for i in range(10):
        cv.imwrite(os.path.join(izvorna_pot, f"naravnost_{i}.jpg"), za_zapis)
        
    try:
        # zazenemo glavno funkcijo
        razdeli_in_procesiraj_slike(uporabnik_id)
        
        # testna mnozica (20% od 10)
        slike_test = os.listdir(pot_test)
        assert len(slike_test) == 2
        
        # ucna mnozica (8*4=32)
        slike_train = os.listdir(pot_train)
        assert len(slike_train) == 32
        
        # da vidimo ce obstajajo augmentirane
        assert "naravnost_0_temno.jpg" in slike_train
        assert "naravnost_0_zrcaljeno.jpg" in slike_train
        
    finally:
        # zbrisemo vse
        shutil.rmtree(test_raw, ignore_errors=True)
        shutil.rmtree(test_processed, ignore_errors=True)