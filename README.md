# 🌍 Contribution Storm

A stunning, real-time simulated dashboard inspired by Vercel's Black Friday–Cyber Monday live stats page, re-themed to visualize global open-source contribution activity as if monitoring a massive-scale GitHub-like ecosystem.

**Live Dashboard Monitoring Global OSS Activity in Real-Time**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000?logo=shadcn%2Fui)](https://ui.shadcn.com)
[![Vercel](https://img.shields.io/badge/Vercel-Optimized-000?logo=vercel)](https://vercel.com)

---

## 📸 Screenshots & Visuals

![Contribution Storm Dashboard](./public/screenshots/full-dashboard.png)
*Main dashboard with animated counters, glowing world map, and real-time activity streams*

![Peak Storm Mode](./public/screenshots/peak-storm.png)
*Activate Peak Storm for 10x contribution acceleration and hypnotic visual effects*

![Mobile Responsive](./public/screenshots/mobile-view.png)
*Fully responsive design optimized for all screen sizes*

---

## ✨ Features

- **🚀 Live Animated Counter** – Real-time total contributions with smooth millisecond-precision ticking
- **⚡ Per-Second Rate Display** – Shows active contribution rate with dynamic multipliers
- **🗺️ Glowing World Heat Map** – Geographic visualization of global contribution intensity with animated color gradients
- **🏆 Top Countries Leaderboard** – Real-time ranking of most active regions with contribution rates
- **🌪️ Peak Storm Toggle** – Activate chaos mode for 10x contribution acceleration with intense visual feedback
- **🤖 Bot & Spam Detection Card** – Real-time display of automated bot activity filtering
- **📝 Code Review Activity** – Track ongoing peer review metrics and response times
- **🔀 Pull Request Sub-Metrics** – Detailed breakdown of PR status, reviews, and merge rates
- **💾 Cache Hit Performance** – Monitor system efficiency with real-time cache statistics
- **📱 Responsive Design** – Seamless experience from mobile to desktop with adaptive layouts
- **🎨 Pure Client-Side Simulation** – No backend required, no rate limits, instant deployment
- **🎭 Dark Mode Aesthetic** – Carefully crafted dark theme with neon accents for hypnotic appeal

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5+ |
| **UI Components** | shadcn/ui, Radix UI |
| **Styling** | Tailwind CSS 4 with custom animations |
| **Icons** | lucide-react |
| **Visualization** | react-simple-maps with custom overlays |
| **Animation** | requestAnimationFrame, CSS animations, React hooks |
| **Data Simulation** | Weighted random distribution, pure JavaScript |

---

## 🎯 Demo & Live Preview

**[🚀 Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fcontribution-storm)** – Deploy your own instance in seconds

**[📊 View Live Demo](https://contribution-storm.vercel.app)** – See it in action

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm**, **pnpm**, or **yarn** (your preferred package manager)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourname/contribution-storm.git
   cd contribution-storm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
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
contribution-storm/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main dashboard page
│   ├── globals.css          # Global styles & animations
│   └── data/
│       └── country-data.ts  # Country coordinates & weights
├── components/
│   ├── StatsDisplay.tsx     # Bottom stat cards with popovers
│   ├── MapContainer.tsx     # Interactive world map wrapper
│   ├── DottedMap.tsx        # Dotted map visualization
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── simulation.ts        # Fake data generation logic
│   └── utils.ts             # Helper utilities
├── public/
│   ├── screenshots/         # Dashboard screenshots
│   └── favicon.ico
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Customization & Extending

### Adjust Contribution Rates & Starting Numbers

Edit `lib/simulation.ts`:
```typescript
// Change initial contribution count
export const INITIAL_CONTRIBUTIONS = 1000000;

// Adjust per-second base rate (contributions/second)
export const BASE_RATE = 250;

// Modify peak storm multiplier
export const PEAK_MULTIPLIER = 10;
```

### Customize Country Weights

Modify `app/data/country-data.ts` to change how contributions are distributed:
```typescript
export const countryWeights = {
  'US': 0.25,      // 25% of global activity
  'CN': 0.20,      // 20% of global activity
  'IN': 0.15,      // 15% of global activity
  // ... adjust as needed
};
```

### Change Map Colors & Heat Intensity

In `components/DottedMap.tsx`:
```typescript
// Customize heat color gradient
const getHeatColor = (intensity: number) => {
  if (intensity > 0.8) return '#ff1744';      // Red-hot
  if (intensity > 0.5) return '#ffb300';      // Orange
  if (intensity > 0.2) return '#00e676';      // Green
  return '#004d40';                           // Deep teal
};
```

### Add More Stat Cards

Duplicate a card in `components/StatsDisplay.tsx` and customize:
```typescript
<div className="stat-card">
  <h3>Your New Metric</h3>
  <p className="big-number">{formatNumber(yourValue)}/s</p>
  <Popover>
    <PopoverTrigger asChild>
      <Info className="info-icon" />
    </PopoverTrigger>
    <PopoverContent>Your custom description</PopoverContent>
  </Popover>
</div>
```

---

## 🧠 Simulation Logic Explained

### Weighted Country Distribution

Contributions are randomly assigned to countries using weighted probability. This creates realistic geographic variation:

```typescript
const selectRandomCountry = () => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [country, weight] of Object.entries(countryWeights)) {
    cumulative += weight;
    if (rand < cumulative) return country;
  }
};
```

### Smooth Animation with requestAnimationFrame

Each frame (~60 FPS), the simulation advances contributions proportionally:

```typescript
useEffect(() => {
  let lastTime = Date.now();
  
  const animate = () => {
    const now = Date.now();
    const deltaMs = now - lastTime;
    
    // Calculate contributions for this frame
    const newContributions = (deltaMs / 1000) * rate * (isPeakMode ? 10 : 1);
    setCounter(prev => prev + newContributions);
    
    lastTime = now;
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}, [rate, isPeakMode]);
```

### Peak Storm Effect

Instantly multiplies the contribution rate by 10x and triggers visual feedback:

```typescript
const togglePeakMode = () => {
  setIsPeakMode(!isPeakMode);
  setRate(baseRate * (isPeakMode ? 1 : 10));
  
  // Visual feedback: flash, sound, intense glow
  triggerVisualEffect();
};
```

### Why Fake Data?

- ✅ **No rate limits** – Simulate unlimited GitHub activity
- ✅ **Privacy-friendly** – No real user/repo data
- ✅ **Demo-optimized** – Perfect for presentations and showcases
- ✅ **Instant deployment** – Zero backend infrastructure
- ✅ **Deterministic** – Reliable, predictable behavior

---

## 🗓️ Roadmap & Future Ideas

- [ ] **Real GitHub API Integration** – Connect to GitHub Archive or Events API for actual statistics
- [ ] **BigQuery Data Source** – Pull real aggregate GitHub data
- [ ] **Live Commit Message Ticker** – Scrolling feed of popular commits
- [ ] **Multi-User WebSocket Mode** – Shared real-time view for events/conferences
- [ ] **Dark/Light Mode Toggle** – User preference switching
- [ ] **Export Widget** – Embed dashboard in other sites
- [ ] **Data Export** – Download contribution history as CSV/JSON
- [ ] **Custom Time Ranges** – View historical patterns by date
- [ ] **Sound Effects** – Audio feedback for milestones
- [ ] **AI-Generated Summaries** – LLM-powered insights and trends

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

- **Vercel's Black Friday–Cyber Monday Dashboard** – The original inspiration for this design and interactive experience
- **shadcn/ui** – Beautiful, accessible component library
- **Tailwind CSS** – Utility-first CSS framework that powers the styling
- **GitHub & Open Source Community** – The source of inspiration for celebrating global OSS contributions
- **Next.js Team** – For the amazing React framework with App Router

---

## 💬 Questions or Feedback?

- **Open an Issue** – Report bugs or suggest features
- **Discussions** – Join our community conversations
- **Twitter/X** – [@yourhandle](https://twitter.com/yourhandle)

---

**Made with ⚡ and 🌙 by [Your Name](https://yourwebsite.com)**

*Watch the storm, celebrate open source, and inspire the world!*
