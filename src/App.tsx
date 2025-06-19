import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CardDetailPage } from './pages/CardDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { CommunityCollectionsPage } from './pages/CommunityCollectionsPage';
import { AuthProvider } from './context/AuthContext';

// Pokemon-themed colors with dark theme
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
      blue: '#3B4CCA', // Keeping for backward compatibility
      darkBlue: '#0A285F', // Keeping for backward compatibility
      yellow: '#FFDE00',
      lightYellow: '#FFCC00',
      white: '#FFFFFF',
      black: '#121212',
      darkGray: '#1E1E1E',
      mediumGray: '#2D2D2D',
      lightGray: '#3D3D3D',
      accent: '#FFDE00', // Yellow as accent color
    },
    blue: {
      500: '#1E1E1E', // Changed to dark gray
      600: '#121212', // Changed to black
      700: '#121212', // Changed to black
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
          bg: 'pokemon.black',
          color: 'white',
          _hover: {
            bg: 'pokemon.darkGray',
          }
        },
        outline: {
          borderColor: 'pokemon.black',
          color: 'pokemon.black',
          _hover: {
            bg: 'pokemon.black',
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
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/collections" element={
                <ProtectedRoute>
                  <CollectionsPage />
                </ProtectedRoute>
              } />
              <Route path="/collections/:id" element={
                <ProtectedRoute>
                  <CollectionDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/community" element={<CommunityCollectionsPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
