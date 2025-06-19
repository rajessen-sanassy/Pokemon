import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Flex,
  Heading,
  Text,
  Avatar,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  IconButton,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { EditIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export function ProfilePage() {
  const { user, updateUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchProfile = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      // Use the REST API directly to avoid TypeScript issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=username,avatar_url`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setUsername(data[0].username || '');
        setOriginalUsername(data[0].username || '');
        setAvatarUrl(data[0].avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, navigate]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
      
      // Update the user's profile with the avatar URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user!.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            avatar_url: avatarUrl
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      setAvatarUrl(avatarUrl);
      toast({
        title: 'Avatar updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message || 'Error uploading avatar');
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (username === originalUsername) {
      toast({
        title: 'No changes to save',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const { error } = await updateUsername(username);
      
      if (error) {
        throw error;
      }
      
      // Refresh the user data to ensure we have the latest information
      await fetchProfile();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading mb={6}>My Profile</Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
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
        <Flex direction="column" align="center" mb={6}>
          <Box position="relative" mb={4}>
            <Avatar 
              size="2xl" 
              src={avatarUrl || undefined}
              name={username}
              bg="pokemon.blue"
              color="white"
            />
            <IconButton
              aria-label="Change avatar"
              icon={<EditIcon />}
              size="sm"
              colorScheme="blue"
              isRound
              position="absolute"
              bottom={0}
              right={0}
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploading}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={uploadAvatar}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>
          <Text fontWeight="bold" fontSize="xl">{username}</Text>
          <Text color="gray.500">{user?.email}</Text>
        </Flex>
        
        <form onSubmit={handleUpdateProfile}>
          <FormControl mb={4}>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={saving}
            loadingText="Saving..."
            mb={4}
          >
            Save Changes
          </Button>
        </form>
        
        <Divider my={4} />
        
        <Flex direction="column" gap={4}>
          <Link to="/change-password">
            <Button
              leftIcon={<LockIcon />}
              width="full"
              variant="outline"
              colorScheme="blue"
            >
              Change Password
            </Button>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
} 