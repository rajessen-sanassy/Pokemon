import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  GridItem,
  Stack,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Icon,
} from '@chakra-ui/react';
import { 
  getCollectionById, 
  getCollectionCards, 
  getCollectionValue, 
  deleteCollection, 
  removeCardFromCollection,
  duplicateCollection,
  toggleCollectionVisibility
} from '../services/collectionService';
import { CollectionCardItem } from '../components/CollectionCardItem';
import { useAuth } from '../context/AuthContext';
import { DeleteIcon, CopyIcon, LinkIcon, LockIcon, UnlockIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FaBook } from 'react-icons/fa';
import type { Collection, CardInCollection } from '../types';

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<CardInCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Share dialog
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const shareUrl = window.location.href;
  
  // Duplicate collection dialog
  const { isOpen: isDuplicateOpen, onOpen: onDuplicateOpen, onClose: onDuplicateClose } = useDisclosure();
  const [duplicateName, setDuplicateName] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // Delete card confirmation
  const { isOpen: isDeleteCardOpen, onOpen: onDeleteCardOpen, onClose: onDeleteCardClose } = useDisclosure();
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  
  // Layout settings
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Determine if we came from the community page
  const fromCommunity = location.state?.from === 'community';

  const loadCollection = async () => {
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
  };

  const loadCards = async () => {
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
  };

  useEffect(() => {
    if (id) {
      console.log('Collection ID changed, reloading data:', id);
      loadCollection();
      loadCards();
    }
  }, [id]);
  
  // Add another effect to reload data when the component mounts or when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        console.log('Window focused, refreshing collection data');
        loadCollection();
        loadCards();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

  const handleDeleteCard = async (cardId: string) => {
    setCardToDelete(cardId);
    onDeleteCardOpen();
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    
    try {
      const success = await removeCardFromCollection(cardToDelete);
      if (success) {
        setCards(cards.filter(card => card.id !== cardToDelete));
        toast({
          title: "Card removed",
          description: "The card has been removed from your collection.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh collection value
        if (id) {
          const value = await getCollectionValue(id);
          setTotalValue(value);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to remove the card from your collection.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error removing card:', error);
      toast({
        title: "Error",
        description: "An error occurred while removing the card.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCardToDelete(null);
      onDeleteCardClose();
    }
  };

  const handleDuplicateCollection = async () => {
    if (!id) return;
    
    setIsDuplicating(true);
    try {
      const newCollection = await duplicateCollection(
        id,
        duplicateName || undefined
      );
      
      if (newCollection) {
        toast({
          title: "Collection duplicated",
          description: "Your collection has been successfully duplicated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDuplicateClose();
        navigate(`/collections/${newCollection.id}`);
      } else {
        throw new Error("Failed to duplicate collection");
      }
    } catch (error) {
      console.error('Error duplicating collection:', error);
      toast({
        title: "Error",
        description: "There was a problem duplicating your collection.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!collection || !id) return;
    
    try {
      const updatedCollection = await toggleCollectionVisibility(id, !collection.isPublic);
      if (updatedCollection) {
        setCollection(updatedCollection);
        toast({
          title: updatedCollection.isPublic ? "Collection is now public" : "Collection is now private",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update collection visibility.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Collection link copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.card?.name || '').localeCompare(b.card?.name || '');
      case 'price-high':
        return (b.card?.marketPrice || 0) - (a.card?.marketPrice || 0);
      case 'price-low':
        return (a.card?.marketPrice || 0) - (b.card?.marketPrice || 0);
      case 'purchase-date':
        return new Date(b.purchaseDate || '').getTime() - new Date(a.purchaseDate || '').getTime();
      case 'profit':
        const profitA = a.card?.marketPrice && a.purchasePrice 
          ? a.card.marketPrice - a.purchasePrice : 0;
        const profitB = b.card?.marketPrice && b.purchasePrice 
          ? b.card.marketPrice - b.purchasePrice : 0;
        return profitB - profitA;
      default:
        return 0;
    }
  });

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
        <Heading size="lg">Binder Not Found</Heading>
        <Text mt={4}>The binder you're looking for doesn't exist or has been removed.</Text>
        <Link to={fromCommunity ? "/community" : "/collections"}>
          <Button mt={6} colorScheme="blue" leftIcon={<ArrowBackIcon />}>
            Back to {fromCommunity ? "Community" : "My Binders"}
          </Button>
        </Link>
      </Box>
    );
  }

  // Calculate total purchase value and profit
  const totalPurchaseValue = cards.reduce((sum, card) => sum + (card.purchasePrice || 0), 0);
  const totalProfit = totalValue - totalPurchaseValue;
  const totalProfitPercentage = totalPurchaseValue > 0 
    ? ((totalValue - totalPurchaseValue) / totalPurchaseValue) * 100 
    : 0;

  return (
    <Box>
      {/* Header Section */}
      <Stack 
        direction={{ base: "column", md: "row" }} 
        justify="space-between" 
        align={{ base: "flex-start", md: "center" }} 
        mb={6} 
        spacing={4}
      >
        <Box>
          <Link to={fromCommunity ? "/community" : "/collections"}>
            <Button 
              variant="outline" 
              size="sm" 
              mb={2}
              leftIcon={<ArrowBackIcon />}
              width={{ base: "full", sm: "auto" }}
            >
              Back to {fromCommunity ? "Community" : "My Binders"}
            </Button>
          </Link>
          <Flex align="center" wrap="wrap">
            <Flex align="center" mr={2}>
              <Icon as={FaBook} color="pokemon.blue" mr={2} />
              <Heading size={{ base: "lg", md: "xl" }}>{collection.name}</Heading>
            </Flex>
            <Badge colorScheme={collection.isPublic ? 'green' : 'gray'} alignSelf="center">
              {collection.isPublic ? 'Public' : 'Private'}
            </Badge>
          </Flex>
          {collection.description && (
            <Text color="gray.600" mt={2} fontSize="sm">
              {collection.description}
            </Text>
          )}
        </Box>
        
        <Stack direction={{ base: "row", md: "row" }} spacing={3} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }} width={{ base: "100%", md: "auto" }}>
        {isOwner && (
            <>
              <Tooltip label={collection.isPublic ? "Make private" : "Make public"}>
                <IconButton
                  aria-label={collection.isPublic ? "Make private" : "Make public"}
                  icon={collection.isPublic ? <LockIcon /> : <UnlockIcon />}
                  onClick={handleToggleVisibility}
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Duplicate binder">
                <IconButton
                  aria-label="Duplicate binder"
                  icon={<CopyIcon />}
                  onClick={onDuplicateOpen}
                  size="sm"
                />
              </Tooltip>
              
              <Button 
                colorScheme="red" 
                variant="outline" 
                onClick={handleDeleteCollection} 
                size="sm"
              >
                Delete Binder
              </Button>
            </>
          )}
          
          {collection.isPublic && (
            <Button
              leftIcon={<LinkIcon />}
              onClick={onShareOpen}
              size="sm"
              colorScheme="blue"
              flex={{ base: "1", md: "initial" }}
            >
              Share
          </Button>
        )}
        </Stack>
      </Stack>

      {/* Stats Section */}
      <Box 
        mb={6} 
        p={{ base: 3, md: 4 }} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="white"
        boxShadow="sm"
      >
        <Grid 
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={{ base: 3, md: 4 }}
        >
          <GridItem>
            <Text fontWeight="bold" fontSize="sm">Total Cards</Text>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">{cards.length}</Text>
          </GridItem>
          
          <GridItem>
            <Text fontWeight="bold" fontSize="sm">Current Value</Text>
            <Text 
              fontSize={{ base: "xl", md: "2xl" }} 
              fontWeight="bold"
              color="green.600"
            >
              ${totalValue.toFixed(2)}
            </Text>
          </GridItem>
          
          <GridItem>
            <Text fontWeight="bold" fontSize="sm">Purchase Value</Text>
            <Text 
              fontSize={{ base: "xl", md: "2xl" }} 
              fontWeight="bold"
              color="blue.600"
            >
              ${totalPurchaseValue.toFixed(2)}
            </Text>
          </GridItem>
          
          <GridItem>
            <Text fontWeight="bold" fontSize="sm">Profit/Loss</Text>
            <Flex align="baseline">
              <Text 
                fontSize={{ base: "xl", md: "2xl" }} 
                fontWeight="bold"
                color={totalProfit >= 0 ? "green.600" : "red.600"}
                mr={1}
              >
                ${totalProfit.toFixed(2)}
              </Text>
              <Text 
                fontSize="sm"
                fontWeight="medium" 
                color={totalProfit >= 0 ? "green.600" : "red.600"}
              >
                ({totalProfit >= 0 ? '+' : ''}{totalProfitPercentage.toFixed(1)}%)
              </Text>
        </Flex>
          </GridItem>
        </Grid>
      </Box>

      {/* Controls Section */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4}
        direction={{ base: "column", sm: "row" }}
        gap={3}
        width="100%"
      >
        <Select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          size="sm" 
          width={{ base: "full", sm: "auto" }}
          maxW={{ base: "full", sm: "200px" }}
          bg="white"
        >
          <option value="name">Sort by Name</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="purchase-date">Purchase Date</option>
          <option value="profit">Profit</option>
        </Select>
        
        <HStack width={{ base: "100%", sm: "auto" }}>
          <Button 
            size="sm" 
            variant={viewMode === 'grid' ? 'solid' : 'outline'} 
            onClick={() => setViewMode('grid')}
            colorScheme="blue"
            flex={{ base: 1, sm: "initial" }}
          >
            Grid
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'table' ? 'solid' : 'outline'} 
            onClick={() => setViewMode('table')}
            colorScheme="blue"
            flex={{ base: 1, sm: "initial" }}
          >
            Table
          </Button>
        </HStack>
      </Flex>

      {/* Cards Display Section */}
      {cardsLoading ? (
        <Center py={10}>
          <Spinner />
        </Center>
      ) : cards.length === 0 ? (
        <Box 
          textAlign="center" 
          py={10} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white"
          boxShadow="sm"
        >
          <Text fontSize="lg" mb={4}>This binder doesn't have any cards yet.</Text>
          {isOwner && (
            <Link to="/search">
              <Button colorScheme="blue">
                Search Cards to Add
              </Button>
            </Link>
          )}
        </Box>
      ) : viewMode === 'grid' ? (
        <SimpleGrid 
          columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }} 
          spacing={{ base: 2, md: 4 }}
        >
          {sortedCards.map((collectionCard) => (
            collectionCard.card && (
              <Box key={collectionCard.id} position="relative">
                <CollectionCardItem 
                  collectionCard={collectionCard} 
                />
                {isOwner && (
                  <IconButton
                    aria-label="Remove card"
                    icon={<DeleteIcon />}
                    size="xs"
                  position="absolute" 
                    top={1}
                    right={1}
                    colorScheme="red"
                    onClick={() => handleDeleteCard(collectionCard.id)}
                  />
                )}
              </Box>
            )
          ))}
        </SimpleGrid>
      ) : (
        <Box 
          overflowX="auto" 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white"
          boxShadow="sm"
        >
          <Table variant="simple" size={isMobile ? "sm" : "md"}>
            <Thead bg="gray.50">
              <Tr>
                <Th>Card</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Set</Th>
                <Th isNumeric>Purchase</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Date</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Condition</Th>
                <Th isNumeric>Current</Th>
                <Th isNumeric>Change</Th>
                {isOwner && <Th width="50px"></Th>}
              </Tr>
            </Thead>
            <Tbody>
              {sortedCards.map((card) => {
                const purchasePrice = card.purchasePrice || 0;
                const currentPrice = card.card?.marketPrice || 0;
                const change = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
                const isPositive = change >= 0;
                
                return (
                  <Tr key={card.id}>
                    <Td>
                      <Link to={`/card/${card.cardId}`}>
                        <Text fontWeight="medium" noOfLines={1}>
                          {card.card?.name}
                        </Text>
                      </Link>
                    </Td>
                    <Td display={{ base: "none", md: "table-cell" }}>
                      {card.card?.setName}
                    </Td>
                    <Td isNumeric>${purchasePrice.toFixed(2)}</Td>
                    <Td display={{ base: "none", md: "table-cell" }}>
                      {card.purchaseDate ? new Date(card.purchaseDate).toLocaleDateString() : 'N/A'}
                    </Td>
                    <Td display={{ base: "none", lg: "table-cell" }}>
                      {card.condition || 'N/A'}
                    </Td>
                    <Td isNumeric>${currentPrice.toFixed(2)}</Td>
                    <Td isNumeric>
                      <Text color={isPositive ? 'green.500' : 'red.500'} fontWeight="medium">
                        {isPositive ? '+' : ''}{change.toFixed(1)}%
                      </Text>
                    </Td>
                    {isOwner && (
                      <Td>
                        <IconButton
                          aria-label="Remove card"
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteCard(card.id)}
                        />
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>Share Binder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Share this link to your binder:</Text>
            <Flex>
              <Input value={shareUrl} isReadOnly />
              <Button ml={2} onClick={handleCopyShareLink}>Copy</Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onShareClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Duplicate Collection Modal */}
      <Modal isOpen={isDuplicateOpen} onClose={onDuplicateClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>Duplicate Binder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Create a copy of this binder with all the same cards.</Text>
            <Input
              placeholder={`${collection.name} (Copy)`}
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDuplicateClose} isDisabled={isDuplicating}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleDuplicateCollection}
              isLoading={isDuplicating}
              loadingText="Duplicating..."
            >
              Duplicate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Card Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteCardOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteCardClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={{ base: 4, md: 0 }}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Card
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove this card from your binder?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteCardClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteCard} ml={3}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
} 