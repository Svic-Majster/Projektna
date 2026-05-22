# Osnove računalniškega vida
## Datoteke za zajem testnih podatkov

- `zajem_obrazov.py`  
  Skripta za zajem obrazov preko kamere iz treh različnih smeri:

  - pogled naravnost
  - pogled levo
  - pogled desno

  Uporablja:
    - Haar Cascade detektor obraza
    - detekcijo levega in desnega očesa
    - preverjanje pozicije glave
    - samodejno shranjevanje slik

- `procesiraj_slike.py`  
Skripta obdela zajete slike in pripravi podatke za treniranje modela.

  - pretvorba slik v sivinsko sliko
  - Gaussian Blur glajenje
  - izboljšanje kontrasta z uporabo CLAHE algoritma
  - razdelitev na "train" in "test"
  - augmentacija podatkov (svetloba in zrcaljenje)


---

## Zahteve

Za delovanje skript je potrebno imeti:

- Python 3.x
- OpenCV

Namestitev knjižnice OpenCV:

```bash
pip install opencv-python
