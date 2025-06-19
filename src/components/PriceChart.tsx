import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Text, 
  Flex, 
  Button, 
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  SimpleGrid,
  Wrap,
  WrapItem,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { CardPrice } from '../types';

interface PriceChartProps {
  prices: CardPrice[];
}

// Define time spans for the chart
const TIME_SPANS = [
  { label: '7D', longLabel: '7 Days', days: 7 },
  { label: '14D', longLabel: '14 Days', days: 14 },
  { label: '30D', longLabel: '30 Days', days: 30 },
  { label: '90D', longLabel: '90 Days', days: 90 },
  { label: '1Y', longLabel: '1 Year', days: 365 },
  { label: '5Y', longLabel: '5 Years', days: 1825 },
  { label: '10Y', longLabel: '10 Years', days: 3650 },
  { label: 'All', longLabel: 'All Time', days: 10000 }, // Large number to include all data
];

// Define colors for each store
const STORE_COLORS = {
  'eBay': '#e53e3e',
  'TCGPlayer': '#3182ce',
  'CardMarket': '#38a169',
  'Troll and Toad': '#805ad5',
  'CoolStuffInc': '#dd6b20',
};

export function PriceChart({ prices }: PriceChartProps) {
  const [timeSpan, setTimeSpan] = useState<number>(14); // Default to 14 days
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [referenceLines, setReferenceLines] = useState<string[]>([]);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const buttonSize = useBreakpointValue({ base: "xs", md: "sm" });
  const chartHeight = useBreakpointValue({ base: 250, md: 300 });
  
  // Get all unique stores from the price data
  const allStores = [...new Set(prices.map(price => price.store))];
  
  // Initialize selected stores on component mount
  useEffect(() => {
    // Default to selecting all stores, but only run once when allStores changes
    if (allStores.length > 0 && selectedStores.length === 0) {
      setSelectedStores(allStores);
    }
  }, [allStores, selectedStores.length]);
  
  // Generate vertical reference lines based on the data
  const generateReferenceLines = useCallback((data: any[]) => {
    if (!data.length) {
      return [];
    }
    
    const lines: string[] = [];
    
    // For shorter time spans, show more reference lines
    if (timeSpan <= 30) {
      // Show every 3rd day
      for (let i = 0; i < data.length; i += 3) {
        lines.push(data[i].date);
      }
    } else if (timeSpan <= 90) {
      // Show weekly reference lines
      for (let i = 0; i < data.length; i += 7) {
        lines.push(data[i].date);
      }
    } else {
      // Show monthly reference lines
      const months: Record<string, boolean> = {};
      
      data.forEach(item => {
        const date = new Date(item.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!months[monthYear]) {
          months[monthYear] = true;
          lines.push(item.date);
        }
      });
    }
    
    // Always include the first and last date
    if (data.length > 0 && !lines.includes(data[0].date)) {
      lines.unshift(data[0].date);
    }
    
    if (data.length > 0 && !lines.includes(data[data.length - 1].date)) {
      lines.push(data[data.length - 1].date);
    }
    
    return lines;
  }, [timeSpan]);
  
  // Generate mock data for longer time periods
  const generateExtendedMockData = useCallback((existingPrices: CardPrice[], targetDays: number) => {
    if (!existingPrices.length) return [];
    
    // Group existing prices by store
    const storeData: Record<string, CardPrice[]> = {};
    existingPrices.forEach(price => {
      if (!storeData[price.store]) {
        storeData[price.store] = [];
      }
      storeData[price.store].push(price);
    });
    
    // Get the earliest date in the existing data
    const dates = existingPrices.map(p => new Date(p.date).getTime());
    const earliestDate = new Date(Math.min(...dates));
    
    // Calculate how many additional days we need to generate
    const today = new Date();
    const existingDays = Math.round((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
    const additionalDays = Math.max(0, targetDays - existingDays);
    
    // If we don't need additional data, return the existing prices
    if (additionalDays <= 0) {
      return existingPrices;
    }
    
    // Generate additional mock data for each store
    const newPrices: CardPrice[] = [...existingPrices];
    
    Object.entries(storeData).forEach(([store, prices]) => {
      if (!prices.length) return;
      
      // Get price range from existing data to make realistic fluctuations
      const priceValues = prices.map(p => p.price);
      const minPrice = Math.min(...priceValues) * 0.7; // Allow for some historical lows
      const maxPrice = Math.max(...priceValues) * 1.3; // Allow for some historical highs
      const priceRange = maxPrice - minPrice;
      
      // Get a sample price to use as reference
      const samplePrice = prices[0];
      
      // Generate data going back from the earliest date
      for (let i = 1; i <= additionalDays; i++) {
        const mockDate = new Date(earliestDate);
        mockDate.setDate(mockDate.getDate() - i);
        
        // Generate a realistic price with some randomness but following a trend
        // More distant dates have lower prices on average (cards tend to appreciate)
        const trendFactor = 1 - (i / (additionalDays * 2)); // Reduces price by up to 50% for oldest dates
        const randomFactor = 0.8 + (Math.random() * 0.4); // Random factor between 0.8 and 1.2
        const basePrice = minPrice + (priceRange * 0.5); // Middle of the price range
        const mockPrice = basePrice * trendFactor * randomFactor;
        
        newPrices.push({
          store: store,
          price: Number(mockPrice.toFixed(2)),
          date: mockDate.toISOString().split('T')[0],
          condition: samplePrice.condition,
        });
      }
    });
    
    return newPrices;
  }, []);
  
  // Process price data for the chart whenever dependencies change
  useEffect(() => {
    if (!prices.length || !selectedStores.length) {
      setChartData([]);
      setReferenceLines([]);
      return;
    }
    
    // Generate extended data for longer time periods if needed
    let dataToProcess = prices;
    if (timeSpan > 30) {
      dataToProcess = generateExtendedMockData(prices, timeSpan);
    }
    
    // Get today's date
    const today = new Date();
    
    // Calculate the start date based on the selected time span
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - timeSpan);
    
    // Filter prices by date and selected stores
    const filteredPrices = dataToProcess.filter(price => {
      const priceDate = new Date(price.date);
      return priceDate >= startDate && selectedStores.includes(price.store);
    });
    
    // Group prices by date
    const pricesByDate = filteredPrices.reduce((acc, price) => {
      if (!acc[price.date]) {
        acc[price.date] = { date: price.date };
      }
      acc[price.date][price.store] = price.price;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date
    const sortedData = Object.values(pricesByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setChartData(sortedData);
    
    // Generate reference lines (for vertical grid)
    const lines = generateReferenceLines(sortedData);
    setReferenceLines(lines);
  }, [prices, timeSpan, selectedStores, generateReferenceLines, generateExtendedMockData]);
  
  // Format date for display on x-axis
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (timeSpan > 365) {
      // For multi-year view, show year only
      return date.getFullYear().toString();
    } else if (timeSpan > 90) {
      // For year view, show month/year
      return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
    }
    
    // Default: show month/day
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Format date for tooltip
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format price for tooltip
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  // Calculate price statistics
  const calculateStats = () => {
    if (!chartData.length || !selectedStores.length) return null;
    
    const allPrices = chartData.flatMap(day => 
      selectedStores
        .filter(store => day[store] !== undefined)
        .map(store => day[store])
    );
    
    if (!allPrices.length) return null;
    
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const avg = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    
    return { min, max, avg };
  };
  
  const stats = calculateStats();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const gridColor = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Box>
      {/* Chart Controls */}
      <Flex 
        direction={{ base: "column", md: "row" }} 
        justify="space-between" 
        align={{ base: "stretch", md: "center" }}
        mb={4}
        gap={3}
      >
        {/* Time Span Selector */}
        <Box>
          <Text fontSize="sm" mb={1} fontWeight="medium">Time Range:</Text>
          <Wrap spacing={1}>
            {TIME_SPANS.map((span) => (
              <WrapItem key={span.days}>
                <Button
                  onClick={() => setTimeSpan(span.days)}
                  colorScheme={timeSpan === span.days ? "blue" : "gray"}
                  borderColor={timeSpan === span.days ? "pokemon.blue" : undefined}
                  size={buttonSize}
                  px={2}
                  title={span.longLabel}
                >
                  {span.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
        
        {/* Store Filter */}
        <Box>
          <Text fontSize="sm" mb={1} fontWeight="medium">Stores:</Text>
          <CheckboxGroup 
            colorScheme="blue" 
            value={selectedStores}
            onChange={(values) => setSelectedStores(values as string[])}
          >
            <SimpleGrid columns={{ base: 2, sm: 3, md: allStores.length }} spacing={2}>
              {allStores.map(store => (
                <Checkbox key={store} value={store} size={isMobile ? "sm" : "md"}>
                  <Flex align="center">
                    <Box 
                      w="10px" 
                      h="10px" 
                      borderRadius="full" 
                      bg={STORE_COLORS[store as keyof typeof STORE_COLORS] || 'gray.500'} 
                      mr={1} 
                    />
                    <Text fontSize={isMobile ? "xs" : "sm"} noOfLines={1}>
                      {store}
                    </Text>
                  </Flex>
                </Checkbox>
              ))}
            </SimpleGrid>
          </CheckboxGroup>
        </Box>
      </Flex>
      
      {/* Price Statistics */}
      {stats && (
        <Flex 
          mb={4} 
          gap={4} 
          justify="center" 
          bg={bgColor} 
          p={2} 
          borderRadius="md" 
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Stat label="Lowest" value={`$${stats.min.toFixed(2)}`} color="red.500" />
          <Stat label="Average" value={`$${stats.avg.toFixed(2)}`} color="blue.500" />
          <Stat label="Highest" value={`$${stats.max.toFixed(2)}`} color="green.500" />
        </Flex>
      )}
      
      {/* Price Chart */}
      <Box 
        height={chartHeight} 
        bg={bgColor} 
        p={isMobile ? 2 : 4} 
        borderRadius="lg" 
        borderWidth="1px"
        borderColor={borderColor}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: isMobile ? 5 : 20, left: isMobile ? 5 : 10, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={gridColor} 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="gray.500"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                stroke="gray.500"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                domain={['dataMin - 1', 'dataMax + 1']}
                width={isMobile ? 35 : 45}
              />
              <RechartsTooltip 
                formatter={formatPrice}
                labelFormatter={formatTooltipDate}
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                iconSize={isMobile ? 8 : 10}
              />
              
              {/* Vertical reference lines */}
              {referenceLines.map((date) => (
                <ReferenceLine 
                  key={date} 
                  x={date} 
                  stroke={gridColor}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              ))}
              
              {selectedStores.map((store) => (
                <Line
                  key={store}
                  type="monotone"
                  dataKey={store}
                  name={store}
                  stroke={STORE_COLORS[store as keyof typeof STORE_COLORS] || '#000'}
                  strokeWidth={isMobile ? 1.5 : 2}
                  dot={{ r: isMobile ? 2 : 3 }}
                  activeDot={{ r: isMobile ? 4 : 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Flex height="100%" align="center" justify="center">
            <Text color="gray.500">No price data available for the selected filters</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}

// Helper component for statistics
interface StatProps {
  label: string;
  value: string;
  color: string;
}

function Stat({ label, value, color }: StatProps) {
  return (
    <Tooltip label={`${label} price across selected time period`}>
      <Flex direction="column" align="center">
        <Text fontSize="xs" color="gray.500">{label}</Text>
        <Text fontWeight="bold" color={color}>{value}</Text>
      </Flex>
    </Tooltip>
  );
} 