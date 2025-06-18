# Pokémon Card Collector

A web application for searching Pokémon cards, tracking prices across different stores, and managing your card collection.

## Features

- **Search Cards**: Search for any Pokémon card and view detailed information
- **Price Tracking**: View price history charts from various stores like eBay, TCGPlayer, and more
- **Collection Management**: Create and manage your card collections
- **Collection Value**: Track the total value of your collections
- **User Authentication**: Create an account to save and manage your collections

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Library**: Chakra UI
- **Routing**: React Router
- **Charts**: Recharts
- **Backend/Auth**: Supabase

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pokemon-card-collector.git
   cd pokemon-card-collector
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
pokemon-card-collector/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and service functions
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── ...config files
```

## Database Schema

The application uses Supabase as the backend with the following tables:

- **users**: User accounts (managed by Supabase Auth)
- **collections**: Card collections created by users
- **collection_cards**: Cards added to collections with quantity and condition

## Future Enhancements

- Add real Pokemon card API integration
- Implement card filtering and sorting options
- Add user profiles and social features
- Enable collection sharing and trading features
- Implement card condition tracking and grading

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pokemon and Pokemon TCG are trademarks of Nintendo, Game Freak, and Creatures Inc.
- This project is for educational purposes only and is not affiliated with or endorsed by Nintendo or The Pokemon Company.
