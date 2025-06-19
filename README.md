# 🎮 Pokémon Card Collector 🎴

A web application for Pokémon card collectors to search, track, and manage their card collections. Keep tabs on your growing collection, track card values, and show off your rarest finds!

![Pokemon Card Collector](https://pokemon-liart-phi.vercel.app/pokemon-banner.jpg)

## ✨ Features

- **🔍 Card Search**: Find any Pokémon card with smart autocomplete - from vintage Base Set Charizards to the latest expansions
- **📊 Price Tracking**: Watch your collection value grow with interactive price history charts
- **📚 Collection Management**: Create custom binders to organize your cards by set, type, or whatever system makes sense to you
- **💰 Investment Tracking**: Track purchase prices and see your profit/loss over time
- **🌐 Community Collections**: Discover and browse other collectors' public binders for inspiration
- **📱 Responsive Design**: Looks great on everything from phones to desktops
- **🔒 Secure Authentication**: Your collection data is safe with Supabase authentication

## 🚀 Live Demo

Check out the live application at [https://pokemon-liart-phi.vercel.app/](https://pokemon-liart-phi.vercel.app/)

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript - for a fast, type-safe UI
- **UI Library**: Chakra UI - for beautiful, accessible components
- **API Integration**: Pokémon TCG API - for comprehensive card data
- **Backend & Auth**: Supabase - for database, authentication, and storage
- **Hosting**: Vercel - for seamless deployment and hosting
- **Build Tool**: Vite - for lightning-fast development

## 📊 Database Structure

The application uses Supabase (PostgreSQL) with the following main tables:

- **users**: User account information
- **profiles**: Extended user profile data
- **cards**: Pokémon card data cached from the TCG API
- **collections**: User-created binders/collections
- **collection_cards**: Junction table linking cards to collections with additional metadata

Key relationships:
- Users can have multiple collections
- Collections can contain multiple cards
- Cards store market price data for value tracking

## 🔌 API Integration

The app integrates with the [Pokémon TCG API](https://pokemontcg.io/) to fetch comprehensive card data including:
- Card images and details
- Set information
- Market prices

We cache this data in our Supabase database to:
- Reduce API calls
- Enable faster searches
- Allow for custom data like price history tracking

## 🏗️ Project Structure

```
─ public/              # Static assets
─ src/                 # Source code
  ├── components/      # Reusable UI components
  ├── context/         # React context providers (auth, etc.)
  ├── pages/           # Page components (Home, Search, Collections, etc.)
  ├── services/        # API and service functions
  ├── types/           # TypeScript type definitions
  ├── hooks/           # Custom React hooks
  ├── utils/           # Utility functions
  ├── App.tsx          # Main application component
  ├── main.tsx         # Application entry point
  └── index.css        # Global styles
─ supabase/            # Supabase configuration
─ index.html           # HTML entry point
─ package.json         # Dependencies and scripts
─ tsconfig.json        # TypeScript configuration
─ vite.config.ts       # Vite configuration
─ vercel.json          # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A Supabase account (free tier works great!)

### Installation

1. Clone the repository
```bash
git clone https://github.com/rajessen-sanassy/Pokemon.git
cd Pokemon
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

5. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready to be deployed to Vercel or your hosting provider of choice.

## 🧠 The Story Behind the App

This project started as a passion project for Pokémon card collectors who wanted a better way to track their growing collections. As collectors ourselves, we were frustrated with spreadsheets and wanted something more visual and interactive.

The app was built with a focus on:
- Beautiful, intuitive UI that makes managing collections fun
- Reliable data synchronization between the frontend and database
- Performance optimizations for handling large collections
- Community features to connect collectors

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Pokémon and Pokémon TCG are trademarks of Nintendo, Game Freak, and Creatures Inc.
- Thanks to the [Pokémon TCG API](https://pokemontcg.io/) for providing card data
- This project is for educational purposes only and is not affiliated with or endorsed by Nintendo or The Pokémon Company.
- Built with ❤️ by Pokémon fans, for Pokémon fans
