import { Box, Heading, Text, Button, SimpleGrid, Image, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg="pokemon.blue" 
        color="white" 
        py={12} 
        px={4} 
        borderRadius="lg" 
        mb={8}
        position="relative"
        overflow="hidden"
      >
        {/* Background pokeball pattern */}
        <Box 
          position="absolute" 
          top={0} 
          right={0} 
          width="300px" 
          height="300px" 
          opacity={0.1}
          backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')"
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          transform="rotate(30deg) translateX(100px)"
        />
        
        <Flex direction="column" gap={6} textAlign="center" maxW="800px" mx="auto" position="relative">
          <Heading size="2xl">Pokémon Card Collector</Heading>
          <Text fontSize="xl">
            Search for Pokémon cards, track prices across multiple stores, and manage your collection all in one place.
          </Text>
          <Flex gap={4} justify="center">
            <Link to="/search">
              <Button bg="pokemon.yellow" color="pokemon.darkBlue" size="lg" _hover={{ bg: "pokemon.lightYellow" }}>
                Search Cards
              </Button>
            </Link>
            {!user ? (
              <Link to="/register">
                <Button bg="white" color="pokemon.blue" size="lg" _hover={{ bg: "gray.100" }}>
                  Create Account
                </Button>
              </Link>
            ) : (
              <Link to="/collections">
                <Button bg="white" color="pokemon.blue" size="lg" _hover={{ bg: "gray.100" }}>
                  My Collections
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Features Section */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={10} mb={16}>
        <Box p={6} borderRadius="md" borderWidth="1px" bg="white" boxShadow="md" position="relative" overflow="hidden">
          <Box 
            position="absolute" 
            top={-10} 
            right={-10} 
            width="100px" 
            height="100px" 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
          />
          <Flex direction="column" align="start" gap={4}>
            <Heading size="md" color="pokemon.blue">Search Cards</Heading>
            <Text>
              Search for any Pokémon card and get detailed information including rarity, set, and market prices.
            </Text>
          </Flex>
        </Box>
        <Box p={6} borderRadius="md" borderWidth="1px" bg="white" boxShadow="md" position="relative" overflow="hidden">
          <Box 
            position="absolute" 
            top={-10} 
            right={-10} 
            width="100px" 
            height="100px" 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
          />
          <Flex direction="column" align="start" gap={4}>
            <Heading size="md" color="pokemon.blue">Track Prices</Heading>
            <Text>
              View price history charts from various stores like eBay, TCGPlayer, and more to make informed buying decisions.
            </Text>
          </Flex>
        </Box>
        <Box p={6} borderRadius="md" borderWidth="1px" bg="white" boxShadow="md" position="relative" overflow="hidden">
          <Box 
            position="absolute" 
            top={-10} 
            right={-10} 
            width="100px" 
            height="100px" 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
          />
          <Flex direction="column" align="start" gap={4}>
            <Heading size="md" color="pokemon.blue">Manage Collections</Heading>
            <Text>
              Create and manage your card collections, track their value, and share them with friends.
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* CTA Section */}
      {!user && (
        <Box 
          textAlign="center" 
          py={10} 
          px={6} 
          borderRadius="lg" 
          bg="gray.100" 
          mb={8} 
          position="relative"
          overflow="hidden"
        >
          <Box 
            position="absolute" 
            top="50%" 
            left="5%" 
            width="80px" 
            height="80px" 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
            transform="translateY(-50%)"
          />
          <Box 
            position="absolute" 
            top="50%" 
            right="5%" 
            width="80px" 
            height="80px" 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
            transform="translateY(-50%)"
          />
          <Heading size="lg" mb={4} color="pokemon.blue">
            Ready to start your collection?
          </Heading>
          <Link to="/register">
            <Button bg="pokemon.blue" color="white" size="lg" _hover={{ bg: "pokemon.darkBlue" }}>
              Sign Up Now
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
} 