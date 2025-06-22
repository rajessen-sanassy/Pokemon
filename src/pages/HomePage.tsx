import { Link } from 'react-router-dom';
import { Box, Heading, Text, Button, SimpleGrid, Flex, VStack, HStack, Icon } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaSearch, FaChartLine, FaFolderOpen } from 'react-icons/fa';

export function HomePage() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg="pokemon.black" 
        color="white" 
        py={{ base: 8, md: 12 }} 
        px={{ base: 3, md: 4 }} 
        borderRadius="lg" 
        mb={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background pokeball pattern */}
        <Box 
          position="absolute" 
          top={0} 
          right={0} 
          width={{ base: "150px", md: "300px" }} 
          height={{ base: "150px", md: "300px" }} 
          opacity={0.1}
          backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')"
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          transform="rotate(30deg) translateX(100px)"
        />
        
        <Flex direction="column" gap={{ base: 4, md: 6 }} textAlign="center" maxW="800px" mx="auto" position="relative">
          <Heading size={{ base: "xl", md: "2xl" }}>PokéBinder</Heading>
          <Text fontSize={{ base: "lg", md: "xl" }}>
            The ultimate TCG collection manager. Search cards, track prices, connect with collectors, and manage your binders all in one place.
          </Text>
          <Flex gap={4} justify="center" direction="column" px={{ base: 4, md: 0 }} maxW="400px" mx="auto" w="100%">
            <Link to="/search" style={{ width: '100%' }}>
              <Button 
                bg="pokemon.accent" 
                color="pokemon.black" 
                size="lg" 
                _hover={{ bg: "pokemon.lightYellow" }} 
                width="100%"
                leftIcon={<FaSearch />}
              >
                Search Cards
              </Button>
            </Link>
            <Link to="/community" style={{ width: '100%' }}>
              <Button 
                bg="pokemon.lightGray" 
                color="white" 
                size="lg" 
                _hover={{ bg: "pokemon.mediumGray" }} 
                width="100%"
                leftIcon={<FaUsers />}
              >
                Community
              </Button>
            </Link>
            {!user ? (
              <Link to="/register" style={{ width: '100%' }}>
                <Button 
                  bg="transparent" 
                  color="white" 
                  size="lg" 
                  _hover={{ bg: "pokemon.darkGray" }} 
                  width="100%"
                  variant="outline"
                  borderColor="white"
                >
                  Create Account
                </Button>
              </Link>
            ) : (
              <Link to="/collections" style={{ width: '100%' }}>
                <Button 
                  bg="transparent" 
                  color="white" 
                  size="lg" 
                  _hover={{ bg: "pokemon.darkGray" }} 
                  width="100%"
                  variant="outline"
                  borderColor="white"
                  leftIcon={<FaFolderOpen />}
                >
                  My Binders
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Features Section */}
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={{ base: 6, md: 6 }} mb={{ base: 10, md: 16 }}>
        <FeatureCard 
          title="Search Cards"
          description="Find any Pokémon card with detailed information on rarity, set, and market prices."
          imagePath="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
          icon={FaSearch}
        />
        <FeatureCard 
          title="Track Prices"
          description="View price history from eBay, TCGPlayer, and more for smarter collecting decisions."
          imagePath="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png"
          icon={FaChartLine}
          />
        <FeatureCard 
          title="Manage Binders"
          description="Organize your collection into digital binders and track their total value."
          imagePath="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
          icon={FaFolderOpen}
        />
        <FeatureCard 
          title="Join Community"
          description="Connect with fellow collectors, discover rare cards, and share your prized binders."
          imagePath="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/friend-ball.png"
          icon={FaUsers}
        />
      </SimpleGrid>

      {/* Community Highlight Section */}
      <Box 
        textAlign="center" 
        py={{ base: 8, md: 10 }} 
        px={{ base: 4, md: 6 }} 
        borderRadius="lg" 
        bg="pokemon.black" 
        color="white"
        mb={{ base: 6, md: 8 }} 
        position="relative"
        overflow="hidden"
      >
          <Box 
            position="absolute" 
          top="50%" 
          left="5%" 
          width={{ base: "60px", md: "80px" }} 
          height={{ base: "60px", md: "80px" }} 
            opacity={0.1}
          backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png')" // Lucario
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
          transform="translateY(-50%)"
          display={{ base: "none", md: "block" }}
        />
          <Box 
            position="absolute" 
          top="50%" 
          right="5%" 
          width={{ base: "60px", md: "80px" }} 
          height={{ base: "60px", md: "80px" }} 
            opacity={0.1}
          backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png')" // Mewtwo
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
          transform="translateY(-50%)"
          display={{ base: "none", md: "block" }}
        />
        <Heading size={{ base: "md", md: "lg" }} mb={4}>
          Join Our Growing Community of Collectors
        </Heading>
        <Text fontSize={{ base: "sm", md: "md" }} mb={6} maxW="700px" mx="auto">
          Discover amazing collections, share your rare finds, and connect with fellow Pokémon TCG enthusiasts. 
          Our community features help you showcase your best cards and get inspired by others.
        </Text>
        <Box maxW="400px" mx="auto" w="100%">
          <Link to="/community" style={{ width: '100%' }}>
            <Button 
              bg="pokemon.accent" 
              color="pokemon.black" 
              size="lg" 
              _hover={{ bg: "pokemon.lightYellow" }}
              leftIcon={<FaUsers />}
              width="100%"
            >
              Explore Community
            </Button>
          </Link>
        </Box>
      </Box>

      {/* CTA Section */}
      {!user && (
        <Box 
          textAlign="center" 
          py={{ base: 8, md: 10 }} 
          px={{ base: 4, md: 6 }} 
          borderRadius="lg" 
          bg="pokemon.darkGray" 
          color="white"
          mb={{ base: 6, md: 8 }} 
          position="relative"
          overflow="hidden"
        >
          <Box 
            position="absolute" 
            top="50%" 
            left="5%" 
            width={{ base: "60px", md: "80px" }} 
            height={{ base: "60px", md: "80px" }} 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
            transform="translateY(-50%)"
            display={{ base: "none", md: "block" }}
          />
          <Box 
            position="absolute" 
            top="50%" 
            right="5%" 
            width={{ base: "60px", md: "80px" }} 
            height={{ base: "60px", md: "80px" }} 
            opacity={0.1}
            backgroundImage="url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
            transform="translateY(-50%)"
            display={{ base: "none", md: "block" }}
          />
          <Heading size={{ base: "md", md: "lg" }} mb={4}>
            Ready to start your PokéBinder?
          </Heading>
          <Box maxW="400px" mx="auto" w="100%">
            <Link to="/register" style={{ width: '100%' }}>
              <Button 
                bg="pokemon.accent" 
                color="pokemon.black" 
                size="lg" 
                _hover={{ bg: "pokemon.lightYellow" }}
                width="100%"
              >
                Sign Up Now
              </Button>
            </Link>
          </Box>
        </Box>
      )}

      {/* Attribution */}
      <Box textAlign="center" py={4} opacity={0.6}>
        <Text fontSize="xs">Sponsored by Big Bunda Bains</Text>
      </Box>
    </Box>
  );
}

// Feature Card Component
function FeatureCard({ 
  title, 
  description, 
  imagePath, 
  icon 
}: { 
  title: string; 
  description: string; 
  imagePath: string;
  icon: any;
}) {
  return (
    <Box 
      p={{ base: 5, md: 6 }} 
      borderRadius="md" 
      borderWidth="1px" 
      bg="white" 
      boxShadow="md" 
      position="relative" 
      overflow="hidden"
      height="100%"
    >
      <Box 
        position="absolute" 
        top={-10} 
        right={-10} 
        width="100px" 
        height="100px" 
        opacity={0.1}
        backgroundImage={`url('${imagePath}')`}
        backgroundSize="contain"
        backgroundRepeat="no-repeat"
      />
      <VStack align="start" spacing={4} height="100%">
        <HStack>
          <Icon as={icon} color="pokemon.black" boxSize={5} />
          <Heading size="md" color="pokemon.black">{title}</Heading>
        </HStack>
        <Text>{description}</Text>
      </VStack>
    </Box>
  );
} 