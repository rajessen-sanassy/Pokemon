import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Spinner,
  Center,
  Badge,
} from '@chakra-ui/react';
import { getUserCollections, createCollection, getCollectionValue } from '../services/collectionService';
import { useAuth } from '../context/AuthContext';
import type { Collection } from '../types';

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionValues, setCollectionValues] = useState<Record<string, number>>({});
  const { user } = useAuth();

  useEffect(() => {
    async function loadCollections() {
      if (!user) return;
      
      setLoading(true);
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
        console.error('Error loading collections:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, [user]);

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg" mb={4}>Sign In Required</Heading>
        <Text mb={6}>You need to sign in to view and manage your collections.</Text>
        <Link to="/login">
          <Button colorScheme="blue">Sign In</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" mb={6}>
        <Heading>My Collections</Heading>
        <Link to="/search">
          <Button colorScheme="blue">
            Search Cards
          </Button>
        </Link>
      </Flex>

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : collections.length === 0 ? (
        <Box textAlign="center" py={10} borderWidth="1px" borderRadius="lg" bg="white">
          <Text fontSize="lg" mb={4}>You don't have any collections yet.</Text>
          <Text mb={6}>Start by searching for cards and adding them to a new collection.</Text>
          <Link to="/search">
            <Button colorScheme="blue">
              Search Cards
            </Button>
          </Link>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {collections.map((collection) => (
            <Link key={collection.id} to={`/collections/${collection.id}`}>
              <Box 
                p={5} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg="white"
                boxShadow="md"
                transition="transform 0.2s, box-shadow 0.2s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                height="100%"
              >
                <Flex direction="column" gap={2} height="100%">
                  <Heading size="md" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {collection.name}
                  </Heading>
                  
                  {collection.description && (
                    <Text fontSize="sm" color="gray.600" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {collection.description}
                    </Text>
                  )}
                  
                  <Flex>
                    <Badge colorScheme={collection.isPublic ? 'green' : 'gray'}>
                      {collection.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500" ml={2}>
                      Created: {new Date(collection.createdAt).toLocaleDateString()}
                    </Text>
                  </Flex>
                  
                  <Box mt="auto" pt={4} width="100%">
                    <Text fontWeight="bold" color="green.600">
                      Total Value: ${collectionValues[collection.id]?.toFixed(2) || '0.00'}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 