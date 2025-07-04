#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, request
from flask_cors import CORS
from app import search_jobs, get_job_details
import logging

# Flask uygulamasını oluştur
app = Flask(__name__)

# CORS'u etkinleştir (mobil uygulama erişimi için)
CORS(app, origins=["*"])

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    return jsonify({
        "status": "healthy",
        "message": "Career MCP API Server is running",
        "version": "1.0.0",
        "endpoints": {
            "search_jobs": "/api/jobs/search",
            "job_details": "/api/jobs/details",
            "health": "/"
        }
    })

@app.route('/api/jobs/search', methods=['GET'])
def api_search_jobs():
    """
    İş arama API endpoint'i
    
    Query Parameters:
    - keywords (required): Aranacak anahtar kelimeler
    - location (required): İş lokasyonu
    - locale (optional): Dil kodu (default: tr_TR)
    - sort (optional): Sıralama türü (relevance, date, salary)
    - pagesize (optional): Sayfa başına sonuç sayısı
    - contracttype (optional): Sözleşme türü (p, c, t)
    - contractperiod (optional): Çalışma süresi (f, p)
    """
    try:
        # Gerekli parametreleri al
        keywords = request.args.get('keywords', '').strip()
        location = request.args.get('location', '').strip()
        
        if not keywords:
            return jsonify({
                "error": "Keywords parameter is required",
                "message": "Anahtar kelime parametresi gereklidir"
            }), 400
            
        if not location:
            return jsonify({
                "error": "Location parameter is required", 
                "message": "Lokasyon parametresi gereklidir"
            }), 400
        
        # Opsiyonel parametreler
        locale = request.args.get('locale', 'tr_TR')
        sort_type = request.args.get('sort', 'relevance')
        pagesize = request.args.get('pagesize', '10')
        contracttype = request.args.get('contracttype')
        contractperiod = request.args.get('contractperiod')
        
        # Sayısal parametreleri dönüştür
        try:
            pagesize = int(pagesize)
            if pagesize > 50:  # Maksimum limit
                pagesize = 50
        except ValueError:
            pagesize = 10
        
        # İş arama fonksiyonunu çağır
        optional_params = {
            'sort': sort_type,
            'pagesize': pagesize
        }
        
        if contracttype:
            optional_params['contracttype'] = contracttype
        if contractperiod:
            optional_params['contractperiod'] = contractperiod
            
        logger.info(f"Job search request: keywords='{keywords}', location='{location}', locale='{locale}'")
        
        result = search_jobs(
            keywords=keywords,
            location=location,
            locale=locale,
            **optional_params
        )
        
        # Sonucu mobil uygulama için uygun formata dönüştür
        formatted_result = format_search_results(result, keywords, location)
        
        return jsonify(formatted_result)
        
    except Exception as e:
        logger.error(f"Error in job search API: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": "İş arama sırasında bir hata oluştu",
            "details": str(e)
        }), 500

@app.route('/api/jobs/details', methods=['GET'])
def api_job_details():
    """
    İş detayları API endpoint'i
    
    Query Parameters:
    - url (required): İş ilanının URL'si
    - locale (optional): Dil kodu (default: tr_TR)
    """
    try:
        job_url = request.args.get('url', '').strip()
        
        if not job_url:
            return jsonify({
                "error": "URL parameter is required",
                "message": "URL parametresi gereklidir"
            }), 400
        
        locale = request.args.get('locale', 'tr_TR')
        
        logger.info(f"Job details request: url='{job_url}', locale='{locale}'")
        
        result = get_job_details(job_url, locale)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in job details API: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": "İş detayları alınırken bir hata oluştu",
            "details": str(e)
        }), 500

def format_search_results(result, keywords, location):
    """
    API sonuçlarını mobil uygulama için uygun formata dönüştür
    """
    if result.get('type') == 'demo':
        # Demo verilerini mobil uygulama formatına dönüştür
        formatted_jobs = []
        for job in result.get('jobs', []):
            # Enhanced formatting for demo jobs
            formatted_job = {
                'id': job.get('id', str(hash(job.get('url', job.get('title', ''))))),
                'title': job.get('title', ''),
                'company': job.get('company', ''),
                'location': job.get('location', location),
                'description': job.get('description', ''),
                'requirements': job.get('requirements', extract_requirements(job.get('description', ''))),
                'salary': job.get('salary', ''),
                'type': job.get('type', 'Tam Zamanlı'),
                'postedDate': job.get('date', job.get('posted_date', '')),
                'url': job.get('url', '')
            }
            formatted_jobs.append(formatted_job)

        return {
            'success': True,
            'jobs': formatted_jobs,
            'totalResults': result.get('total_jobs', len(formatted_jobs)),
            'searchCriteria': {
                'query': keywords,
                'location': location
            },
            'message': result.get('message', 'Gelişmiş demo veriler gösteriliyor'),
            'type': 'demo',
            'enhanced': result.get('enhanced', False)
        }
    
    elif 'error' in result:
        return {
            'success': False,
            'error': result.get('error'),
            'message': result.get('message', 'Bir hata oluştu'),
            'jobs': [],
            'totalResults': 0
        }
    
    else:
        # Gerçek API sonuçları için format (Careerjet API response)
        jobs = result.get('jobs', [])
        formatted_jobs = []
        
        for job in jobs:
            formatted_job = {
                'id': str(hash(job.get('url', job.get('title', '')))),
                'title': job.get('title', ''),
                'company': job.get('company', ''),
                'location': job.get('locations', location),
                'description': job.get('description', ''),
                'requirements': extract_requirements(job.get('description', '')),
                'salary': job.get('salary', 'Belirtilmemiş'),
                'type': format_contract_type(job.get('contracttype', '')),
                'postedDate': job.get('date', ''),
                'url': job.get('url', '')
            }
            formatted_jobs.append(formatted_job)
        
        return {
            'success': True,
            'jobs': formatted_jobs,
            'totalResults': result.get('hits', len(formatted_jobs)),
            'searchCriteria': {
                'query': keywords,
                'location': location
            }
        }

def extract_requirements(description):
    """
    İş açıklamasından gereksinimleri çıkar (basit implementasyon)
    """
    # Basit anahtar kelime tabanlı gereksinim çıkarma
    common_skills = [
        'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C#', 'PHP',
        'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker',
        'AWS', 'Azure', 'Linux', 'Windows', 'API', 'REST', 'GraphQL'
    ]
    
    requirements = []
    description_lower = description.lower()
    
    for skill in common_skills:
        if skill.lower() in description_lower:
            requirements.append(skill)
    
    # Eğer hiç gereksinim bulunamazsa varsayılan ekle
    if not requirements:
        requirements = ['İlgili alanda deneyim', 'Takım çalışması', 'İletişim becerileri']
    
    return requirements[:5]  # Maksimum 5 gereksinim

def format_contract_type(contract_type):
    """
    Sözleşme türünü Türkçe'ye çevir
    """
    contract_map = {
        'p': 'Tam Zamanlı',
        'c': 'Sözleşmeli',
        't': 'Geçici',
        'f': 'Tam Zamanlı',
        'part': 'Yarı Zamanlı'
    }
    return contract_map.get(contract_type, 'Tam Zamanlı')

if __name__ == '__main__':
    print("🚀 Career MCP API Server başlatılıyor...")
    print("📍 Endpoint'ler:")
    print("   - GET /                     : Sağlık kontrolü")
    print("   - GET /api/jobs/search      : İş arama")
    print("   - GET /api/jobs/details     : İş detayları")
    print("🌐 Server: http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
