import { useState, useEffect } from 'react';
import { Box, Heading, Text, Flex, Badge, Icon, useColorModeValue, Image, Skeleton } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaLock, FaLockOpen } from 'react-icons/fa';
import type { Collection } from '../types';
import { getCollectionCardPreviews } from '../services/collectionService';

interface CardPreview {
  id: string;
  name: string;
  image_url: string;
}

interface CollectionCardProps {
  collection: Collection;
  value?: string | number;
}

export function CollectionCard({ collection, value }: CollectionCardProps) {
  const location = useLocation();
  const isFromCommunity = location.pathname === '/community';
  const [cardPreviews, setCardPreviews] = useState<CardPreview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Colors for binder design
  const binderColor = useColorModeValue('#2D3748', '#1A202C'); // Darker, more saturated colors
  const binderInnerColor = useColorModeValue('#F7FAFC', '#2D3748');
  const pageColor = useColorModeValue('#FFFFFF', '#4A5568');
  const zipperColor = useColorModeValue('#A0AEC0', '#718096');
  
  useEffect(() => {
    const loadCardPreviews = async () => {
      try {
        const previews = await getCollectionCardPreviews(collection.id, 9);
        setCardPreviews(previews);
      } catch (error) {
        console.error('Failed to load card previews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCardPreviews();
  }, [collection.id]);
  
  return (
    <Link 
      to={`/collections/${collection.id}`} 
      state={{ from: isFromCommunity ? 'community' : 'collections' }}
    >
      <Box 
        position="relative"
        height="100%"
        minHeight="300px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        _hover={{ boxShadow: 'lg' }}
      >
        {/* Binder outer cover */}
        <Box 
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          right={0}
          bg={binderColor}
          borderRadius="lg"
        />
        
        {/* Binder binding */}
        <Box
          position="absolute"
          left="0"
          top={0}
          bottom={0}
          width="20px"
          bg={binderColor}
          borderRightWidth="3px"
          borderRightColor={zipperColor}
          zIndex={1}
        />
        
        {/* Binder rings */}
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            position="absolute"
            left="10px"
            top={`${25 + i * 25}%`}
            width="12px"
            height="12px"
            borderRadius="full"
            bg={zipperColor}
            zIndex={2}
            transform="translateY(-50%)"
            boxShadow="inset 0 0 2px rgba(0,0,0,0.3)"
          />
        ))}
        
        {/* Binder inner pages */}
        <Box
          position="absolute"
          top="10px"
          left="30px" // Move right to account for binding
          right="10px"
          bottom="10px"
          bg={binderInnerColor}
          borderRadius="md"
          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
        >
          {/* Card display area */}
          <Box
            position="relative"
            height="100%"
            width="100%"
            padding="10px"
          >
            {/* Main card layout with preview cards on the side */}
            <Flex 
              position="absolute" 
              top="50%" 
              left="50%" 
              transform="translate(-50%, -50%)" 
              width="90%" 
              height="80%" 
              zIndex={3}
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {/* Left side cards */}
              <Flex 
                direction="column" 
                height="80%" 
                width="20%" 
                gap={2}
                justifyContent="center"
              >
                {[1, 2].map((index) => (
                  <Box 
                    key={index} 
                    height="45%"
                    width="100%"
                  >
                    {loading ? (
                      <Skeleton height="100%" width="100%" borderRadius="sm" />
                    ) : cardPreviews[index] ? (
                      <Image
                        src={cardPreviews[index].image_url}
                        alt={cardPreviews[index].name}
                        objectFit="contain"
                        height="100%"
                        width="100%"
                        borderRadius="sm"
                        boxShadow="0 1px 2px rgba(0,0,0,0.1)"
                      />
                    ) : (
                      <Box
                        height="100%"
                        width="100%"
                        borderRadius="sm"
                        bg={pageColor}
                      />
                    )}
                  </Box>
                ))}
              </Flex>
              
              {/* Center featured card */}
              <Box
                width="50%"
                height="100%"
              >
                {loading ? (
                  <Skeleton height="100%" width="100%" borderRadius="md" />
                ) : cardPreviews[0] ? (
                  <Image
                    src={cardPreviews[0].image_url}
                    alt={cardPreviews[0].name}
                    objectFit="contain"
                    height="100%"
                    width="100%"
                    borderRadius="md"
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                  />
                ) : (
                  <Box
                    height="100%"
                    width="100%"
                    borderRadius="md"
                    bg={pageColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    <Icon as={FaBook} boxSize="40px" color="gray.300" />
                  </Box>
                )}
              </Box>
              
              {/* Right side cards */}
              <Flex 
                direction="column" 
                height="80%" 
                width="20%" 
                gap={2}
                justifyContent="center"
              >
                {[3, 4].map((index) => (
                  <Box 
                    key={index} 
                    height="45%"
                    width="100%"
                  >
                    {loading ? (
                      <Skeleton height="100%" width="100%" borderRadius="sm" />
                    ) : cardPreviews[index] ? (
                      <Image
                        src={cardPreviews[index].image_url}
                        alt={cardPreviews[index].name}
                        objectFit="contain"
                        height="100%"
                        width="100%"
                        borderRadius="sm"
                        boxShadow="0 1px 2px rgba(0,0,0,0.1)"
                      />
                    ) : (
                      <Box
                        height="100%"
                        width="100%"
                        borderRadius="sm"
                        bg={pageColor}
                      />
                    )}
                  </Box>
                ))}
              </Flex>
            </Flex>
          </Box>
        </Box>
        
        {/* Content overlay */}
        <Box 
          position="absolute"
          zIndex={4}
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0,0,0,0.75)"
          color="white"
          p={4}
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={2}>
              <Icon as={FaBook} color="white" />
              <Heading size="md" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {collection.name}
              </Heading>
            </Flex>
            
            <Badge 
              colorScheme={collection.isPublic ? 'green' : 'gray'}
              display="flex"
              alignItems="center"
            >
              <Icon 
                as={collection.isPublic ? FaLockOpen : FaLock} 
                boxSize="10px" 
                mr={1} 
              />
              {collection.isPublic ? 'PUBLIC' : 'PRIVATE'}
            </Badge>
          </Flex>
          
          <Text fontWeight="bold" color="green.300" mt={2}>
            Total Value: ${typeof value === 'number' ? value.toFixed(2) : '0.00'}
          </Text>
        </Box>
      </Box>
    </Link>
  );
} 