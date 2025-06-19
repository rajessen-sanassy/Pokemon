import { Box, Text, Badge, Tooltip, VStack, HStack, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { CardInCollection } from '../types';

interface CollectionCardItemProps {
  collectionCard: CardInCollection;
}

export function CollectionCardItem({ collectionCard }: CollectionCardItemProps) {
  const navigate = useNavigate();
  
  // Calculate percent change if both purchase price and current market price are available
  const purchasePrice = collectionCard.purchasePrice;
  const currentPrice = collectionCard.card?.marketPrice;
  
  let percentChange = 0;
  let isPositive = false;
  
  if (purchasePrice && currentPrice && purchasePrice > 0) {
    percentChange = ((currentPrice - purchasePrice) / purchasePrice) * 100;
    isPositive = percentChange >= 0;
  }
  
  // Format purchase date if available
  const purchaseDateFormatted = collectionCard.purchaseDate 
    ? new Date(collectionCard.purchaseDate).toLocaleDateString() 
    : 'N/A';

  // Get card rarity to display as badge
  const rarity = collectionCard.card?.rarity || '';
  
  // Handle card click to navigate with collection context
  const handleCardClick = () => {
    navigate(`/card/${collectionCard.cardId}`, {
      state: {
        fromCollection: true,
        collectionId: collectionCard.collectionId
      }
    });
  };

  return (
    <Box 
      position="relative" 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      bg="white" 
      boxShadow="md"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
      height="100%"
      display="flex"
      flexDirection="column"
      onClick={handleCardClick}
      cursor="pointer"
    >
      {/* Card Image */}
      <Box position="relative" flexShrink={0}>
        {collectionCard.card?.imageUrl && (
          <Image 
            src={collectionCard.card.imageUrl} 
            alt={collectionCard.card.name || 'Pokemon Card'} 
            width="100%"
            objectFit="contain"
            borderTopRadius="lg"
          />
        )}
        
        {/* Quantity Badge */}
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
          1
        </Box>
        
        {/* Rarity Badge */}
        {rarity && (
          <Badge 
            position="absolute" 
            bottom={2} 
            left={2} 
            colorScheme={getRarityColor(rarity)}
            fontSize="xs"
          >
            {rarity}
          </Badge>
        )}
      </Box>
      
      {/* Card Info */}
      <Box p={3} borderTopWidth="1px" flex="1" bg="gray.50">
        <VStack spacing={1} align="stretch">
          {/* Card Name */}
          <Text fontWeight="bold" fontSize="sm" noOfLines={1} mb={1}>
            {collectionCard.card?.name || 'Unknown Card'}
          </Text>
          
          {/* Set Name */}
          <Text fontSize="xs" color="gray.600" mb={1} noOfLines={1}>
            {collectionCard.card?.setName || ''} {collectionCard.card?.cardNumber || ''}
          </Text>
          
          {/* Purchase Info */}
          <HStack justify="space-between" fontSize="xs" mt={1}>
            <Tooltip label="Purchase Date" placement="top">
              <Text color="gray.600">
                {purchaseDateFormatted}
              </Text>
            </Tooltip>
            <Tooltip label="Purchase Price" placement="top">
              <Text fontWeight="medium">
                {purchasePrice ? `$${purchasePrice.toFixed(2)}` : 'N/A'}
              </Text>
            </Tooltip>
          </HStack>
          
          {/* Current Price and Change */}
          <HStack justify="space-between" fontSize="xs">
            <Tooltip label="Current Market Price" placement="bottom">
              <Text fontWeight="bold" color="green.600">
                {currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A'}
              </Text>
            </Tooltip>
            
            {purchasePrice && currentPrice && (
              <Tooltip label="Price Change Since Purchase" placement="bottom">
                <Badge colorScheme={isPositive ? 'green' : 'red'}>
                  {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                </Badge>
              </Tooltip>
            )}
          </HStack>
          
          {/* Condition */}
          {collectionCard.condition && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              {collectionCard.condition}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

// Helper function to determine badge color based on rarity
function getRarityColor(rarity: string): string {
  const rarityLower = rarity.toLowerCase();
  if (rarityLower.includes('common')) return 'gray';
  if (rarityLower.includes('uncommon')) return 'green';
  if (rarityLower.includes('rare') && !rarityLower.includes('ultra') && !rarityLower.includes('holo')) return 'blue';
  if (rarityLower.includes('holo')) return 'purple';
  if (rarityLower.includes('ultra')) return 'pink';
  if (rarityLower.includes('secret')) return 'red';
  if (rarityLower.includes('special')) return 'orange';
  if (rarityLower.includes('double')) return 'teal';
  return 'gray';
} 