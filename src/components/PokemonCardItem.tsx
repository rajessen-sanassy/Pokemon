import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Image, 
  Text, 
  Badge, 
  Flex,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import type { PokemonCard } from '../types';

interface PokemonCardItemProps {
  card: PokemonCard;
}

export function PokemonCardItem({ card }: PokemonCardItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBorderColor = useColorModeValue('pokemon.blue', 'pokemon.yellow');
  
  // Get rarity color
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

  return (
    <Link to={`/card/${card.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        boxShadow={isHovered ? 'md' : 'sm'}
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-5px)',
          boxShadow: 'lg',
          borderColor: hoverBorderColor,
          bg: hoverBgColor,
        }}
        height="100%"
        display="flex"
        flexDirection="column"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        position="relative"
      >
        {/* Card Image */}
        <Box 
          position="relative" 
          paddingTop="138.5%" // Aspect ratio for Pokémon cards (2.5" x 3.5")
          overflow="hidden"
          bg="gray.100"
        >
          <Image
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            src={card.imageUrl}
            alt={card.name}
            objectFit="contain"
            loading="lazy"
            transition="transform 0.3s ease"
            transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
          />
        </Box>
        
        {/* Card Info */}
        <Flex 
          direction="column" 
          p={3} 
          flex="1" 
          borderTop="1px" 
          borderColor={borderColor}
        >
          <Tooltip label={card.name} placement="top">
            <Text 
              fontWeight="semibold" 
              fontSize="md" 
              noOfLines={1} 
              color="pokemon.darkBlue"
              mb={1}
            >
              {card.name}
            </Text>
          </Tooltip>
          
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="xs" color="gray.500">
              {card.setName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {card.cardNumber}
            </Text>
          </Flex>
          
          <Flex justify="space-between" align="center" mt="auto">
            <Badge colorScheme={getRarityColor(card.rarity)} fontSize="0.7em">
              {card.rarity}
            </Badge>
            
            {card.marketPrice !== null && card.marketPrice !== undefined && (
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color="green.600"
              >
                ${card.marketPrice.toFixed(2)}
              </Text>
            )}
          </Flex>
        </Flex>
        
        {/* Hover effect overlay */}
        {isHovered && (
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            borderRadius="lg" 
            borderWidth="2px" 
            borderColor="pokemon.blue" 
            pointerEvents="none" 
          />
        )}
      </Box>
    </Link>
  );
} 