import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Flex,
  Heading,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  // Check if username is already taken
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim()) return true;
    
    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      // If no data is returned, the username is available
      return !data;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Check if email is already registered
  const checkEmailAvailability = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If there's no error when trying to send OTP to a non-existent user,
      // it means the user exists (we're not actually sending an OTP, just checking)
      return !!error;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !username) {
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
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if username is available
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        setError('Username is already taken. Please choose another one.');
        setIsLoading(false);
        return;
      }
      
      // Check if email is available
      const isEmailAvailable = await checkEmailAvailability(email);
      if (!isEmailAvailable) {
        setError('Email is already registered. Please use a different email or try to log in.');
        setIsLoading(false);
        return;
      }
      
      const { error } = await signUp(email, password, username);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Email is already registered. Please use a different email or try to log in.');
        } else {
        setError(error.message);
        }
      } else {
        // Redirect to verify email page instead of showing modal
        navigate('/verify-email', { 
          state: { 
            email,
            fromRegistration: true
          } 
        });
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        setError('Email is already registered. Please use a different email or try to log in.');
      } else {
      setError('An unexpected error occurred. Please try again.');
      }
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
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
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
                Username
              </Text>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                borderColor={!!error && !username ? "red.500" : undefined}
              />
              {!!error && !username && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  Username is required
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
              disabled={isLoading || isCheckingUsername}
              isLoading={isLoading || isCheckingUsername}
              loadingText={isCheckingUsername ? "Checking username..." : "Creating account..."}
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