#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from app import search_jobs
import json

def test_samsun_jobs():
    """Samsun için iş araması testi"""
    
    print("🔍 SAMSUN İŞ ARAMA TESTİ")
    print("=" * 50)
    
    # Test 1: Yazılım Geliştirici
    print("\n1️⃣ YAZILIM GELİŞTİRİCİ ARAMASI")
    result1 = search_jobs('yazılım geliştirici', 'Samsun', locale='tr_TR')
    print_job_results(result1)
    
    # Test 2: Mühendis
    print("\n2️⃣ MÜHENDİS ARAMASI")
    result2 = search_jobs('mühendis', 'Samsun', locale='tr_TR')
    print_job_results(result2)
    
    # Test 3: Python Developer (İngilizce)
    print("\n3️⃣ PYTHON DEVELOPER ARAMASI")
    result3 = search_jobs('python developer', 'Samsun', locale='tr_TR')
    print_job_results(result3)

def print_job_results(result):
    """İş arama sonuçlarını yazdır"""
    if result.get('type') == 'demo':
        print(f"📍 Lokasyon: {result['search_params']['location']}")
        print(f"🔍 Anahtar Kelime: {result['search_params']['keywords']}")
        print(f"📊 Bulunan İş Sayısı: {result['total_jobs']}")
        print("\n💼 İş İlanları:")
        
        for i, job in enumerate(result['jobs'], 1):
            print(f"  {i}. {job['title']}")
            print(f"     🏢 Şirket: {job['company']}")
            print(f"     💰 Maaş: {job['salary']}")
            print(f"     📅 Tarih: {job['date']}")
            print(f"     📝 Açıklama: {job['description'][:60]}...")
            print()
    else:
        print(f"❌ Hata: {result.get('error', 'Bilinmeyen hata')}")

if __name__ == "__main__":
    test_samsun_jobs()
