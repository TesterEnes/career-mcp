# Careerjet Job Search MCP Server

Bu proje, [Careerjet API](https://www.careerjet.com/partners/api/) kullanarak iş arama işlevselliği sağlayan bir MCP (Model Context Protocol) server'ıdır.

## Özellikler

- **İş Arama**: Anahtar kelimeler ve lokasyon ile iş arama
- **Gelişmiş Filtreleme**: Sözleşme türü, çalışma süresi, maaş sıralaması
- **Çoklu Dil Desteği**: 50+ ülke ve dil desteği
- **MCP Uyumlu**: AI asistanları ile kolay entegrasyon

## Kurulum

### Gereksinimler

- Python 3.11+
- pip

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
pip install -r requirements.txt
```

2. **MCP Server'ı çalıştırın:**
```bash
python server.py
```

### Docker ile Kurulum

```bash
# Docker image'ı oluşturun
docker build -t careerjet-mcp .

# Container'ı çalıştırın
docker run -it careerjet-mcp
```

## Kullanım

### MCP Tools

#### 1. `search_jobs_tool`
İş arama işlevi.

**Parametreler:**
- `keywords` (zorunlu): Aranacak anahtar kelimeler
- `location` (zorunlu): İş lokasyonu
- `locale`: Dil/ülke kodu (varsayılan: en_US)
- `sort`: Sıralama türü (relevance, date, salary)
- `pagesize`: Sayfa başına sonuç sayısı
- `contracttype`: Sözleşme türü (p=permanent, c=contract, t=temporary)
- `contractperiod`: Çalışma süresi (f=full time, p=part time)

**Örnek:**
```python
# Python developer işleri London'da ara
result = search_jobs_tool(
    keywords="python developer",
    location="London",
    locale="en_GB",
    sort="salary",
    pagesize=20
)
```

#### 2. `get_job_details_tool`
İş detayları alma (temel implementasyon).

### Desteklenen Lokaller

- `en_US` - Amerika Birleşik Devletleri
- `en_GB` - Birleşik Krallık  
- `de_DE` - Almanya
- `fr_FR` - Fransa
- `es_ES` - İspanya
- `it_IT` - İtalya
- `tr_TR` - Türkiye
- Ve daha fazlası...

## Konfigürasyon

### Smithery.yaml

MCP client'larda kullanım için `smithery.yaml` dosyası mevcuttur:

```yaml
startCommand:
  type: stdio
  configSchema:
    type: object
    properties:
      affid:
        type: string
        description: "Careerjet Affiliate ID"
        default: "213e213hd12344552"
      locale:
        type: string
        description: "Varsayılan dil kodu"
        default: "en_US"
```

### Affiliate ID

Careerjet API kullanımı için bir Affiliate ID gereklidir. Ücretsiz hesap için:
1. [Careerjet Partners](http://www.careerjet.co.uk/partners) sayfasını ziyaret edin
2. Partner hesabı oluşturun
3. Aldığınız Affiliate ID'yi kullanın

## API Limitleri

- Careerjet API'sinin kullanım sıklığı limitleri vardır
- Yoğun kullanım için Careerjet ile iletişime geçin
- Rate limiting uygulanabilir

## Geliştirme

### Proje Yapısı

```
├── app.py              # Ana iş mantığı
├── server.py           # MCP server implementasyonu
├── requirements.txt    # Python bağımlılıkları
├── smithery.yaml      # MCP konfigürasyonu
├── Dockerfile         # Docker konfigürasyonu
└── README.md          # Bu dosya
```

### Test

```bash
# Basit test
python -c "from app import search_jobs; print(search_jobs('python', 'London'))"
```

## Lisans

MIT License

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## Destek

Sorularınız için issue açabilirsiniz.
