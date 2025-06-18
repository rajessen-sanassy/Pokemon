import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/collections');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      maxW="md" 
      mx="auto" 
      mt={8} 
      p={8} 
      borderWidth={1} 
      borderRadius="lg" 
      boxShadow="lg"
      bg="white"
    >
      <Flex direction="column" gap={4}>
        <Heading>Sign In</Heading>
        
        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Flex direction="column" gap={4}>
            <Box>
              <Text as="label" fontWeight="medium" mb={1} display="block">
                Email
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                borderColor={!!error && !email ? "red.500" : undefined}
              />
              {!!error && !email && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Email is required
                </Text>
              )}
            </Box>
            
            <Box>
              <Text as="label" fontWeight="medium" mb={1} display="block">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                borderColor={!!error && !password ? "red.500" : undefined}
              />
              {!!error && !password && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Password is required
                </Text>
              )}
            </Box>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </Flex>
        </form>
        
        <Text>
          Don't have an account?{' '}
          <Link to="/register">
            <Text as="span" color="blue.500">
              Sign up
            </Text>
          </Link>
        </Text>
      </Flex>
    </Box>
  );
} 