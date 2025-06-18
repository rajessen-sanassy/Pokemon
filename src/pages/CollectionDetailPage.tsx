import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Spinner,
  Center,
  Badge,
} from '@chakra-ui/react';
import { getCollectionById, getCollectionCards, getCollectionValue, deleteCollection } from '../services/collectionService';
import { PokemonCardItem } from '../components/PokemonCardItem';
import { useAuth } from '../context/AuthContext';
import type { Collection, CollectionCard } from '../types';

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCollection() {
      if (!id) return;
      
      setLoading(true);
      try {
        const collectionData = await getCollectionById(id);
        setCollection(collectionData);
        
        if (collectionData) {
          const value = await getCollectionValue(id);
          setTotalValue(value);
        }
      } catch (error) {
        console.error('Error loading collection:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [id]);

  useEffect(() => {
    async function loadCards() {
      if (!id) return;
      
      setCardsLoading(true);
      try {
        const collectionCards = await getCollectionCards(id);
        setCards(collectionCards);
      } catch (error) {
        console.error('Error loading collection cards:', error);
      } finally {
        setCardsLoading(false);
      }
    }

    loadCards();
  }, [id]);

  const handleDeleteCollection = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await deleteCollection(id);
      if (success) {
        navigate('/collections');
      } else {
        alert('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('An error occurred while deleting the collection');
    }
  };

  const isOwner = user && collection && user.id === collection.userId;

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!collection) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">Collection Not Found</Heading>
        <Text mt={4}>The collection you're looking for doesn't exist or has been removed.</Text>
        <Link to="/collections">
          <Button mt={6} colorScheme="blue">Back to Collections</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" mb={6}>
        <Box>
          <Link to="/collections">
            <Button variant="outline" size="sm" mb={2}>
              Back to Collections
            </Button>
          </Link>
          <Flex>
            <Heading>{collection.name}</Heading>
            <Badge colorScheme={collection.isPublic ? 'green' : 'gray'} ml={2} alignSelf="center">
              {collection.isPublic ? 'Public' : 'Private'}
            </Badge>
          </Flex>
          {collection.description && (
            <Text color="gray.600" mt={2}>
              {collection.description}
            </Text>
          )}
        </Box>
        
        {isOwner && (
          <Button colorScheme="red" variant="outline" onClick={handleDeleteCollection}>
            Delete Collection
          </Button>
        )}
      </Flex>

      <Box mb={8} p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Flex justify="space-between">
          <Box>
            <Text fontWeight="bold">Total Cards</Text>
            <Text fontSize="2xl">{cards.length}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Collection Value</Text>
            <Text fontSize="2xl" color="green.600">${totalValue.toFixed(2)}</Text>
          </Box>
        </Flex>
      </Box>

      {cardsLoading ? (
        <Center py={10}>
          <Spinner />
        </Center>
      ) : cards.length === 0 ? (
        <Box textAlign="center" py={10} borderWidth="1px" borderRadius="lg" bg="white">
          <Text fontSize="lg" mb={4}>This collection doesn't have any cards yet.</Text>
          {isOwner && (
            <Link to="/search">
              <Button colorScheme="blue">
                Search Cards to Add
              </Button>
            </Link>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
          {cards.map((collectionCard) => (
            collectionCard.card && (
              <Box key={collectionCard.id} position="relative">
                <PokemonCardItem card={collectionCard.card} />
                <Box 
                  position="absolute" 
                  top={2} 
                  right={2} 
                  bg="blue.500" 
                  color="white" 
                  borderRadius="full" 
                  width="24px" 
                  height="24px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {collectionCard.quantity}
                </Box>
              </Box>
            )
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 