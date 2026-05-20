import cv2
import os
import time

# za uporabnika po uporabnik_id ustvari mapo z zajetimi slikami
def ustvari_mape_za_uporabnika(uporabnik_id, baza_poti="data/raw"):
    pot = os.path.join(baza_poti, str(uporabnik_id))
    if not os.path.exists(pot):
        os.makedirs(pot)
    return pot

def zajemi_obraze(uporabnik_id):
    # detektorji za levo in desno oko pa obraz
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    left_eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_lefteye_2splits.xml')
    right_eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_righteye_2splits.xml')
    
    cap = cv2.VideoCapture(0)
    
    # locljivost kamere
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("Napaka: Ni mogoce odpret kamere.")
        return

    pot_za_shranjevanje = ustvari_mape_za_uporabnika(uporabnik_id)
    
    pozicije = ["Glej naravnost", "Obrni glavo LEVO", "Obrni glavo DESNO"]
    slike_po_poziciji = 10
    
    print(f"Zajem data za uporabnika ID: {uporabnik_id}")
    
    trenutni_idx = 0
    stevec_slik = 0
    zadnji_zajem_casa = 0
    premor_med_slikami = 0.4  # 0.4s med zajemi slik
    
    menjava_pozicije_cas = time.time() + 3.0
    v_premoru = True

    while trenutni_idx < len(pozicije):
        ret, frame = cap.read()
        if not ret:
            print("Napaka pri zajemu.")
            break

        trenutna_pozicija = pozicije[trenutni_idx]
        prikaz_frame = frame.copy()
        trenutni_cas = time.time()

        # timeout med pozicijami 
        if v_premoru:
            preostali_cas = int(menjava_pozicije_cas - trenutni_cas)
            if preostali_cas > 0:
                cv2.putText(prikaz_frame, f"PRIPRAVA: {trenutna_pozicija}", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
                cv2.putText(prikaz_frame, f"Zacetek cez: {preostali_cas}s", (10, 60), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
            else:
                v_premoru = False
                stevec_slik = 0
                zadnji_zajem_casa = trenutni_cas
        
        # logika za zajem slik
        else:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray_scaled = cv2.resize(gray, (0,0), fx=0.5, fy=0.5)
            
            faces = face_cascade.detectMultiScale(gray_scaled, scaleFactor=1.2, minNeighbors=5, minSize=(30, 30))
            
            cv2.putText(prikaz_frame, f"NAVODILO: {trenutna_pozicija}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(prikaz_frame, f"Zajeto: {stevec_slik}/{slike_po_poziciji}", (10, 60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            for (x, y, w, h) in faces:
                x, y, w, h = x*2, y*2, w*2, h*2
                cv2.rectangle(prikaz_frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
                # izrezemo regijo obraza
                gray_obraz = gray[y:y+h, x:x+w]
                
                # iskanje oci 
                levo_oko = left_eye_cascade.detectMultiScale(gray_obraz, scaleFactor=1.05, minNeighbors=3, minSize=(10, 10))
                desno_oko = right_eye_cascade.detectMultiScale(gray_obraz, scaleFactor=1.05, minNeighbors=3, minSize=(10, 10))
                
                vidi_levo = len(levo_oko) > 0
                vidi_desno = len(desno_oko) > 0
                
                pozicija_je_pravilna = False
                status_prikaz = "Iskanje oci"

                # izracuna kolko je obraz obrjen
                vse_oci_x = []
                if vidi_levo:
                    for (ex, ey, ew, eh) in levo_oko:
                        vse_oci_x.append(ex + ew//2)
                if vidi_desno:
                    for (ex, ey, ew, eh) in desno_oko:
                        vse_oci_x.append(ex + ew//2)

                if len(vse_oci_x) > 0:
                    # povp x kordinata
                    povprecni_x_oci = sum(vse_oci_x) / len(vse_oci_x)
                    relativni_center = povprecni_x_oci / w
                    
                    # ce je med 0.42 in 0.58 gleda naravnost
                    if 0.42 <= relativni_center <= 0.58:
                        trenutna_zaznana_smer = "Glej naravnost"
                        status_prikaz = "Zaznano: Ravno"
                    elif relativni_center < 0.42:
                        # ce je majnse kot 0.42 je levo
                        trenutna_zaznana_smer = "Obrni glavo LEVO"
                        status_prikaz = "Zaznano: Levo"
                    else:
                        # vec kot 0.58 je desno
                        trenutna_zaznana_smer = "Obrni glavo DESNO"
                        status_prikaz = "Zaznano: Desno"

                    # ali se nasa smer ujema z smerjo ki jo rabimo
                    if trenutna_zaznana_smer == trenutna_pozicija:
                        pozicija_je_pravilna = True

                # debug na zaslon
                cv2.putText(prikaz_frame, status_prikaz, (x, y - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

                # shrani slike ob pravilni poz
                if pozicija_je_pravilna:
                    if trenutni_cas - zadnji_zajem_casa >= premor_med_slikami and stevec_slik < slike_po_poziciji:
                        # izrezemo iz orginala
                        obraz_izrez = frame[y:y+h, x:x+w]
                        
                        if obraz_izrez.size > 0:
                            # standardna velikost ki jo bomo meli
                            obraz_resized = cv2.resize(obraz_izrez, (200, 200))
                            
                            # logika za poimenovanje slik 
                            smer_cista = trenutna_pozicija.replace("Obrni glavo ", "").replace("Glej ", "").lower()
                            ime_datoteke = f"{smer_cista}_{stevec_slik}.jpg"
                            
                            polna_pot = os.path.join(pot_za_shranjevanje, ime_datoteke)
                            
                            cv2.imwrite(polna_pot, obraz_resized)
                            stevec_slik += 1
                            zadnji_zajem_casa = trenutni_cas
                else:
                    if len(vse_oci_x) > 0:
                        cv2.putText(prikaz_frame, f"NAPACEN KOT! ({status_prikaz})", (10, 90), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    else:
                        cv2.putText(prikaz_frame, "OCI NISO ZAZNANE!", (10, 90), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            
            if stevec_slik >= slike_po_poziciji:
                trenutni_idx += 1
                v_premoru = True
                menjava_pozicije_cas = time.time() + 3.0

        cv2.imshow('Zajem test data', prikaz_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Zajem prekinjen.")
            break

    print(f"\nKonec. Slike so shranjene v: {pot_za_shranjevanje}")
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    zajemi_obraze(uporabnik_id=1)