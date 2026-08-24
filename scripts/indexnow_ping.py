"""
IndexNow Ping Script for laptopservice.uz
Notifies Yandex and Bing search engines immediately after static deploy.
"""

import sys
import json
import urllib.request
import urllib.error

INDEXNOW_KEY = "laptopserviceuz2026indexnowkey"
HOST = "laptopservice.uz"
KEY_LOCATION = f"https://{HOST}/{INDEXNOW_KEY}.txt"

ENDPOINTS = [
    "https://yandex.com/indexnow",
    "https://api.indexnow.org/indexnow",
]

DEFAULT_URLS = [
    "https://laptopservice.uz/",
    "https://laptopservice.uz/services",
    "https://laptopservice.uz/services/diagnostika",
    "https://laptopservice.uz/services/bga-payka-reballing",
    "https://laptopservice.uz/services/zamena-termopasty",
    "https://laptopservice.uz/services/remont-posle-zalitiya",
    "https://laptopservice.uz/services/remont-petel-korpusa",
    "https://laptopservice.uz/services/upgrade-noutbuka",
    "https://laptopservice.uz/cases",
    "https://laptopservice.uz/about",
    "https://laptopservice.uz/prices",
    "https://laptopservice.uz/reviews",
    "https://laptopservice.uz/contacts",
]

def submit_urls(urls=None):
    if urls is None:
        urls = DEFAULT_URLS
        
    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    
    data = json.dumps(payload).encode("utf-8")
    
    print(f"[IndexNow] Submitting {len(urls)} URLs to IndexNow endpoints...")
    
    for endpoint in ENDPOINTS:
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"[IndexNow] Endpoint {endpoint} responded with status: {resp.status}")
        except urllib.error.HTTPError as e:
            print(f"[IndexNow] Endpoint {endpoint} returned HTTP error: {e.code} ({e.reason})")
        except Exception as err:
            print(f"[IndexNow] Notice: Ping to {endpoint}: {err}")

if __name__ == "__main__":
    submit_urls()