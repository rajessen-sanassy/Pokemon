import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Input, 
  Button, 
  SimpleGrid, 
  Text,
  Spinner,
  Center,
  HStack,
  List,
  ListItem,
  Flex,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { searchCards, getAutocompleteSuggestions } from '../services/pokemonCardApi';
import { PokemonCardItem } from '../components/PokemonCardItem';
import type { PokemonCard } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

// Storage keys
const SEARCH_QUERY_KEY = 'pokemon_search_query';
const SEARCH_RESULTS_KEY = 'pokemon_search_results';
const SEARCH_TIMESTAMP_KEY = 'pokemon_search_timestamp';

// How long to keep search results in localStorage (1 hour)
const SEARCH_CACHE_DURATION = 60 * 60 * 1000;

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    
    const isValidCache = savedTimestamp && 
      (Date.now() - parseInt(savedTimestamp)) < SEARCH_CACHE_DURATION;
    
    if (savedQuery && savedResultsJson && isValidCache) {
      try {
        const savedResults = JSON.parse(savedResultsJson);
        setSearchQuery(savedQuery);
        setCards(savedResults);
        setSearched(true);
        
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
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when component unmounts
      handleBeforeUnload();
    };
  }, [searchQuery, cards]);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const results = await searchCards(searchQuery);
      setCards(results);
      setSearched(true);
      
      // Save search state to localStorage
      localStorage.setItem(SEARCH_QUERY_KEY, searchQuery);
      localStorage.setItem(SEARCH_RESULTS_KEY, JSON.stringify(results));
      localStorage.setItem(SEARCH_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      setError('Failed to search for cards. Please try again.');
      setCards([]);
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

  return (
    <Box>
      <Heading mb={6} color="pokemon.darkBlue">Search Pokémon Cards</Heading>
      
      <Box mb={8} position="relative">
        <InputGroup size="lg">
          <Input
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
            borderColor="pokemon.blue"
            _hover={{ borderColor: 'pokemon.darkBlue' }}
            _focus={{ borderColor: 'pokemon.darkBlue', boxShadow: '0 0 0 1px #0A285F' }}
          />
          <InputRightElement width="4.5rem">
            <Button 
              h="1.75rem" 
              size="sm"
              onClick={handleSearch}
              disabled={loading}
              bg="pokemon.blue"
              color="white"
              _hover={{ bg: 'pokemon.darkBlue' }}
              mr={2}
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
        
        {showSuggestions && suggestions.length > 0 && (
          <List
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            mt={1}
            zIndex={10}
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((suggestion, index) => (
              <ListItem 
                key={index} 
                p={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </ListItem>
            ))}
          </List>
        )}
        
        <Text fontSize="sm" color="gray.500" mt={2}>
          Enter a Pokémon name, card set, or card number
        </Text>
      </Box>

      {error && (
        <Box mb={6} p={4} bg="red.100" color="red.800" borderRadius="md">
          {error}
        </Box>
      )}

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="pokemon.blue" />
        </Center>
      ) : searched && cards.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
          <Text fontSize="xl">No cards found. Try a different search term.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
          {cards.map((card) => (
            <Box key={card.id} onClick={() => handleCardClick(card.id)}>
              <PokemonCardItem card={card} />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 