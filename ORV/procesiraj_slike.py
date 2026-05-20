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

# iz izvorne poti nalozi vse .jpg in .png datoteke  v sprem slike
def nalozi_seznam_slik(izvorna_pot):
    if not os.path.exists(izvorna_pot):
        print(f"Napaka: izvorna mapa {izvorna_pot} ne obstaja")
        return []
        
    slike = glob.glob(os.path.join(izvorna_pot, "*.jpg")) + glob.glob(os.path.join(izvorna_pot, "*.png"))
    return slike

# pretvorba v sivinsko sliko in CLAHE algoritem za izboljsanje kontrasta
def izboljsaj_kontrast_obraza(barvna_slika):
    # 3x3 gaussian blur
    zglajena_slika = cv2.GaussianBlur(barvna_slika, (3, 3), 0)
    
    # pretvorba v sivo 
    siva_slika = cv2.cvtColor(zglajena_slika, cv2.COLOR_BGR2GRAY)
    
    # CLAHE za lepo osvetlitev
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    obdelana_slika = clahe.apply(siva_slika)
    
    return obdelana_slika