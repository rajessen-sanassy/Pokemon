import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spinner,
  Text,
  useBreakpointValue,
  Select,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Icon,
  Center,
} from '@chakra-ui/react';
import { getPublicCollectionsWithUserDetails, getCollectionValue } from '../services/collectionService';
import { CollectionCard } from '../components/CollectionCard';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FaUsers, FaBook } from 'react-icons/fa';
import type { Collection } from '../types';

export function CommunityCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [collectionValues, setCollectionValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const loadCollections = async () => {
    setLoading(true);
    try {
      const publicCollections = await getPublicCollectionsWithUserDetails();
      setCollections(publicCollections);
      setFilteredCollections(publicCollections);
      
      // Load collection values
      const values: Record<string, number> = {};
      for (const collection of publicCollections) {
        const value = await getCollectionValue(collection.id);
        values[collection.id] = value;
      }
      setCollectionValues(values);
    } catch (error) {
      console.error('Error loading public binders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    // Filter collections based on search query
    if (searchQuery.trim() === '') {
      setFilteredCollections(collections);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = collections.filter(
        collection => 
          collection.name.toLowerCase().includes(query) || 
          (collection.description && collection.description.toLowerCase().includes(query)) ||
          (collection.username && collection.username.toLowerCase().includes(query))
      );
      setFilteredCollections(filtered);
    }
  }, [searchQuery, collections]);

  const handleSearchClear = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collections/${collectionId}`, { state: { from: 'community' } });
  };

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value-high':
        return (collectionValues[b.id] || 0) - (collectionValues[a.id] || 0);
      case 'value-low':
        return (collectionValues[a.id] || 0) - (collectionValues[b.id] || 0);
      default:
        return 0;
    }
  });

  return (
    <Box>
      <Flex align="center" mb={6}>
        <Icon as={FaUsers} color="pokemon.darkBlue" mr={2} boxSize={6} />
        <Heading color="pokemon.darkBlue" size={{ base: "lg", md: "xl" }}>Community Binders</Heading>
      </Flex>
      
      {/* Search and Filter Controls */}
      <Flex 
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        mb={6}
        gap={4}
      >
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            ref={searchInputRef}
            placeholder="Search binders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
          />
          {searchQuery && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={handleSearchClear}
              />
            </InputRightElement>
          )}
        </InputGroup>
        
        <Flex gap={3} align="center" wrap="wrap" width={{ base: "100%", md: "auto" }}>
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            size="md" 
            width={{ base: "full", md: "auto" }}
            bg="white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name</option>
            <option value="value-high">Value (High to Low)</option>
            <option value="value-low">Value (Low to High)</option>
          </Select>
          
          <HStack width={{ base: "100%", md: "auto" }}>
            <Button 
              size="md" 
              variant={viewMode === 'grid' ? 'solid' : 'outline'} 
              onClick={() => setViewMode('grid')}
              colorScheme="blue"
              flex={{ base: 1, md: "auto" }}
            >
              Grid
            </Button>
            <Button 
              size="md" 
              variant={viewMode === 'table' ? 'solid' : 'outline'} 
              onClick={() => setViewMode('table')}
              colorScheme="blue"
              flex={{ base: 1, md: "auto" }}
            >
              Table
            </Button>
          </HStack>
        </Flex>
      </Flex>

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="pokemon.blue" />
        </Center>
      ) : sortedCollections.length === 0 ? (
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={{ base: 4, md: 8 }} 
          textAlign="center"
          bg="white"
          boxShadow="sm"
        >
          {searchQuery ? (
            <>
              <Text fontSize="lg" mb={4}>No binders match your search.</Text>
              <Button onClick={() => setSearchQuery('')} colorScheme="blue">
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <Icon as={FaBook} boxSize="50px" color="pokemon.blue" opacity={0.7} mb={4} />
              <Text fontSize="lg" mb={4}>No public binders are available.</Text>
              <Text mb={6}>Be the first to share your binder with the community!</Text>
              <Flex justify="center" gap={4} direction={{ base: "column", sm: "row" }}>
                <Link to="/collections" style={{ width: '100%' }}>
                  <Button 
                    colorScheme="blue"
                    width={{ base: "full", sm: "auto" }}
                  >
                    Go to My Binders
                  </Button>
                </Link>
              </Flex>
            </>
          )}
        </Box>
      ) : viewMode === 'grid' ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          {sortedCollections.map(collection => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
              value={collectionValues[collection.id] || 0}
            />
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
                <Th>Binder</Th>
                <Th>Owner</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Created</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedCollections.map((collection) => (
                <Tr 
                  key={collection.id} 
                  cursor="pointer" 
                  _hover={{ bg: "gray.50" }}
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <Td>
                    <Flex align="center">
                      <Icon as={FaBook} color="blue.500" mr={2} />
                      <Box>
                        <Text fontWeight="medium" noOfLines={1}>
                          {collection.name}
                        </Text>
                        {collection.description && (
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {collection.description}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center">
                      <Avatar 
                        size="xs" 
                        mr={2} 
                        src={collection.avatarUrl || undefined}
                        name={collection.username || 'User'}
                      />
                      <Text noOfLines={1}>
                        {collection.username || 'Anonymous User'}
                      </Text>
                    </Flex>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </Td>
                  <Td isNumeric fontWeight="bold" color="green.600">
                    ${(collectionValues[collection.id] || 0).toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
} 