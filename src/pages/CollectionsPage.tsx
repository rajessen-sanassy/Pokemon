import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Alert,
  AlertIcon,
  Icon,
} from '@chakra-ui/react';
import { FaPlus, FaSearch, FaFolderOpen } from 'react-icons/fa';
import { getUserCollections, getCollectionValue, createCollection } from '../services/collectionService';
import { useAuth } from '../context/AuthContext';
import { CollectionCard } from '../components/CollectionCard';

import type { Collection } from '../types';

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionValues, setCollectionValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // New collection form state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  // Check if we should open the create modal automatically
  useEffect(() => {
    if (location.state?.openCreateModal) {
      onOpen();
      // Clear the state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, onOpen]);

  const loadCollections = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
      
      setLoading(true);
    setError(null);
    
      try {
        const userCollections = await getUserCollections(user.id);
        setCollections(userCollections);
        
        // Load collection values
        const values: Record<string, number> = {};
        for (const collection of userCollections) {
          const value = await getCollectionValue(collection.id);
          values[collection.id] = value;
        }
        setCollectionValues(values);
      } catch (error) {
      console.error('Error loading binders:', error);
      setError('Failed to load binders. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const handleCreateCollection = async () => {
  if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a binder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    
    if (!newCollectionName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your binder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCreating(true);
    try {
      const newCollection = await createCollection(
        newCollectionName,
        newCollectionDescription,
        isPublic
      );

      if (newCollection) {
        setCollections(prev => [...prev, newCollection]);
        toast({
          title: "Binder created",
          description: "Your new binder has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setNewCollectionName('');
        setNewCollectionDescription('');
        setIsPublic(false);
        
        // If we came from a card detail page, go back to it
        if (location.state?.cardId) {
          navigate(`/card/${location.state.cardId}`);
        }
      }
    } catch (error: any) {
      console.error('Error creating binder:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem creating your binder.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Flex 
        justify="space-between" 
        align={{ base: "start", sm: "center" }} 
        mb={6} 
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 3, sm: 0 }}
      >
        <Heading color="pokemon.darkBlue" size={{ base: "lg", md: "xl" }}>My Binders</Heading>
        <Button 
          colorScheme="blue" 
          onClick={onOpen}
          leftIcon={<Icon as={FaPlus} />}
          size={{ base: "md", md: "md" }}
          width={{ base: "full", sm: "auto" }}
        >
          Create Binder
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="pokemon.blue" />
        </Center>
      ) : collections.length === 0 ? (
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={{ base: 4, md: 8 }} 
          textAlign="center"
          bg="white"
        >
          <Icon as={FaFolderOpen} boxSize="50px" color="pokemon.blue" opacity={0.7} mb={4} />
          <Text fontSize="lg" mb={4}>You don't have any binders yet.</Text>
          <Text mb={6}>Start by searching for cards and adding them to a new binder.</Text>
          <Flex justify="center" gap={4} direction={{ base: "column", sm: "row" }}>
            <Link to="/search" style={{ width: '100%' }}>
              <Button 
                colorScheme="blue" 
                width={{ base: "full", sm: "auto" }}
                leftIcon={<Icon as={FaSearch} />}
              >
                Search Cards
              </Button>
            </Link>
            <Button 
              variant="outline" 
              colorScheme="blue"
              onClick={onOpen}
              width={{ base: "full", sm: "auto" }}
              leftIcon={<Icon as={FaPlus} />}
            >
              Create Binder
            </Button>
          </Flex>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          {collections.map(collection => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
              value={collectionValues[collection.id] || 0}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Create Binder Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>Create New Binder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Binder Name</FormLabel>
              <Input 
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="My Pokémon Binder"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Describe your binder..."
                rows={3}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Make binder public
              </FormLabel>
              <Switch 
                isChecked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} disabled={creating}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateCollection}
              isLoading={creating}
              loadingText="Creating..."
              leftIcon={<Icon as={FaPlus} />}
            >
              Create Binder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 