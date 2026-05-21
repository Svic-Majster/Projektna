import os
import shutil
import sys

# nastavimo path isto ko prej 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ORV')))
from procesiraj_slike import pridobi_poti_map  # type: ignore


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
    
    # 3. assert preverjanje
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