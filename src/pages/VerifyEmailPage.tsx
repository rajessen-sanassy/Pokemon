import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    // If no email was provided in the state, redirect to login
    if (!email) {
      navigate('/login');
    }
    
    // Mark as sent if we came from registration
    if (location.state?.fromRegistration) {
      setEmailSent(true);
    }
  }, [email, navigate, location.state]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await resendVerificationEmail();
      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
        <Heading size="lg" textAlign="center">Verify Your Email</Heading>
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
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Verification Required</AlertTitle>
            <AlertDescription>
              We've sent a verification email to <strong>{email}</strong>.
              Please check your inbox and click the verification link to activate your account.
            </AlertDescription>
          </Box>
        </Alert>
        
        <Text mb={6}>
          If you don't see the email, check your spam folder or click the button below to resend the verification email.
        </Text>
        
        {emailSent && (
          <Alert status="success" mb={6} borderRadius="md">
            <AlertIcon />
            <Text>Verification email sent! Please check your inbox.</Text>
          </Alert>
        )}
        
        <Flex direction="column" gap={4}>
          <Button 
            colorScheme="blue" 
            onClick={handleResendEmail}
            isLoading={isLoading}
            loadingText="Sending..."
          >
            Resend Verification Email
          </Button>
          
          <Link to="/login">
            <Button variant="ghost" width="full">
              Back to Login
            </Button>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
} 