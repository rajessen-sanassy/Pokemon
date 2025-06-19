import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();

  // Save the current path for redirects after login
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/reset-password' && currentPath !== '/verify-email') {
      localStorage.setItem('lastPath', currentPath);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    onClose();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const NavLinks = () => (
    <>
      <Link to="/search" onClick={isMobile ? onClose : undefined}>
        <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkGray' }} width={isMobile ? "full" : "auto"}>
          Search Cards
        </Button>
      </Link>
      <Link to="/community" onClick={isMobile ? onClose : undefined}>
        <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkGray' }} width={isMobile ? "full" : "auto"}>
          Community
        </Button>
      </Link>
      {user ? (
        <>
          <Link to="/collections" onClick={isMobile ? onClose : undefined}>
            <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkGray' }} width={isMobile ? "full" : "auto"}>
              My Binders
            </Button>
          </Link>
          
          {isMobile ? (
            <>
              <Link to="/profile" onClick={onClose}>
                <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkGray' }} width="full">
                  My Profile
                </Button>
              </Link>
              <Button 
                bg="pokemon.accent" 
                color="pokemon.black" 
                _hover={{ bg: 'pokemon.lightYellow' }} 
                onClick={handleSignOut}
                width="full"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bg="pokemon.accent"
                color="pokemon.black"
                _hover={{ bg: 'pokemon.lightYellow' }}
              >
                My Account
              </MenuButton>
              <MenuList bg="white">
                <Link to="/profile">
                  <MenuItem color="gray.800" _hover={{ bg: 'gray.100' }}>My Profile</MenuItem>
                </Link>
                <MenuItem onClick={handleSignOut} color="gray.800" _hover={{ bg: 'gray.100' }}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          )}
        </>
      ) : (
        <>
          <Link to="/login" onClick={isMobile ? onClose : undefined}>
            <Button variant="ghost" color="white" _hover={{ bg: 'pokemon.darkGray' }} width={isMobile ? "full" : "auto"}>
              Sign In
            </Button>
          </Link>
          <Link to="/register" onClick={isMobile ? onClose : undefined}>
            <Button 
              bg="pokemon.accent" 
              color="pokemon.black" 
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
      <Box as="header" bg="pokemon.black" color="white" py={4} px={6} boxShadow="md" width="100%">
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
                <Heading size={{ base: "md", md: "lg" }} noOfLines={1}>PokéBinder</Heading>
              </Flex>
            </Link>
            <Spacer />
            
            {isMobile ? (
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'pokemon.darkGray' }}
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
        <DrawerContent bg="pokemon.black" color="white">
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
      <Box as="footer" bg="pokemon.black" color="white" py={4} width="100%">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
            <Flex align="center" mb={{ base: 4, md: 0 }}>
              <Image 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Pokeball" 
                boxSize="30px" 
                mr={3}
              />
              <Heading size="sm">PokéBinder</Heading>
            </Flex>
            <Text fontSize="sm" textAlign="center">© {new Date().getFullYear()} PokéBinder. Not affiliated with Nintendo or The Pokémon Company.</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
} 