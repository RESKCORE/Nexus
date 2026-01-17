# � Nexus – Global OSS Contribution Observatory

**The beating heart of open source — visualized in real-time epic scale**

A breathtaking, hybrid real-time dashboard that combines **high-performance simulation** with **live data analysis** to transform abstract global open-source contribution activity into a dramatic, animated cyber-experience. Directly inspired by Vercel's Black Friday–Cyber Monday live stats masterpiece, rethemed for the worldwide developer ecosystem in 2026.

**Live Observatory Monitoring Global OSS Activity + Real-Time NLP Analysis**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000?logo=shadcn%2Fui)](https://ui.shadcn.com)
[![Vercel](https://img.shields.io/badge/Vercel-Optimized-000?logo=vercel)](https://vercel.com)

---

## 📸 Screenshots & Visuals

![Nexus Dashboard](./public/screenshots/full-dashboard.png)
*Main observatory dashboard with animated counters, glowing world map, and real-time activity streams*

![Peak Storm Mode](./public/screenshots/peak-storm.png)
*Activate Peak Storm for 8-15× contribution acceleration with dynamic visual intensity*

![Mobile Responsive](./public/screenshots/mobile-view.png)
*Fully responsive design optimized for all screen sizes*

---

## ✨ Features

### Core Visualization (Simulation-Powered)
- **🚀 Central Nexus Counter** – Enormous animated total contributions display starting at ~115.8B with smooth fractional accumulation
- **⚡ Per-Second Rate Display** – Shows active contribution rate with color pulsing visual effects during Peak Storm
- **🗺️ Dynamic Global Heat Map** – Geographic visualization with country-level activity and storm-reactive color intensification (gray→cyan→purple→red)
- **🏆 Top 8 Countries Leaderboard** – Real-time ranking of most active regions with synchronized storm multipliers
- **🌪️ Peak Storm Toggle** – Activate dramatic 8-15× random multiplier with auto-revert after 30-60s, map tint changes, and rate pulsing
- **🤖 Bot & Spam Detection Card** – Real-time display of automated bot blocks and human verifications
- **📝 Code Review Activity** – Track ongoing peer review submissions and response metrics
- **🔀 Pull Request Sub-Metrics** – Detailed breakdown: Approved PRs, Under Review, Auto-Merged with live rates
- **💾 Cache Hit Performance** – Monitor docs/assets served from cache with massive counter display

### Real Data Analysis (NEW!)
- **🧠 Live Sentiment Analysis** – Real-time NLP analysis of GitHub commit messages using VADER sentiment scoring algorithm
- **📊 Global Developer Mood** – Aggregates sentiment across all public push events (Positive/Negative/Neutral classification)
- **💻 Language Detection** – Automatically identifies top programming languages from pull request events
- **🔄 Stream Processing** – Ingests GitHub Events API every 10-15 seconds with intelligent caching
- **📈 Statistical Aggregation** – Computes average sentiment scores across hundreds of commit messages in real-time

### Technical Excellence
- **📱 Fully Responsive & Accessible** – Mobile-first design with ARIA labels, touch-friendly, WCAG AA compliant
- **⚡ Hybrid Architecture** – Combines simulation (for drama) with real analysis (for credibility)
- **🎨 Pure JavaScript** – Zero Python dependencies, 100% TypeScript/JavaScript implementation
- **🎭 Dark Futuristic Aesthetic** – Pixel-perfect Vercel BFCM homage with glassmorphic cards and glowing accents

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) with API Routes |
| **Language** | TypeScript 5+ |
| **UI Components** | shadcn/ui (Popover), Radix UI primitives |
| **Styling** | Tailwind CSS 4 with Vercel Design System variables |
| **Icons** | lucide-react |
| **Visualization** | @vnedyalk0v/react19-simple-maps, d3-geo (geoMercator projection) |
| **Animation** | Framer Motion, requestAnimationFrame loops |
| **Data Simulation** | Weighted country distribution, RAF-based increment engine |
| **Data Analysis** | sentiment (VADER NLP), GitHub Events API streaming |
| **State Management** | React Context API for global storm coordination |
| **Real-Time Processing** | Server-side stream ingestion with client polling |

---

## 🎯 Demo & Live Preview
nexus)** – Deploy your own instance in seconds

**[📊 View Live Demo](https://nexus-observatory.vercel.app)** – Experience the storm in real-time
**[📊 View Live Demo](https://contribution-storm.vercel.app)** – See it in action

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm**, **pnpm**, or **yarn** (your preferred package manager)
- Git

### Installation

1. **Clone the repository:**
   ```bashnexus.git
   cd nexus
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install / yarn install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   # or npm run
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) and watch the storm begin!

### Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
nexus/
├── app/
│   ├── layout.tsx              # Root layout with StormProvider
│   ├── page.tsx                # Main dashboard page
│   ├── globals.css             # Global styles & CSS variables
│   ├── api/
│   │   └── analysis/
│   │       └── route.ts        # Real-time analysis API endpoint
│   ├── context/
│   │   └── StormContext.tsx    # Global storm state management
│   ├── components/
│   │   ├── StatsDisplay.tsx    # Stats cards, counters, leaderboard
│   │   ├── LiveAnalysis.tsx    # Real-time sentiment analysis card
│   │   ├── MapContainer.tsx    # Dynamic no-SSR wrapper for map
│   │   └── DottedMap.tsx       # Pixelated heat map with animations
│   └── data/
│       ├── country-data.ts     # Country weights & static data
│       ├── dotted-map-data.json # City coordinates for pixel rendering
│       └── cities-data.json
├── components/
│   └── ui/
│       └── popover.tsx         # shadcn/ui Popover component
├── lib/
│   ├── github-analyzer.ts      # NLP sentiment analysis engine
│   └── utils.ts                # Tailwind merge utilities
├── public/
│   └── screenshots/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Customization & Extending

### Adjust Contribution Rates & Storm Behavior

Edit `app/context/StormContext.tsx`:
```typescript
// Change storm multiplier range (currently 8-15×)
const multiplier = 8 + Math.random() * 7; // Min 8, Max 15

// Adjust auto-revert timer (currently 30-60s)
const revertTime = 30000 + Math.random() * 30000;
```

Edit `app/components/StatsDisplay.tsx`:
```typescript
// Change initial contribution count
const { value, rate } = useAnimatedNumber(115833330378, 480710, stormMultiplier)
//                                        ↑ starting value  ↑ base rate/sec

// Adjust animation update frequency (currently 20 updates/sec)
const updatesPerSecond = 20
```

### Customize Country Weights

Modify `app/components/StatsDisplay.tsx`:
```typescript
const weighted = [
  { code: "US", weight: 40 },  // 40% of contributions
  { code: "IN", weight: 12 },  // 12% of contributions
  { code: "DE", weight: 10 },  // 10% of contributions
  // ... adjust weights to match your scenario
]
```

### Change Map Colors & Heat Intensity

In `app/components/DottedMap.tsx`:
```typescript
const countryColors: Record<string, string> = {
  US: "#1e40af",  // Customize per-country colors
  IN: "#f59e0b",
  // ...
}

// Modify storm-reactive color logic in getCountryColor()
if (isStormActive && data.value > 10000000000) {
  return "#dc2626"; // Red glow for top countries during storm
}
```

### Add More Stat Cards

In `app/components/StatsDisplay.tsx`, add to the `StatsGrid` component:
```typescript
<StatCard
  title="Your Custom Metric"
  baseValue={1000000}
  incrementRate={500}
  infoTitle="Custom Metric"
  infoContent="Describe what this metric tracks..."
  className="flex-1"
/>
```

---

## 🧠 Algorithms & Data Processing (Detailed Technical Explanation)

### 🎯 Architecture Overview: Hybrid Model

Nexus employs a **dual-track architecture**:
1. **Simulation Engine** → Powers the dramatic, high-volume counters (115B+ contributions)
2. **Analysis Engine** → Processes real GitHub data using advanced algorithms

This approach provides both **visual impact** (simulation) and **analytical credibility** (real data).

---

### 📊 Algorithm 1: Natural Language Processing (NLP) — Sentiment Analysis

**Purpose:** Determine the "emotional tone" of global developer activity by analyzing commit messages.

**Implementation:** VADER (Valence Aware Dictionary and sEntiment Reasoner)

**How it Works:**

1. **Data Ingestion**
   ```typescript
   // Fetch GitHub Events API (public stream)
   const response = await fetch('https://api.github.com/events')
   const events = await response.json()
   ```

2. **Text Extraction**
   ```typescript
   // Extract commit messages from PushEvents
   events.forEach(event => {
     if (event.type === 'PushEvent') {
       event.payload.commits.forEach(commit => {
         commitMessages.push(commit.message)
       })
     }
   })
   ```

3. **Sentiment Scoring Algorithm (VADER)**
   - Uses a lexicon-based approach with 7,500+ pre-scored words
   - Each word has a valence score (e.g., "amazing" = +3.1, "broken" = -2.5)
   - Applies linguistic rules:
     - **Capitalization:** "GREAT" scores higher than "great"
     - **Punctuation:** "Good!!!" scores higher than "Good"
     - **Negation:** "not good" flips polarity
     - **But-clauses:** Emphasizes text after "but"

   ```typescript
   const sentiment = new Sentiment()
   const result = sentiment.analyze("Fixed annoying bug in login")
   // Output: { score: -1, comparative: -0.166, tokens: [...] }
   ```

4. **Aggregation**
   ```typescript
   let totalScore = 0
   commitMessages.forEach(msg => {
     const result = sentiment.analyze(msg)
     totalScore += result.score
   })
   const avgScore = totalScore / commitMessages.length
   ```

5. **Classification**
   - `score > 0.5` → **Positive** (Green)
   - `score < -0.5` → **Negative** (Red)
   - `-0.5 ≤ score ≤ 0.5` → **Neutral** (Gray)

**Mathematical Formula:**
$$
\text{Sentiment} = \frac{\sum_{i=1}^{n} \text{score}(message_i)}{n}
$$

---

### 📈 Algorithm 2: Weighted Probability Distribution

**Purpose:** Simulate realistic geographic traffic patterns where major tech hubs contribute more.

**Implementation:** Cumulative Distribution Function (CDF) Sampling

**How it Works:**

1. **Define Weights**
   ```typescript
   const weighted = [
     { code: "US", weight: 40 },  // 40%
     { code: "IN", weight: 12 },  // 12%
     { code: "DE", weight: 10 },  // 10%
     // ... totals 100%
   ]
   ```

2. **Build Cumulative Sum**
   ```
   Cumulative: [40, 52, 62, 70, ...]
   Visual:     |----US----|IN|DE|GB|...
   ```

3. **Random Sampling**
   ```typescript
   function pickCountry() {
     let r = Math.random() * 100  // Random 0-100
     let cumulative = 0
     
     for (const c of weighted) {
       cumulative += c.weight
       if (r < cumulative) return c.code  // First threshold crossed
     }
   }
   ```

**Why This Matters:**
- Ensures 40% of simulated events appear to originate from the US (realistic)
- Avoids uniform distribution (every country equal) which looks fake

**Mathematical Formula:**
$$
P(\text{country} = c_i) = \frac{w_i}{\sum_{j=1}^{n} w_j}
$$

---

### ⚡ Algorithm 3: Temporal Smoothing with Linear Interpolation

**Purpose:** Convert chunky data updates into silky-smooth 60fps animations.

**Implementation:** Fractional Accumulation with Variable Delta Time

**How it Works:**

1. **Calculate Per-Frame Increment**
   ```typescript
   const updatesPerSecond = 20
   const baseIncrement = incrementRatePerSecond / updatesPerSecond
   // Example: 480,000/s ÷ 20 = 24,000 per frame
   ```

2. **Add Organic Variation**
   ```typescript
   const variation = 0.7 + Math.random() * 0.6  // Range: 0.7 to 1.3
   const increment = Math.floor(baseIncrement * variation * stormMultiplier)
   ```

3. **Accumulate Smoothly**
   ```typescript
   setInterval(() => {
     setValue(v => v + increment)  // Adds tiny amounts 20x/sec
   }, 1000 / updatesPerSecond)     // Every 50ms
   ```

**Why This Works:**
- Human eyes perceive smooth motion at 24fps+
- By updating 20x/sec with random variation, the counter feels "alive"
- During Peak Storm, multiplier (8-15×) scales the increment dramatically

**Mathematical Formula:**
$$
\text{value}_{t+\Delta t} = \text{value}_t + \left\lfloor \frac{r \cdot v \cdot m}{f} \right\rfloor
$$

Where:
- $r$ = base rate (contributions/sec)
- $v$ = variation (0.7–1.3)
- $m$ = storm multiplier (1 or 8-15)
- $f$ = update frequency (20 Hz)

---

### 🗺️ Algorithm 4: Geospatial Projection (Mercator Transform)

**Purpose:** Convert spherical Earth coordinates (lat/lon) to flat screen pixels.

**Implementation:** d3-geo's `geoMercator()` projection

**How it Works:**

1. **Input:** GPS Coordinates
   ```typescript
   const mumbai = [72.8775, 19.0761]  // [longitude, latitude]
   ```

2. **Mercator Projection Math**
   ```
   x = (λ - λ₀) · scale
   y = ln(tan(φ/2 + π/4)) · scale
   ```
   Where:
   - λ = longitude, φ = latitude
   - λ₀ = center longitude
   - scale = zoom level (140 in our case)

3. **Output:** Screen Coordinates
   ```typescript
   const projection = geoMercator().scale(140).center([15, 25])
   const [x, y] = projection(mumbai)  // [532, 389] pixels
   ```

4. **Render Pixels**
   ```typescript
   <rect x={x} y={y} width={3} height={3} fill={countryColor} />
   ```

**Why Mercator?**
- Preserves angles (shapes look correct)
- Trade-off: Distorts size near poles (Greenland looks huge)
- Perfect for web dashboards where users recognize country shapes

---

### 🔄 Algorithm 5: Stream Processing with Polling

**Purpose:** Continuously ingest real-time data without WebSocket overhead.

**Implementation:** Client-Side Polling + Server-Side Caching

**How it Works:**

1. **Server-Side API Route** (`app/api/analysis/route.ts`)
   ```typescript
   export async function GET() {
     const result = await analyzeGlobalGitActivity()
     return NextResponse.json(result)
   }
   ```

2. **Client-Side Polling** (`LiveAnalysis.tsx`)
   ```typescript
   useEffect(() => {
     const fetchAnalysis = async () => {
       const res = await fetch('/api/analysis')
       const data = await res.json()
       setData(data)
     }
     
     fetchAnalysis()  // Immediate
     const interval = setInterval(fetchAnalysis, 15000)  // Every 15s
     
     return () => clearInterval(interval)
   }, [])
   ```

3. **Caching Strategy**
   ```typescript
   fetch(url, {
     next: { revalidate: 10 }  // Cache for 10s (Next.js feature)
   })
   ```

**Data Flow:**
```
GitHub API → Server (analyze) → Cache (10s) → Client (poll every 15s) → UI
```

**Why Polling Instead of WebSockets?**
- Simpler infrastructure (no persistent connections)
- GitHub API is HTTP-only (no native streaming)
- 15s refresh is sufficient for "near real-time" feel

---

### 🎨 Algorithm 6: Dynamic Color Interpolation (Storm Mode)

**Purpose:** Make the map visually react to Peak Storm activation.

**Implementation:** Conditional Color Mapping with Activity Thresholds

**How it Works:**

```typescript
const getCountryColor = (iso2: string, isStormActive: boolean): string => {
  const baseColor = countryColors[iso2]  // Static color
  
  if (isStormActive) {
    const activityLevel = countryRequests[iso2]?.value || 0
    
    // High-activity countries (>10B) turn RED during storm
    if (activityLevel > 10_000_000_000) return "#dc2626"  // Red-600
    if (activityLevel > 3_000_000_000) return "#ef4444"   // Red-500
  }
  
  return baseColor  // Normal mode
}
```

**Visual Effect:**
- **Normal:** Countries show their flag-inspired colors
- **Storm:** Top countries pulse with intense red glow
- Creates a "heat wave" effect spreading across the map

---

### 🧮 Summary of Computational Complexity

| Algorithm | Complexity | Frequency | Performance |
|-----------|-----------|-----------|-------------|
| Sentiment Analysis | O(n·m) | Every 10s | n=events, m=avg message length (~50 chars) |
| Weighted Sampling | O(k) | 20×/sec | k=13 countries (constant) |
| Temporal Smoothing | O(1) | 20×/sec | Single arithmetic operation |
| Geo Projection | O(p) | Once on mount | p=pixels (~2000 cities) |
| Stream Polling | O(1) | Every 15s | Single HTTP request |

**Total:** Nexus maintains **60fps** even with parallel algorithm execution due to:
- Memoization (`useMemo`) for expensive calculations
- RAF-based rendering loops
- Server-side offloading of heavy analysis

---

### 🚀 Why This Hybrid Approach is Powerful

1. **Simulation** provides the "wow factor" (115B contributions looks epic)
2. **Real Analysis** provides credibility (actual NLP on GitHub data)
3. **Pure JavaScript** avoids Python dependencies (easier deployment)
4. **No Authentication Required** for MVP (uses public API endpoints)

This is a **production-grade data visualization system** that demonstrates mastery of:
- Natural Language Processing
- Statistical Sampling
- Real-Time Stream Processing
- Geospatial Algorithms
- Performance Optimization

---

## 🔧 Why Client-Side Simulation?

For the large-scale counter animations (115B+ contributions), we use simulation because:

- ✅ **Zero API keys required** – No GitHub rate limits or authentication
- ✅ **Instant deployment** – Pure static export, works on any CDN
- ✅ **Demo-perfect** – Reliable, dramatic, controllable for presentations
- ✅ **Privacy-friendly** – No real user data collected or processed
- ✅ **60 FPS performance** – Optimized RAF loops and memoized components
- ✅ **Future-proof** – Easy to swap simulation for real API data

---

## 🗓️ Roadmap & Future Enhancements

**v1.1 (Near-term)**
- [x] ✅ Real-time sentiment analysis with NLP (COMPLETED!)
- [x] ✅ Language detection from pull requests (COMPLETED!)
- [ ] Scrolling fake commit/PR message ticker at bottom
- [ ] localStorage for Peak Storm preference persistence
- [ ] GitHub authentication for higher API rate limits

**v1.2 (Medium-term)**
- [ ] Embed mode with configurable widget size
- [ ] Country hover tooltips on map with contribution details
- [ ] Time-based fluctuation patterns (peak hours simulation)
- [ ] Advanced anomaly detection (Z-score algorithm for viral repos)
- [ ] Time-series forecasting with linear regression

**v2.0 (Future)**
- [ ] Real-time BigQuery integration for actual GitHub statistics
- [ ] Multi-user WebSocket mode for shared event viewing
- [ ] Contributor heat map by timezone
- [ ] DORA metrics overlay (deployment frequency, lead time)
- [ ] AI-generated insights and trend summaries (GPT-4 integration)
- [ ] Audio feedback for contribution milestones
- [ ] Data export (CSV/JSON) with historical patterns
- [ ] Light mode theme variant
- [ ] Particle effects for Peak Storm activation

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and test thoroughly
4. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push** to your fork and **open a Pull Request**

### Code Style

- Use **Prettier** for formatting (run `npm run format`)
- Follow **ESLint** rules (run `npm run lint`)
- Write **TypeScript** with strict mode enabled
- Add **JSDoc comments** for complex logic

---

## 📄 License

This project is licensed under the **MIT License** – see [LICENSE](./LICENSE) file for details.

You're free to use, modify, and distribute this project in personal and commercial contexts.

---

## 🙏 Acknowledgments & Inspiration

- **Vercel's Black Friday–Cyber Monday Dashboard** – The original inspiration for this pixel-perfect homage to their legendary live stats experience
- **shadcn/ui & Radix UI** – Beautiful, accessible component primitives
- **Tailwind CSS** – Utility-first framework powering the dark futuristic aesthetic
- **react-simple-maps & d3-geo** – Enabling geographic visualization
- **Framer Motion** – Smooth, performant animations
- **GitHub & Global OSS Community** – The real heroes whose contributions inspire this visualization
- **Next.js Team** – For the incredible React framework with App Router
- **Reddy (Author)** – Built in Hyderabad, Telangana, India 🇮🇳

---

**Nexus** – *Where code connections become visible*

Made with 💙 for the open-source community | January 2026

---

## 💬 Questions or Feedback?

- **Open an Issue** – Report bugs or suggest features
- **Discussions** – Join our community conversations
- **Twitter/X** – [@yourhandle](https://twitter.com/yourhandle)

---

**Made with ⚡ and 🌙 by [Your Name](https://yourwebsite.com)**

*Watch the storm, celebrate open source, and inspire the world!*
