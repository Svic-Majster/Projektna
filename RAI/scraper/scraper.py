import requests
import xml.etree.ElementTree as ET
import time

API_URL = "http://localhost:3000/api/zunanji-viri/bulk"

def scrape_arso_basics():
    print("\n--- Zacetek scraperja ---")
    arso_url = "https://meteo.arso.gov.si/uploads/probase/www/observ/surface/text/sl/observation_si_latest.xml"
    
    try:
        response = requests.get(arso_url, timeout=10)
        if response.status_code != 200:
            print(f"Napaka pri branju ARSO XML (Status: {response.status_code})")
            return

        root = ET.fromstring(response.content.decode('utf-8'))
        postaje = root.findall('metData')
        
        vsi_podatki = []
        
        for met_data in postaje:
            kraj_ime = met_data.find('domain_longTitle').text if met_data.find('domain_longTitle') is not None else None
            
            if not kraj_ime:
                continue
                
            temp = met_data.find('t')
            vlaga = met_data.find('rh')
            vreme_opis = met_data.find('nn_icon-id')
            veter = met_data.find('ff_val')
            lat_node = met_data.find('domain_lat')
            lon_node = met_data.find('domain_lon')
            
            payload = {
                "viri_ime": "ARSO",
                "tip_vira": "vreme",
                "podatki_json": {
                    "temperatura": float(temp.text) if temp is not None and temp.text else None,
                    "vlaga": float(vlaga.text) if vlaga is not None and vlaga.text else None,
                    "vreme_opis": vreme_opis.text if vreme_opis is not None else "Neznano",
                    "veter_hitrost": float(veter.text) if veter is not None and veter.text else None
                },
                "lat": float(lat_node.text) if lat_node is not None and lat_node.text else None,
                "lng": float(lon_node.text) if lon_node is not None and lon_node.text else None,
                "kraj": kraj_ime
            }
            
            vsi_podatki.append(payload)
            
        if vsi_podatki:
            print(f"Pripravljenih {len(vsi_podatki)} lokacij za pošiljanje...")
            try:
                api_response = requests.post(API_URL, json=vsi_podatki, timeout=15)
                if api_response.status_code == 200:
                    print("Uspešno posodobljeno v bazi (Bulk insert).")
                else:
                    print(f"Streznik zavrnil bulk zahtevo (Status: {api_response.status_code})")
            except requests.exceptions.RequestException as e:
                print(f"Napaka pri pošiljanju bulk podatkov: {e}")
        else:
            print("Ni podatkov za posodabljanje.")

    except Exception as e:
        print(f"Napaka v Pythonu: {e}")

if __name__ == "__main__":
    scrape_arso_basics()