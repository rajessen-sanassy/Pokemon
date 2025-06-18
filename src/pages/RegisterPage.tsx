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

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/login');
        // In a real app, you might want to show a success message or automatically log the user in
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
        <Heading>Create Account</Heading>
        
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
                placeholder="Create a password"
                borderColor={!!error && !password ? "red.500" : undefined}
              />
              {!!error && !password && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Password is required
                </Text>
              )}
            </Box>
            
            <Box>
              <Text as="label" fontWeight="medium" mb={1} display="block">
                Confirm Password
              </Text>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                borderColor={!!error && (!confirmPassword || password !== confirmPassword) ? "red.500" : undefined}
              />
              {!!error && !confirmPassword && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Please confirm your password
                </Text>
              )}
              {!!error && confirmPassword && password !== confirmPassword && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Passwords do not match
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
              Create Account
            </Button>
          </Flex>
        </form>
        
        <Text>
          Already have an account?{' '}
          <Link to="/login">
            <Text as="span" color="blue.500">
              Sign in
            </Text>
          </Link>
        </Text>
      </Flex>
    </Box>
  );
} 