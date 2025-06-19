import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  Image, 
  Button, 
  Badge, 
  Spinner, 
  Center,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  useBreakpointValue,
  Stack,
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
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { getCardById, getCardPrices } from '../services/pokemonCardApi';
import { addCardToCollection, getUserCollections } from '../services/collectionService';
import { PriceChart } from '../components/PriceChart';
import { useAuth } from '../context/AuthContext';
import type { PokemonCard, CardPrice, Collection } from '../types';

// Helper function to determine badge color based on rarity
const getRarityColor = (rarity: string): string => {
  const rarityLower = rarity.toLowerCase();
  if (rarityLower.includes('common')) return 'gray';
  if (rarityLower.includes('uncommon')) return 'green';
  if (rarityLower.includes('rare') && !rarityLower.includes('ultra') && !rarityLower.includes('holo')) return 'blue';
  if (rarityLower.includes('holo')) return 'purple';
  if (rarityLower.includes('ultra')) return 'pink';
  if (rarityLower.includes('secret')) return 'red';
  return 'gray';
};

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [prices, setPrices] = useState<CardPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const { user } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [condition, setCondition] = useState<string>('Near Mint');
  const [notes, setNotes] = useState<string>('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  // Load card data
  useEffect(() => {
    async function loadCard() {
      if (!id) return;
      
      setLoading(true);
      try {
        const cardData = await getCardById(id);
        setCard(cardData);
      } catch (error) {
        console.error('Error loading card:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [id]);

  // Load price data
  useEffect(() => {
    async function loadPrices() {
      if (!id) return;
      
      setPricesLoading(true);
      try {
        const priceData = await getCardPrices(id);
        setPrices(priceData);
      } catch (error) {
        console.error('Error loading prices:', error);
      } finally {
        setPricesLoading(false);
      }
    }

    loadPrices();
  }, [id]);

  // Load user collections when modal opens
  const loadCollections = useCallback(async () => {
    if (!user || !user.id) return;
    
    setCollectionsLoading(true);
    try {
      const userCollections = await getUserCollections(user.id);
      setCollections(userCollections);
      if (userCollections.length > 0) {
        setSelectedCollection(userCollections[0].id);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  }, [user]);

  // Set current date as default purchase date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseDate(today);
    
    // Set current market price as default purchase price if available
    if (card?.marketPrice) {
      setPurchasePrice(card.marketPrice.toString());
    }
  }, [card]);

  // Handle back button navigation based on where user came from
  const handleBackNavigation = useCallback(() => {
    // Check if we came from a collection page
    if (location.state?.fromCollection) {
      const collectionId = location.state.collectionId;
      navigate(`/collections/${collectionId}`);
    } else {
      // Default to search page
    navigate('/search', {
      state: { 
        fromCardDetail: true,
        scrollPosition: location.state?.scrollPosition || 0
      }
    });
    }
  }, [navigate, location]);

  // Handle adding card to collection
  const handleAddToCollection = async () => {
    if (!id || !selectedCollection) return;
    
    setAddingToCollection(true);
    try {
      const success = await addCardToCollection(
        id,
        selectedCollection,
        purchasePrice ? parseFloat(purchasePrice) : undefined,
        purchaseDate || undefined,
        condition || undefined,
        notes || undefined
      );
      
      if (success) {
        toast({
          title: "Card added to collection",
          description: "The card has been successfully added to your collection.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: "Error adding card",
          description: "There was a problem adding this card to your collection.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error adding card to collection:', error);
      toast({
        title: "Error adding card",
        description: "There was a problem adding this card to your collection.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAddingToCollection(false);
    }
  };

  // Handle opening the add to collection modal
  const handleOpenAddToCollectionModal = () => {
    loadCollections();
    onOpen();
  };

  // Calculate current prices
  const currentPrices = prices
    .filter(price => {
      const today = new Date().toISOString().split('T')[0];
      return price.date === today;
    })
    .sort((a, b) => a.price - b.price);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="pokemon.blue" />
      </Center>
    );
  }

  if (!card) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">Card Not Found</Heading>
        <Text mt={4}>The card you're looking for doesn't exist or has been removed.</Text>
        <Button mt={6} colorScheme="blue" onClick={handleBackNavigation}>
          Back
        </Button>
      </Box>
    );
  }

  // Determine back button text based on where user came from
  const backButtonText = location.state?.fromCollection ? 'Back to Collection' : 'Back to Search';

  return (
    <Box>
      <Button 
        mb={4} 
        variant="outline" 
        leftIcon={<span>←</span>}
        onClick={handleBackNavigation}
      >
        {backButtonText}
      </Button>
      
      <Stack direction={{ base: 'column', lg: 'row' }} spacing={8} align="start">
        {/* Card Image and Info */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          bg="white" 
          p={{ base: 4, md: 6 }}
          boxShadow="md"
          maxW={{ base: "100%", lg: "350px" }}
          width="100%"
        >
          <Flex direction="column" align="center">
            <Image 
              src={card.imageUrl} 
              alt={card.name} 
              width="100%" 
              maxW="300px"
              borderRadius="md"
              boxShadow="lg"
              mb={6}
            />
            
            <Heading size="lg" color="pokemon.darkBlue" mb={4} textAlign="center">{card.name}</Heading>
            
            <Table variant="simple" size="sm" mb={4}>
              <Tbody>
                <Tr>
                  <Th>Set</Th>
                  <Td>{card.setName}</Td>
                </Tr>
                <Tr>
                  <Th>Number</Th>
                  <Td>{card.cardNumber}</Td>
                </Tr>
                <Tr>
                  <Th>Rarity</Th>
                  <Td>
                    <Badge colorScheme={getRarityColor(card.rarity)}>
                      {card.rarity}
                    </Badge>
                  </Td>
                </Tr>
                {card.marketPrice !== undefined && (
                  <Tr>
                    <Th>Market Price</Th>
                    <Td fontWeight="bold" color="green.600">
                      ${card.marketPrice?.toFixed(2)}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
            
            {user && (
              <Button 
                colorScheme="blue" 
                width="full"
                onClick={handleOpenAddToCollectionModal}
              >
                Add to Collection
              </Button>
            )}
          </Flex>
        </Box>
        
        {/* Price Information Section */}
        <Flex 
          direction="column" 
          flex={1} 
          width="100%"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          p={{ base: 4, md: 6 }}
          boxShadow="md"
        >
          <Heading size="md" mb={4} color="pokemon.darkBlue">Price History</Heading>
          
          {pricesLoading ? (
            <Center py={10}>
              <Spinner color="pokemon.blue" />
            </Center>
          ) : (
            <>
              {/* Current Prices Table */}
              <Box mb={6} overflowX="auto">
                <Heading size="sm" mb={3}>Current Prices by Store</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Store</Th>
                      <Th>Price</Th>
                      <Th>Condition</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentPrices.map((price, index) => (
                      <Tr key={index}>
                        <Td>{price.store}</Td>
                        <Td fontWeight="bold" color="green.600">${price.price.toFixed(2)}</Td>
                        <Td>{price.condition}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              <Divider my={4} />
              
              {/* Price Chart */}
              <Box mt={4}>
                <PriceChart prices={prices} />
              </Box>
            </>
          )}
        </Flex>
      </Stack>

      {/* Add to Collection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add {card.name} to Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {collectionsLoading ? (
              <Center py={4}>
                <Spinner color="pokemon.blue" />
              </Center>
            ) : collections.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Text mb={4}>You don't have any collections yet.</Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    onClose();
                    navigate('/collections', { 
                      state: { 
                        openCreateModal: true,
                        cardId: id  // Pass the card ID
                      }
                    });
                  }}
                >
                  Create a Collection
                </Button>
              </Box>
            ) : (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Collection</FormLabel>
                  <Select 
                    value={selectedCollection} 
                    onChange={(e) => setSelectedCollection(e.target.value)}
                  >
                    {collections.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Purchase Price</FormLabel>
                  <NumberInput 
                    value={purchasePrice} 
                    onChange={(value) => setPurchasePrice(value)}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Purchase Date</FormLabel>
                  <Input 
                    type="date" 
                    value={purchaseDate} 
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Condition</FormLabel>
                  <Select 
                    value={condition} 
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="Mint">Mint</option>
                    <option value="Near Mint">Near Mint</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Poor">Poor</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Input 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                  />
                </FormControl>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} disabled={addingToCollection}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddToCollection}
              isLoading={addingToCollection}
              loadingText="Adding..."
              disabled={collectionsLoading || collections.length === 0}
            >
              Add to Collection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 