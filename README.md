# Redis Advanced - Cache & Distributed Lock Demo

> **[Live Demo](https://redis-cache-distributed-lock.vercel.app/)**

Spring Boot + React ile geliştirilmiş, Redis cache stratejilerini ve distributed lock mekanizmalarını interaktif olarak gösteren full-stack demo uygulaması.

## Teknoloji Stack

**Backend:** Java 17, Spring Boot 3.3, Spring Data Redis, Redisson, Resilience4j, H2
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts
**Altyapı:** Docker Compose, Redis 7, RedisInsight

## Kapsanan Konular

- Cache Patterns (Cache-Aside, Write-Through, Read-Through)
- TTL & Invalidation stratejileri
- Cache Key tasarımı
- Cache problemleri (Penetration, Stampede, Null Caching)
- Resilience & Circuit Breaker
- Distributed Lock & Redlock algoritması
- Monitoring & Metrics

## Kurulum

### Gereksinimler

- Java 17+
- Node.js 18+
- Docker & Docker Compose

### Çalıştırma

```bash
# Redis ve RedisInsight başlat
docker-compose up -d

# Frontend bağımlılıklarını yükle ve build et
cd frontend
npm install
npm run build
cd ..

# Backend'i başlat (frontend build'i otomatik dahil edilir)
./gradlew :backend:bootRun
```

Uygulama `http://localhost:8080` adresinde çalışır.
RedisInsight: `http://localhost:8001`

## Proje Yapısı

```
├── backend/          # Spring Boot uygulaması
│   └── src/
│       ├── main/java/com/redis/advanced/
│       │   ├── config/        # Redis, Redisson, Web config
│       │   ├── controller/    # REST API endpoint'leri
│       │   ├── model/         # Domain modelleri
│       │   ├── repository/    # Spring Data repository
│       │   └── service/       # İş mantığı katmanı
│       └── test/              # Integration testleri
├── frontend/         # React + TypeScript uygulaması
│   └── src/
│       ├── slides/            # Sunum slaytları
│       ├── live-demo/         # İnteraktif demo arayüzü
│       ├── components/        # Yeniden kullanılabilir bileşenler
│       └── api/               # Backend API istemcisi
├── docker-compose.yml
└── build.gradle.kts
```
