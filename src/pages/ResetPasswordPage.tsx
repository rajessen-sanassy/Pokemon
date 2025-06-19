import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Text,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Flex direction="column" align="center" mb={6}>
        <Image 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
          alt="Pokeball" 
          boxSize="80px" 
          mb={4}
        />
        <Heading size="lg" textAlign="center">Reset Your Password</Heading>
      </Flex>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      
      <Box 
        p={6} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="md"
        bg="white"
      >
        {resetSent ? (
          <>
            <Alert status="success" mb={6} borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Password reset email sent!</Text>
                <Text>
                  We've sent instructions to reset your password to {email}.
                  Please check your inbox.
                </Text>
              </Box>
            </Alert>
            <Text mb={6}>
              If you don't see the email, check your spam folder or try again with a different email address.
            </Text>
            <Flex direction="column" gap={4}>
              <Button 
                colorScheme="blue" 
                onClick={() => setResetSent(false)}
              >
                Try Again
              </Button>
              <Link to="/login">
                <Button variant="ghost" width="full">
                  Back to Login
                </Button>
              </Link>
            </Flex>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Text mb={6}>
              Enter your email address below and we'll send you a link to reset your password.
            </Text>
            
            <FormControl isInvalid={!!error} mb={6}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
            
            <Flex direction="column" gap={4}>
              <Button 
                type="submit" 
                colorScheme="blue" 
                isLoading={loading}
                loadingText="Sending..."
              >
                Send Reset Link
              </Button>
              
              <Link to="/login">
                <Button variant="ghost" width="full">
                  Back to Login
                </Button>
              </Link>
            </Flex>
          </form>
        )}
      </Box>
    </Box>
  );
} 