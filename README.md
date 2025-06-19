# Pokémon Card Collector

A web application for Pokémon card collectors to search, track, and manage their card collections.

## Features

- **Card Search**: Search for Pokémon cards with autocomplete functionality
- **Price Tracking**: View price history across different stores with interactive charts
- **Collection Management**: Create collections and add cards to track your collection value
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Authentication**: User accounts with secure authentication via Supabase

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Library**: Chakra UI
- **API Integration**: Pokémon TCG API
- **Backend & Auth**: Supabase
- **Build Tool**: Vite

## Project Structure

```

─ public/              # Static assets
─ src/                 # Source code
  ├── components/      # Reusable UI components
  ├── context/         # React context providers
  ├── pages/           # Page components
  ├── services/        # API and service functions
  ├── types/           # TypeScript type definitions
  ├── App.tsx          # Main application component
  ├── main.tsx         # Application entry point
  └── index.css        # Global styles
─ index.html           # HTML entry point
─ package.json         # Dependencies and scripts
─ tsconfig.json        # TypeScript configuration
─ vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pokemon-card-collector.git
cd pokemon-card-collector
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- Pokemon and Pokemon TCG are trademarks of Nintendo, Game Freak, and Creatures Inc.
- This project is for educational purposes only and is not affiliated with or endorsed by Nintendo or The Pokemon Company.
