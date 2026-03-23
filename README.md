# Spotify Lyrics

**[English](#english)** &nbsp;·&nbsp; **[Türkçe](#türkçe)**

---

<a name="english"></a>

# Spotify Lyrics — English

A minimalist fullscreen app that displays your currently playing Spotify track's lyrics in large, animated text with automatic Turkish translation.

**[🌐 Live Demo](https://music.baransel.site)** &nbsp;·&nbsp; **[▶ Watch on YouTube](https://youtu.be/7kPN7lkhNbc)**

---

## Features

- Tracks your currently playing Spotify song in real time
- Displays lyrics word-by-word with large, fullscreen animations
- Automatically translates non-Turkish lyrics to Turkish
- Animated wave dots with progress indicator during instrumental sections
- Dynamic color palette extracted from the album cover
- Completely free — no external API keys required (lrclib + Lingva)

---

## Setup

### 1. Create a Spotify Developer app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **"Create app"**.
3. Enter any name and description.
4. Add the following **Redirect URI**:
   ```
   http://localhost:3000/callback
   ```
5. Check **"Web API"** and save.
6. After creation, open **Settings** and copy:
   - `Client ID`
   - `Client Secret`

---

### 2. Clone the repo and install dependencies

```bash
git clone https://github.com/inalbaransel/Spotify-lyrics.git
cd Spotify-lyrics
npm install
```

---

### 3. Create `.env.local`

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

> **Note:** `SPOTIFY_CLIENT_SECRET` is only used server-side and is never exposed to the browser.

---

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`, log in with your Spotify account and start playing music.

---

## Deploying to Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. Add the three environment variables from `.env.local` under **Environment Variables**.
3. Update `NEXT_PUBLIC_REDIRECT_URI` to your production URL:
   ```
   https://your-app.vercel.app/callback
   ```
4. Add the same URL as a **Redirect URI** in the Spotify Developer Dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config) |
| Font | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) via `next/font` |
| Auth | Spotify OAuth 2.0 — PKCE flow (client secret server-side only) |
| Now Playing | [Spotify Web API](https://developer.spotify.com/documentation/web-api) |
| Lyrics | [lrclib.net](https://lrclib.net) — free, no auth, LRC format |
| Translation | [Lingva Translate](https://lingva.ml) — Google Translate proxy, no key needed |
| Color palette | Dynamically extracted from album art via CSS filter |

---

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── callback/page.tsx     # OAuth callback
│   └── api/auth/token/       # Token exchange (server-side)
├── components/
│   ├── LyricsPlayer.tsx      # Main orchestrator
│   ├── LyricLine.tsx         # Word-by-word animated lyric line
│   ├── TranslationPanel.tsx  # Turkish translation panel
│   ├── InstrumentalDots.tsx  # Instrumental section indicator
│   └── NowPlayingBar.tsx     # Bottom info bar
├── hooks/
│   ├── useSpotifyPlayer.ts   # Polling + drift compensation
│   ├── useLyrics.ts          # lrclib fetch + cache
│   ├── useWordSync.ts        # Binary search word sync
│   └── useTranslation.ts     # Translation + prefetch + Turkish detection
└── lib/
    ├── spotify-client.ts     # API wrapper + token refresh mutex
    ├── token-store.ts        # localStorage token management
    └── lrc-parser.ts         # LRC → [{timeMs, text}]
```

---

## License

MIT

---

<a name="türkçe"></a>

# Spotify Lyrics — Türkçe

Spotify'da çalan şarkının sözlerini büyük, animasyonlu bir şekilde gösteren; Türkçe çeviri sunan minimalist bir ekran uygulaması.

**[🌐 Canlı Demo](https://music.baransel.site)** &nbsp;·&nbsp; **[▶ Tanıtım Videosu](https://youtu.be/7kPN7lkhNbc)**

---

## Özellikler

- Spotify'da çalan şarkıyı gerçek zamanlı takip eder
- Sözleri büyük, tam ekran animasyonla kelime kelime gösterir
- Türkçe olmayan sözleri otomatik olarak Türkçe'ye çevirir
- Enstrümantal bölümlerde dalga animasyonlu ilerleme göstergesi
- Albüm kapağından dinamik renk paleti üretir
- Tamamen ücretsiz — harici API anahtarı gerekmez (lrclib + Lingva)

---

## Kurulum

### 1. Spotify Developer uygulaması oluştur

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)'a git ve hesabınla giriş yap.
2. **"Create app"** butonuna tıkla.
3. Uygulama adı ve açıklama gir (ne yazarsan yaz).
4. **Redirect URI** alanına şunu ekle:
   ```
   http://localhost:3000/callback
   ```
5. **"Web API"** seçeneğini işaretle ve kaydet.
6. Uygulamayı oluşturduktan sonra **Settings** sayfasından şunları kopyala:
   - `Client ID`
   - `Client Secret`

---

### 2. Projeyi klonla ve bağımlılıkları kur

```bash
git clone https://github.com/inalbaransel/Spotify-lyrics.git
cd Spotify-lyrics
npm install
```

---

### 3. `.env.local` dosyasını oluştur

Projenin kök dizininde `.env.local` adında bir dosya oluştur ve içine şunları yaz:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=buraya_client_id_yaz
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
SPOTIFY_CLIENT_SECRET=buraya_client_secret_yaz
```

> **Not:** `SPOTIFY_CLIENT_SECRET` değeri yalnızca sunucu tarafında kullanılır, tarayıcıya hiçbir zaman iletilmez.

---

### 4. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç, Spotify hesabınla giriş yap ve müzik çalmaya başla.

---

## Vercel'e Deploy

1. Repoyu [Vercel](https://vercel.com)'e import et.
2. **Environment Variables** bölümüne `.env.local` içindeki üç değişkeni ekle.
3. `NEXT_PUBLIC_REDIRECT_URI` değerini production URL'inle güncelle:
   ```
   https://your-app.vercel.app/callback
   ```
4. Spotify Developer Dashboard'da bu URL'yi de **Redirect URI** olarak ekle.

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Stil | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config) |
| Font | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) via `next/font` |
| Auth | Spotify OAuth 2.0 — PKCE akışı (sunucuda client secret) |
| Şarkı verisi | [Spotify Web API](https://developer.spotify.com/documentation/web-api) |
| Sözler | [lrclib.net](https://lrclib.net) — ücretsiz, kayıtsız, LRC formatı |
| Çeviri | [Lingva Translate](https://lingva.ml) — Google Translate tabanlı, key gerektirmez |
| Renk paleti | Albüm kapağından CSS filter ile dinamik üretim |

---

## Proje Yapısı

```
├── app/
│   ├── page.tsx              # Ana sayfa
│   ├── callback/page.tsx     # OAuth callback
│   └── api/auth/token/       # Token exchange (server-side)
├── components/
│   ├── LyricsPlayer.tsx      # Ana orkestratör
│   ├── LyricLine.tsx         # Kelime kelime animasyonlu satır
│   ├── TranslationPanel.tsx  # Türkçe çeviri paneli
│   ├── InstrumentalDots.tsx  # Enstrümantal bölüm göstergesi
│   └── NowPlayingBar.tsx     # Alt bilgi çubuğu
├── hooks/
│   ├── useSpotifyPlayer.ts   # Polling + drift compensation
│   ├── useLyrics.ts          # lrclib fetch + cache
│   ├── useWordSync.ts        # Binary search ile kelime senkronizasyonu
│   └── useTranslation.ts     # Çeviri + prefetch + Türkçe tespiti
└── lib/
    ├── spotify-client.ts     # API wrapper + token mutex
    ├── token-store.ts        # localStorage token yönetimi
    └── lrc-parser.ts         # LRC → [{timeMs, text}]
```

---

## Lisans

MIT
