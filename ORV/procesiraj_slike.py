import cv2
import os
import glob

# pridobi pot originalnih slik in preveri ce obstaja pot za procesirane. (ce ne jo nardi) (train za treniranje modela test za testiranje)
def pridobi_poti_map(uporabnik_id, surova_baza="data/raw", predelana_baza="data/processed"):
    izvorna_pot = os.path.join(surova_baza, str(uporabnik_id))
    ciljna_pot = os.path.join(predelana_baza, str(uporabnik_id))
    
    pot_train = os.path.join(ciljna_pot, "train")
    pot_test = os.path.join(ciljna_pot, "test")
    
    if os.path.exists(izvorna_pot):
        os.makedirs(pot_train, exist_ok=True)
        os.makedirs(pot_test, exist_ok=True)
        
    return izvorna_pot, pot_train, pot_test