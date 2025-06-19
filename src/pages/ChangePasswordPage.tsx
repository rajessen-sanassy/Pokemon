import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Image,
  InputGroup,
  InputRightElement,
  Flex,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await updatePassword(currentPassword, newPassword);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully changed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/profile');
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
        <Heading size="lg" textAlign="center">Change Your Password</Heading>
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
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <FormControl mb={6}>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <Flex direction="column" gap={4}>
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Password
            </Button>
            
            <Link to="/profile">
              <Button variant="ghost" width="full">
                Back to Profile
              </Button>
            </Link>
          </Flex>
        </form>
      </Box>
    </Box>
  );
} 