import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Container, 
  Spacer, 
  Image, 
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { HamburgerIcon } from '@chakra-ui/icons';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    onClose();
  };

  const NavLinks = () => (
    <>
      <Link to="/search" onClick={isMobile ? onClose : undefined}>
        <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkBlue' }} width={isMobile ? "full" : "auto"}>
          Search Cards
        </Button>
      </Link>
      {user ? (
        <>
          <Link to="/collections" onClick={isMobile ? onClose : undefined}>
            <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkBlue' }} width={isMobile ? "full" : "auto"}>
              My Collections
            </Button>
          </Link>
          <Button 
            bg="pokemon.yellow" 
            color="pokemon.darkBlue" 
            _hover={{ bg: 'pokemon.lightYellow' }} 
            onClick={handleSignOut}
            width={isMobile ? "full" : "auto"}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={isMobile ? onClose : undefined}>
            <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkBlue' }} width={isMobile ? "full" : "auto"}>
              Sign In
            </Button>
          </Link>
          <Link to="/register" onClick={isMobile ? onClose : undefined}>
            <Button 
              bg="pokemon.yellow" 
              color="pokemon.darkBlue" 
              _hover={{ bg: 'pokemon.lightYellow' }}
              width={isMobile ? "full" : "auto"}
            >
              Register
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <Box 
      minH="100vh" 
      bg="gray.50" 
      display="flex" 
      flexDirection="column" 
      width="100%" 
      maxWidth="100vw" 
      overflowX="hidden"
    >
      <Box as="header" bg="pokemon.blue" color="white" py={4} px={6} boxShadow="md" width="100%">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Flex align="center">
            <Link to="/">
              <Flex align="center">
                <Image 
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                  alt="Pokeball" 
                  boxSize={{ base: "30px", md: "40px" }}
                  mr={2}
                />
                <Heading size={{ base: "md", md: "lg" }} noOfLines={1}>Pokémon Card Collector</Heading>
              </Flex>
            </Link>
            <Spacer />
            
            {isMobile ? (
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'pokemon.darkBlue' }}
                onClick={onOpen}
                size="lg"
              />
            ) : (
              <HStack spacing={4}>
                <NavLinks />
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>
      
      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="pokemon.blue" color="white">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Image 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Pokeball" 
                boxSize="30px" 
                mr={2}
              />
              <Text>Menu</Text>
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <NavLinks />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      <Container 
        maxW="container.xl" 
        py={8} 
        flex="1" 
        px={{ base: 4, md: 6 }}
        overflowY="auto"
      >
        {children}
      </Container>
      <Box as="footer" bg="pokemon.blue" color="white" py={4} width="100%">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
            <Flex align="center" mb={{ base: 4, md: 0 }}>
              <Image 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Pokeball" 
                boxSize="30px" 
                mr={3}
              />
              <Heading size="sm">Pokémon Card Collector</Heading>
            </Flex>
            <Text fontSize="sm" textAlign="center">© {new Date().getFullYear()} Pokémon Card Collector. Not affiliated with Nintendo or The Pokémon Company.</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
} 