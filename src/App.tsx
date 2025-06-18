import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CardDetailPage } from './pages/CardDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { AuthProvider } from './context/AuthContext';

// Pokemon-themed colors
const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%',
        overflowX: 'hidden', // Only hide horizontal overflow
      },
      '#root': {
        width: '100%',
        height: '100%',
        overflowX: 'hidden', // Only hide horizontal overflow
      },
    },
  },
  colors: {
    pokemon: {
      red: '#EE1515',
      blue: '#3B4CCA',
      yellow: '#FFDE00',
      darkBlue: '#0A285F',
      lightBlue: '#0075BE',
      lightYellow: '#FFCC00',
      white: '#FFFFFF',
      black: '#000000',
      gray: '#B3B3B3',
    },
    blue: {
      500: '#3B4CCA', // Pokemon blue
      600: '#0A285F', // Pokemon dark blue
      700: '#0A285F', // Pokemon dark blue
    },
    yellow: {
      500: '#FFDE00', // Pokemon yellow
    },
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
      variants: {
        solid: {
          bg: 'pokemon.blue',
          color: 'white',
          _hover: {
            bg: 'pokemon.darkBlue',
          }
        },
        outline: {
          borderColor: 'pokemon.blue',
          color: 'pokemon.blue',
          _hover: {
            bg: 'pokemon.blue',
            color: 'white',
          }
        },
      }
    },
    Container: {
      baseStyle: {
        maxW: '100%',
        px: { base: 4, md: 6 },
      }
    }
  }
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/card/:id" element={<CardDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
