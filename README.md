# APEX Grip

APEX Grip is a cinematic, scroll-driven product landing page for a performance tyre concept. The experience blends a full-viewport motion sequence, layered editorial storytelling, and interactive tyre-variant comparison to explain how tread, carcass, compounds, and heat management affect grip.

## Overview

This project is built as a React + Vite single-page application with GSAP-powered motion and smooth scrolling. It is designed as a premium marketing narrative that feels more like an interactive article than a traditional landing page.

## Features

- Scroll-driven tyre anatomy storytelling
- Preloader sequence that reveals the tyre assembly process
- Multiple chapters with motion-driven text and data panels
- Interactive tyre variant comparison using a radar chart
- Smooth scroll interactions powered by Lenis and GSAP
- Responsive styling with Tailwind CSS

## Tech Stack

- React 19
- Vite
- GSAP and @gsap/react
- Lenis
- Tailwind CSS
- ESLint

## Project Structure

- `src/App.jsx` — main scroll narrative and chapter logic
- `src/Preloader.jsx` — animated tyre build-up preloader
- `src/SpecConfigurator.jsx` — tyre variant comparison panel
- `src/frameMap.js` — scroll frame mapping
- `src/useScrollSequence.js` — scroll-driven frame sequencing
- `src/index.css` — styling and motion behavior
- `public/` — static assets

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Notes

The app is intentionally animation-heavy and relies on browser rendering performance. If you are making visual changes, test them in a modern desktop browser first and then verify responsiveness across smaller screens.

## License

This project does not currently declare a license file. If you plan to distribute or reuse it, add a license before publishing.