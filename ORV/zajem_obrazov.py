import cv2
import os
import time

# za uporabnika po uporabnik_id ustvari mapo z zajetimi slikami
def ustvari_mape_za_uporabnika(uporabnik_id, baza_poti="data/raw"):
    pot = os.path.join(baza_poti, str(uporabnik_id))
    if not os.path.exists(pot):
        os.makedirs(pot)
    return pot

if __name__ == "__main__":
    ustvari_mape_za_uporabnika(1)