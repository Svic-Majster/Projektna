import cv2
import os
import glob
import random
import numpy as np

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

# funkcija za umetno spreminjanje svetlosti slike (faktor > 1 posvetli, faktor < 1 potemni)
def augmentiraj_svetlost(slika, faktor):
    return np.clip(slika.astype(np.float32) * faktor, 0, 255).astype(np.uint8)

# razdeli v mape test in train za treniranje modela + obdela
def razdeli_in_procesiraj_slike(uporabnik_id, razmerje_train=0.8):
    izvorna_pot, pot_train, pot_test = pridobi_poti_map(uporabnik_id)
    vse_slike = nalozi_seznam_slik(izvorna_pot)
    
    if not vse_slike:
        print("Ni slik za obdelavo.")
        return
        
    print(f"Razdelitev in obdelava slik za: {uporabnik_id}")
    
    # locimo slike po pozicijah iz imena
    slike_po_pozicijah = {}
    for pot in vse_slike:
        ime_datoteke = os.path.basename(pot)
        # izluscimo poz iz imena >> {smer}_{st}.jpg <<
        pozicija = ime_datoteke.split("_")[0]
        
        if pozicija not in slike_po_pozicijah:
            slike_po_pozicijah[pozicija] = []
        slike_po_pozicijah[pozicija].append(pot)

    stevec_train = 0
    stevec_test = 0

    # vsaka skupina poz posebej
    for pozicija, poti_slik in slike_po_pozicijah.items():
        # premesamo vrstni red da bo nakljucno
        random.seed(42)
        random.shuffle(poti_slik)
        
        # 8 v train 2 v test
        meja_razdelitve = int(len(poti_slik) * razmerje_train)
        učna_množica = poti_slik[:meja_razdelitve]
        testna_množica = poti_slik[meja_razdelitve:]
        
        # shranjevanje testne mnozice
        for pot_slike in testna_množica:
            img = cv2.imread(pot_slike)
            if img is None:
                continue
            obdelana = izboljsaj_kontrast_obraza(img)
            
            # Ohranimo pravilno poimenovanje (ki je zdaj že popravljeno iz zajema)
            st_slike = os.path.basename(pot_slike).split("_")[-1]
            ime_datoteke = f"{pozicija}_{st_slike}"
            
            cv2.imwrite(os.path.join(pot_test, ime_datoteke), obdelana)
            stevec_test += 1
            
        # obdelava in augmentacija testne mnozice
        for idx, pot_slike in enumerate(učna_množica):
            img = cv2.imread(pot_slike)
            if img is None:
                continue
            
            # osnovna obdelana slika
            osnovna_obdelana = izboljsaj_kontrast_obraza(img)
            
            # shranimo obdelano (pozicija je že pravilna iz zajema)
            ime_orig = f"{pozicija}_{idx}.jpg"
            cv2.imwrite(os.path.join(pot_train, ime_orig), osnovna_obdelana)
            stevec_train += 1
            
            # augmentiramo svetlost
            # potemnjeno
            slika_temna = augmentiraj_svetlost(osnovna_obdelana, 0.7)
            cv2.imwrite(os.path.join(pot_train, f"{pozicija}_{idx}_temno.jpg"), slika_temna)
            
            # posvetljeno
            slika_svetla = augmentiraj_svetlost(osnovna_obdelana, 1.3)
            cv2.imwrite(os.path.join(pot_train, f"{pozicija}_{idx}_svetlo.jpg"), slika_svetla)
            stevec_train += 2
            
            # vodoravno zrcaljenje
            slika_zrcaljena = cv2.flip(osnovna_obdelana, 1)
            
            # obrne da bo prav poimenovano
            if pozicija == "naravnost":
                nova_pozicija = "naravnost"
            elif pozicija == "levo":
                nova_pozicija = "desno"
            else:
                nova_pozicija = "levo"
                
            cv2.imwrite(os.path.join(pot_train, f"{nova_pozicija}_{idx}_zrcaljeno.jpg"), slika_zrcaljena)
            stevec_train += 1

    print(f"razdelitev zakljucena")
    print(f"shranjeno v train: {stevec_train} slik ({pot_train})")
    print(f"shranjeno v test: {stevec_test} slik ({pot_test})\n")

if __name__ == "__main__":
    razdeli_in_procesiraj_slike(uporabnik_id=1)