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
```

---

# LBPH model za verifikacijo obraza

Ta del projekta vsebuje implementacijo modela računalniškega vida za preverjanje identitete uporabnika na podlagi slike obraza.

Uporabljen je OpenCV LBPH Face Recognizer pristop. Sistem preveri, ali je nova slika dovolj podobna naučenemu uporabniku in vrne rezultat `POTRJEN` ali `ZAVRNJEN`.

## Glavne datoteke

- `train_lbph.py`  
  Učenje LBPH modela in shranjevanje modela v `lbph_model.yml`.

- `face_verification.py`  
  Runtime verifikacija nove slike z uporabo naučenega modela.

## Testiranje in evaluacija

V mapi `testing/` se nahajajo skripte za:
- evaluacijo modela,
- threshold tuning,
- hyperparameter tuning,
- osnovno testiranje modela.

Uporabljene metrike:
- Accuracy
- FAR (False Acceptance Rate)
- FRR (False Rejection Rate)

## Končne nastavitve

LBPH parametri:

```python
radius = 1
neighbors = 8
grid_x = 8
grid_y = 8
```

Threshold:

```python
THRESHOLD = 50
```

## Zagon

Učenje modela:

```bash
python train_lbph.py
```

Verifikacija slike:

```bash
python face_verification.py
```