import cv2
import os
import glob

# pridobi pot originalnih slik in preveri ce obstaja pot za procesirane. (ce ne jo nardi)
def pridobi_poti_map(uporabnik_id, surova_baza="data/raw", predelana_baza="data/processed"):
    izvorna_pot = os.path.join(surova_baza, str(uporabnik_id))
    ciljna_pot = os.path.join(predelana_baza, str(uporabnik_id))
    
    if not os.path.exists(ciljna_pot) and os.path.exists(izvorna_pot):
        os.makedirs(ciljna_pot)
        
    return izvorna_pot, ciljna_pot