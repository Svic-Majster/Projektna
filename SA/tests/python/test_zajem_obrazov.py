import os
import shutil
import pytest
from unittest.mock import MagicMock, patch

# uvoz funkcij
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ORV')))
from zajem_obrazov import ustvari_mape_za_uporabnika, zajemi_obraze  # type: ignore


# preveri logiko ustvarnjana map
def test_ustvari_mape_za_uporabnika():
    testna_baza = "data/test_raw"
    uporabnik_id = 999
    pricakovana_pot = os.path.join(testna_baza, str(uporabnik_id))
    
    # ce obstaja prej te zbrisemo
    if os.path.exists(testna_baza):
        shutil.rmtree(testna_baza)
        
    # poklicemo funkcijo iz zajem_obrazov.py
    vrnjena_pot = ustvari_mape_za_uporabnika(uporabnik_id, baza_poti=testna_baza)
    
    # preverimo ce vrne pot pa ce obstaja
    assert vrnjena_pot == pricakovana_pot
    assert os.path.exists(pricakovana_pot)
    
    # zbrisemo za sabo
    shutil.rmtree(testna_baza)


# mock kamere ker gh actions nima 
@patch('cv2.VideoCapture')
@patch('cv2.imshow')
@patch('cv2.waitKey')
def test_zajemi_obraze_no_camera(mock_wait_key, mock_imshow, mock_video_capture):
    # sim da se kamera ne more odpret
    mock_cap = MagicMock()
    mock_cap.isOpened.return_value = False
    mock_video_capture.return_value = mock_cap
    
    # zazenemo z random id
    # ce vrne napako in se zakljuci je okej.
    try:
        zajemi_obraze(uporabnik_id=999)
        uspesno = True
    except Exception as e:
        uspesno = False
        print(f"Skripta se je sesula namesto varnega izhoda: {e}")
        
    assert uspesno == True
    mock_cap.isOpened.assert_called_once()