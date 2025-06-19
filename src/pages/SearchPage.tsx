import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Input, 
  Button, 
  SimpleGrid, 
  Text,
  Spinner,
  Center,
  List,
  ListItem,
  InputGroup,
  InputRightElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Grid,
  GridItem,
  Checkbox,
  CheckboxGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Icon,
  IconButton,
  Badge
} from '@chakra-ui/react';
import { searchCards, getAutocompleteSuggestions } from '../services/pokemonCardApi';
import { PokemonCardItem } from '../components/PokemonCardItem';
import type { PokemonCard } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';

// Storage keys
const SEARCH_QUERY_KEY = 'pokemon_search_query';
const SEARCH_RESULTS_KEY = 'pokemon_search_results';
const SEARCH_TIMESTAMP_KEY = 'pokemon_search_timestamp';
const SEARCH_FILTERS_KEY = 'pokemon_search_filters';

// How long to keep search results in localStorage (1 hour)
const SEARCH_CACHE_DURATION = 60 * 60 * 1000;

// Define the filter interface
interface AdvancedFilters {
  cardType: string[];
  pokemonType: string[];
  stage: string[];
  rarity: string[];
  series: string[];
  minHP?: number;
  maxHP?: number;
  minPrice?: number;
  maxPrice?: number;
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [filters, setFilters] = useState<AdvancedFilters>({
    cardType: [],
    pokemonType: [],
    stage: [],
    rarity: [],
    series: []
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load saved search state on component mount
  useEffect(() => {
    // Only run this effect once on mount or when location changes
    const fromCardDetail = location.state?.fromCardDetail;
    
    // Check if there's a saved search in localStorage that's not expired
    const savedQuery = localStorage.getItem(SEARCH_QUERY_KEY);
    const savedResultsJson = localStorage.getItem(SEARCH_RESULTS_KEY);
    const savedTimestamp = localStorage.getItem(SEARCH_TIMESTAMP_KEY);
    const savedFiltersJson = localStorage.getItem(SEARCH_FILTERS_KEY);
    
    const isValidCache = savedTimestamp && 
      (Date.now() - parseInt(savedTimestamp)) < SEARCH_CACHE_DURATION;
    
    if (savedQuery && savedResultsJson && isValidCache) {
      try {
        const savedResults = JSON.parse(savedResultsJson);
        setSearchQuery(savedQuery);
        setCards(savedResults);
        setFilteredCards(savedResults);
        setSearched(true);
        
        if (savedFiltersJson) {
          const savedFilters = JSON.parse(savedFiltersJson);
          setFilters(savedFilters);
        }
        
        // If we're coming back from a card detail, scroll to the previous position
        if (fromCardDetail && location.state?.scrollPosition) {
          setTimeout(() => {
            window.scrollTo(0, location.state.scrollPosition);
          }, 100);
        }
      } catch (err) {
        console.error('Error parsing saved search results:', err);
        // Clear invalid cache
        localStorage.removeItem(SEARCH_RESULTS_KEY);
      }
    }
  }, [location.state?.fromCardDetail, location.state?.scrollPosition]);

  // Save search state when component unmounts or before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only save if we have search results
      if (cards.length > 0) {
        localStorage.setItem(SEARCH_QUERY_KEY, searchQuery);
        localStorage.setItem(SEARCH_RESULTS_KEY, JSON.stringify(cards));
        localStorage.setItem(SEARCH_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(SEARCH_FILTERS_KEY, JSON.stringify(filters));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when component unmounts
      handleBeforeUnload();
    };
  }, [searchQuery, cards, filters]);

  // Fetch autocomplete suggestions when the search query changes
  useEffect(() => {
    // Don't fetch suggestions if query is too short
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      try {
        const results = await getAutocompleteSuggestions(searchQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };
    
    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    
    // Only count non-empty arrays and defined number values
    if (filters.cardType.length > 0) count += 1;
    if (filters.pokemonType.length > 0) count += 1;
    if (filters.stage.length > 0) count += 1;
    if (filters.rarity.length > 0) count += 1;
    if (filters.series.length > 0) count += 1;
    if (filters.minHP !== undefined) count += 1;
    if (filters.maxHP !== undefined) count += 1;
    if (filters.minPrice !== undefined) count += 1;
    if (filters.maxPrice !== undefined) count += 1;
    
    setActiveFilters(count);
    
    // Apply filters whenever they change
    if (cards.length > 0) {
      applyFilters();
    }
  }, [filters]);

  // Apply filters to the current cards
  const applyFilters = () => {
    let results = [...cards];
    
    // Only apply filters if there are any active
    if (activeFilters > 0) {
      // Filter by card type
      if (filters.cardType.length > 0) {
        results = results.filter(card => {
          // Simple check based on card name and types
          // In a real app, you'd have more accurate data
          const isTrainer = card.name.toLowerCase().includes('trainer') || 
                           card.name.toLowerCase().includes('supporter') ||
                           card.name.toLowerCase().includes('stadium');
          const isEnergy = card.name.toLowerCase().includes('energy');
          const isPokemon = !isTrainer && !isEnergy;
          
          if (filters.cardType.includes('Pokémon') && isPokemon) return true;
          if (filters.cardType.includes('Trainer') && isTrainer) return true;
          if (filters.cardType.includes('Energy') && isEnergy) return true;
          
          return false;
        });
      }
      
      // Filter by Pokémon type
      if (filters.pokemonType.length > 0) {
        results = results.filter(card => {
          // If the card has types, check if any match the filter
          if (card.types && card.types.length > 0) {
            return filters.pokemonType.some(type => 
              card.types?.includes(type) || 
              card.types?.some(cardType => cardType.toLowerCase() === type.toLowerCase())
            );
          }
          // If no types, check the card name for type hints
          return filters.pokemonType.some(type => 
            card.name.toLowerCase().includes(type.toLowerCase())
          );
        });
      }
      
      // Filter by rarity
      if (filters.rarity.length > 0) {
        results = results.filter(card => 
          filters.rarity.some(rarity => 
            card.rarity?.toLowerCase().includes(rarity.toLowerCase())
          )
        );
      }
      
      // Filter by series/set
      if (filters.series.length > 0) {
        results = results.filter(card => 
          filters.series.some(series => 
            card.setName.toLowerCase().includes(series.toLowerCase())
          )
        );
      }
      
      // Filter by HP range
      if (filters.minHP !== undefined) {
        results = results.filter(card => {
          // Extract HP from the card name or other properties
          const hpMatch = card.name.match(/HP(\d+)/);
          const hp = hpMatch ? parseInt(hpMatch[1]) : 0;
          return hp >= (filters.minHP || 0);
        });
      }
      
      if (filters.maxHP !== undefined) {
        results = results.filter(card => {
          const hpMatch = card.name.match(/HP(\d+)/);
          const hp = hpMatch ? parseInt(hpMatch[1]) : 999;
          return hp <= (filters.maxHP || 999);
        });
      }
      
      // Filter by price range
      if (filters.minPrice !== undefined) {
        results = results.filter(card => 
          (card.marketPrice || 0) >= (filters.minPrice || 0)
        );
      }
      
      if (filters.maxPrice !== undefined) {
        results = results.filter(card => 
          (card.marketPrice || 0) <= (filters.maxPrice || 999999)
        );
      }
    }
    
    setFilteredCards(results);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && activeFilters === 0) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const results = await searchCards(searchQuery);
      setCards(results);
      
      // Apply any active filters to the search results
      if (activeFilters > 0) {
        // We'll set the cards first, then the useEffect will trigger applyFilters
        // which will update filteredCards
      } else {
        setFilteredCards(results);
      }
      
      setSearched(true);
      
      // Save search state to localStorage
      localStorage.setItem(SEARCH_QUERY_KEY, searchQuery);
      localStorage.setItem(SEARCH_RESULTS_KEY, JSON.stringify(results));
      localStorage.setItem(SEARCH_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(SEARCH_FILTERS_KEY, JSON.stringify(filters));
      
      // Close the filter drawer if it's open
      if (isOpen) onClose();
    } catch (err) {
      setError('Failed to search for cards. Please try again.');
      setCards([]);
      setFilteredCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleCardClick = (cardId: string) => {
    // Save scroll position before navigating to card detail
    navigate(`/card/${cardId}`, {
      state: { 
        fromCardDetail: false,
        scrollPosition: window.scrollY
      }
    });
  };

  const handleFilterChange = (category: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      cardType: [],
      pokemonType: [],
      stage: [],
      rarity: [],
      series: []
    });
    
    // Reset filtered cards to all cards
    setFilteredCards(cards);
  };

  const renderFilterDrawer = () => (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size={{ base: "full", md: "md" }}
      finalFocusRef={searchInputRef as React.RefObject<HTMLElement>}
    >
      <DrawerOverlay />
      <DrawerContent bg="white">
        <DrawerCloseButton 
          size="lg" 
          color="white" 
          bg="pokemon.black"
          _hover={{ bg: "pokemon.darkGray" }}
          borderRadius="full"
          position="absolute"
          top="3"
          right="3"
          zIndex={2}
        />
        <DrawerHeader bg="pokemon.black" color="white">Advanced Search</DrawerHeader>
        <DrawerBody p={0}>
          <Box p={4} bg="gray.50" borderBottom="1px" borderColor="gray.200">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">
                Filters
                {activeFilters > 0 && (
                  <Badge ml={2} colorScheme="yellow">{activeFilters}</Badge>
                )}
              </Text>
              <Button 
                size="md" 
                variant="outline" 
                leftIcon={<Icon as={FaTimes} boxSize="14px" />} 
                onClick={clearFilters}
                isDisabled={activeFilters === 0}
              >
                Clear All
              </Button>
            </Flex>
          </Box>
          
          <Box p={4} overflowY="auto" maxHeight="calc(100vh - 120px)">
            <Accordion defaultIndex={[0]} allowMultiple>
              {/* Card Type Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Card Type
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup 
                    colorScheme="yellow" 
                    value={filters.cardType}
                    onChange={(values) => handleFilterChange('cardType', values)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      <Checkbox value="Pokémon">Pokémon</Checkbox>
                      <Checkbox value="Trainer">Trainer</Checkbox>
                      <Checkbox value="Energy">Energy</Checkbox>
                      <Checkbox value="Item">Item</Checkbox>
                      <Checkbox value="Supporter">Supporter</Checkbox>
                      <Checkbox value="Stadium">Stadium</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Pokémon Type Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Pokémon Type
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup 
                    colorScheme="yellow" 
                    value={filters.pokemonType}
                    onChange={(values) => handleFilterChange('pokemonType', values)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      <Checkbox value="Grass">Grass</Checkbox>
                      <Checkbox value="Fire">Fire</Checkbox>
                      <Checkbox value="Water">Water</Checkbox>
                      <Checkbox value="Lightning">Lightning</Checkbox>
                      <Checkbox value="Psychic">Psychic</Checkbox>
                      <Checkbox value="Fighting">Fighting</Checkbox>
                      <Checkbox value="Darkness">Darkness</Checkbox>
                      <Checkbox value="Metal">Metal</Checkbox>
                      <Checkbox value="Fairy">Fairy</Checkbox>
                      <Checkbox value="Dragon">Dragon</Checkbox>
                      <Checkbox value="Colorless">Colorless</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Stage Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Stage
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup 
                    colorScheme="yellow" 
                    value={filters.stage}
                    onChange={(values) => handleFilterChange('stage', values)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      <Checkbox value="Basic">Basic</Checkbox>
                      <Checkbox value="Stage 1">Stage 1</Checkbox>
                      <Checkbox value="Stage 2">Stage 2</Checkbox>
                      <Checkbox value="VMAX">VMAX</Checkbox>
                      <Checkbox value="VSTAR">VSTAR</Checkbox>
                      <Checkbox value="V-UNION">V-UNION</Checkbox>
                      <Checkbox value="Mega">Mega Evolution</Checkbox>
                      <Checkbox value="BREAK">BREAK Evolution</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* HP Range Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      HP Range
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="sm">Min HP</FormLabel>
                        <NumberInput 
                          min={0} 
                          max={400} 
                          value={filters.minHP}
                          onChange={(valueString) => handleFilterChange('minHP', parseInt(valueString) || undefined)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="sm">Max HP</FormLabel>
                        <NumberInput 
                          min={0} 
                          max={400} 
                          value={filters.maxHP}
                          onChange={(valueString) => handleFilterChange('maxHP', parseInt(valueString) || undefined)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              {/* Rarity Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Rarity
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup 
                    colorScheme="yellow" 
                    value={filters.rarity}
                    onChange={(values) => handleFilterChange('rarity', values)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 2 }} spacing={2}>
                      <Checkbox value="Common">Common</Checkbox>
                      <Checkbox value="Uncommon">Uncommon</Checkbox>
                      <Checkbox value="Rare">Rare</Checkbox>
                      <Checkbox value="Holo Rare">Holo Rare</Checkbox>
                      <Checkbox value="Ultra Rare">Ultra Rare</Checkbox>
                      <Checkbox value="Secret Rare">Secret Rare</Checkbox>
                      <Checkbox value="Rainbow Rare">Rainbow Rare</Checkbox>
                      <Checkbox value="Amazing Rare">Amazing Rare</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Series Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Series
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup 
                    colorScheme="yellow" 
                    value={filters.series}
                    onChange={(values) => handleFilterChange('series', values)}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                      <Checkbox value="Scarlet & Violet">Scarlet & Violet</Checkbox>
                      <Checkbox value="Sword & Shield">Sword & Shield</Checkbox>
                      <Checkbox value="Sun & Moon">Sun & Moon</Checkbox>
                      <Checkbox value="XY">XY</Checkbox>
                      <Checkbox value="Black & White">Black & White</Checkbox>
                      <Checkbox value="HeartGold & SoulSilver">HeartGold & SoulSilver</Checkbox>
                      <Checkbox value="Diamond & Pearl">Diamond & Pearl / Platinum</Checkbox>
                      <Checkbox value="EX">EX</Checkbox>
                      <Checkbox value="WotC Era">WotC Era</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Price Range Section */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Price Range (USD)
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="sm">Min Price</FormLabel>
                        <NumberInput 
                          min={0} 
                          precision={2} 
                          value={filters.minPrice}
                          onChange={(valueString) => handleFilterChange('minPrice', parseFloat(valueString) || undefined)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontSize="sm">Max Price</FormLabel>
                        <NumberInput 
                          min={0} 
                          precision={2} 
                          value={filters.maxPrice}
                          onChange={(valueString) => handleFilterChange('maxPrice', parseFloat(valueString) || undefined)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            
            <Button
              mt={6}
              width="100%"
              colorScheme="yellow"
              onClick={() => applyFilters()}
              isLoading={loading}
              loadingText="Applying..."
            >
              Apply Filters
            </Button>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <Box>
      <Heading mb={6} color="pokemon.black">Search Pokémon Cards</Heading>
      
      <Box mb={8} position="relative">
        <Flex gap={2}>
          <InputGroup size="lg" flex={1}>
            <Input
              ref={searchInputRef}
              placeholder="Search for a Pokémon card..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              size="lg"
              bg="white"
              borderColor="pokemon.black"
              _hover={{ borderColor: 'pokemon.darkGray' }}
              _focus={{ borderColor: 'pokemon.black', boxShadow: '0 0 0 1px #121212' }}
            />
            <InputRightElement width="4.5rem">
              <Button 
                h="1.75rem" 
                size="sm"
                onClick={handleSearch}
                disabled={loading}
                bg="pokemon.black"
                color="white"
                _hover={{ bg: 'pokemon.darkGray' }}
                mr={2}
              >
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
          
          <IconButton
            aria-label="Advanced filters"
            icon={<FaFilter />}
            onClick={onOpen}
            bg="pokemon.black"
            color="white"
            _hover={{ bg: 'pokemon.darkGray' }}
            size="lg"
            position="relative"
          >
            {activeFilters > 0 && (
              <Badge 
                position="absolute" 
                top="-2px" 
                right="-2px" 
                colorScheme="yellow" 
                borderRadius="full"
                minW="20px"
              >
                {activeFilters}
              </Badge>
            )}
          </IconButton>
        </Flex>
        
        {showSuggestions && suggestions.length > 0 && (
          <Box 
            position="relative" 
            zIndex={10} 
            mt={1}
            width={{ base: "100%", md: "calc(100% - 56px)" }}
          >
            <List
              bg="white"
              boxShadow="md"
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              border="1px solid"
              borderColor="gray.200"
              position="absolute"
              top="0"
              left="0"
              right="0"
              width="100%"
            >
              {suggestions.map((suggestion, index) => (
                <ListItem 
                  key={index} 
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  borderBottom={index < suggestions.length - 1 ? "1px solid" : "none"}
                  borderColor="gray.100"
                >
                  {suggestion}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {showSuggestions && suggestions.length > 0 && <Box mt={10} />}
        
        <Text fontSize="sm" color="gray.500" mt={2}>
          Enter a Pokémon name, card set, or card number
        </Text>
        
        {activeFilters > 0 && (
          <Flex mt={2} align="center">
            <Text fontSize="sm" color="gray.600" fontWeight="medium" mr={2}>
              Active filters:
            </Text>
            <Badge colorScheme="yellow">{activeFilters}</Badge>
            <Button 
              size="xs" 
              variant="link" 
              onClick={clearFilters} 
              ml={2}
              color="pokemon.black"
            >
              Clear all
            </Button>
          </Flex>
        )}
      </Box>

      {error && (
        <Box mb={6} p={4} bg="red.100" color="red.800" borderRadius="md">
          {error}
        </Box>
      )}

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="pokemon.black" />
        </Center>
      ) : searched && filteredCards.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
          <Text fontSize="xl">No cards found. Try a different search term or adjust your filters.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
          {filteredCards.map((card) => (
            <Box key={card.id} onClick={() => handleCardClick(card.id)}>
              <PokemonCardItem card={card} />
            </Box>
          ))}
        </SimpleGrid>
      )}
      
      {renderFilterDrawer()}
    </Box>
  );
} 