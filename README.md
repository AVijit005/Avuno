# Chronicle

> "A quiet place to remember every story you've lived."

Chronicle is a premium, beautifully crafted personal media tracking platform. It allows users to track their movies, books, games, anime, and podcasts in a single, unified library. Rather than just acting as a database, Chronicle functions as a "memory capsule," providing intelligent resurfacing, mood reflections, and dynamic journaling.

## Features

- **Universal Library:** Track movies, TV shows, anime, books, games, podcasts, and courses all in one place.
- **Intelligent Dashboard:** A beautifully designed dashboard that surfaces weekly reflections, living statistics, and quiet recommendations.
- **Collections & Taxonomies:** Build dynamic collections with cover galleries, heatmaps, and interconnected relationship maps.
- **Memory Insights:** View your lifetime statistics, completion graphs, and behavioral patterns using our proprietary analytics engine.
- **Journal & Timeline:** An immersive chronological feed of your cultural consumption, allowing for deep emotional reflection.

## Architecture & Tech Stack

Chronicle is a modern web application designed for both aesthetics and performance.

### Frontend
- **React 19** (Vite + TypeScript)
- **Routing:** `@tanstack/react-router`
- **State Management:** `@tanstack/react-query` (server state) and `zustand` (client state)
- **Styling:** TailwindCSS + Custom CSS Variables
- **Animations:** `motion/react` (Framer Motion)
- **Data Visualization:** `recharts` and `d3`

### Backend
- **Runtime:** NestJS 11
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Custom JWT stateless authentication (`jsonwebtoken`, `bcrypt`)
- **Security:** `helmet`, CORS, and rate limiting integration

## Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/chronicle.git
   cd chronicle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   Copy `.env.example` to `.env` in the root directory and update the `DATABASE_URL` and `JWT_SECRET`.

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development servers:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Contributing

We welcome contributions from the community. Please ensure that your pull requests align with the design aesthetics and architectural standards of the project.

## License

This project is proprietary and confidential.
