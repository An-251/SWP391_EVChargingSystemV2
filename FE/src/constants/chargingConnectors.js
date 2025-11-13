/**
 * ⚡ REAL CHARGING CONNECTOR STANDARDS
 * Data từ các chuẩn sạc quốc tế thực tế
 */

// ==================== CONNECTOR TYPES ====================

export const CONNECTOR_TYPES = {
  // DC Fast Charging
  CCS2: {
    id: 'CCS2',
    name: 'CCS2 (Combined Charging System)',
    type: 'DC',
    description: 'Chuẩn sạc nhanh phổ biến nhất ở Châu Âu và Việt Nam',
    maxPower: 350, // kW
    typical: 'Tesla, VinFast, Hyundai, Kia, BMW, Audi, Mercedes',
    icon: '🔌',
  },
  CCS1: {
    id: 'CCS1',
    name: 'CCS1 (Combined Charging System)',
    type: 'DC',
    description: 'Chuẩn sạc nhanh phổ biến ở Bắc Mỹ',
    maxPower: 350,
    typical: 'GM, Ford, BMW (US)',
    icon: '🔌',
  },
  CHAdeMO: {
    id: 'CHAdeMO',
    name: 'CHAdeMO',
    type: 'DC',
    description: 'Chuẩn sạc nhanh của Nhật Bản',
    maxPower: 100,
    typical: 'Nissan Leaf, Mitsubishi',
    icon: '⚡',
  },
  GB_T: {
    id: 'GB_T',
    name: 'GB/T (Chinese Standard)',
    type: 'DC',
    description: 'Chuẩn sạc của Trung Quốc',
    maxPower: 237.5,
    typical: 'BYD, NIO, Xpeng (China market)',
    icon: '🔋',
  },
  TESLA_SUPERCHARGER: {
    id: 'Tesla Supercharger',
    name: 'Tesla Supercharger',
    type: 'DC',
    description: 'Chuẩn sạc riêng của Tesla (Gen 3)',
    maxPower: 250,
    typical: 'Tesla (All models)',
    icon: '⚡',
  },

  // AC Charging
  TYPE2: {
    id: 'Type 2',
    name: 'Type 2 (Mennekes)',
    type: 'AC',
    description: 'Chuẩn sạc AC phổ biến ở Châu Âu',
    maxPower: 43, // kW (3-phase)
    typical: 'Hầu hết xe điện ở Châu Âu',
    icon: '🔌',
  },
  TYPE1: {
    id: 'Type 1',
    name: 'Type 1 (J1772)',
    type: 'AC',
    description: 'Chuẩn sạc AC phổ biến ở Bắc Mỹ',
    maxPower: 19.2, // kW (single-phase)
    typical: 'Nissan Leaf (US), Chevy Volt',
    icon: '🔌',
  },
  SCHUKO: {
    id: 'Schuko',
    name: 'Schuko (EU Plug)',
    type: 'AC',
    description: 'Ổ cắm điện thông thường (sạc chậm)',
    maxPower: 3.7,
    typical: 'Emergency charging',
    icon: '🔌',
  },
};

// ==================== CHARGING POWER LEVELS ====================

export const CHARGING_POWER_LEVELS = [
  {
    level: 'Level 1 - Slow Charging',
    power: 3.7, // kW
    voltage: '230V AC',
    connector: ['Schuko', 'Type 1'],
    time: '8-12 hours (full charge)',
    usage: 'Sạc qua đêm tại nhà',
  },
  {
    level: 'Level 2 - Normal Charging',
    power: 7.4, // kW
    voltage: '230V AC',
    connector: ['Type 2'],
    time: '4-6 hours (full charge)',
    usage: 'Sạc tại nhà, văn phòng',
  },
  {
    level: 'Level 2 - Fast AC',
    power: 22, // kW
    voltage: '400V AC 3-phase',
    connector: ['Type 2'],
    time: '2-3 hours (full charge)',
    usage: 'Sạc công cộng AC nhanh',
  },
  {
    level: 'DC Fast Charging',
    power: 50, // kW
    voltage: '400-500V DC',
    connector: ['CCS2', 'CHAdeMO'],
    time: '30-60 minutes (80%)',
    usage: 'Trạm sạc nhanh công cộng',
  },
  {
    level: 'DC Rapid Charging',
    power: 150, // kW
    voltage: '400-800V DC',
    connector: ['CCS2'],
    time: '15-25 minutes (80%)',
    usage: 'Trạm sạc siêu nhanh',
  },
  {
    level: 'DC Ultra-Fast Charging',
    power: 350, // kW
    voltage: '800V DC',
    connector: ['CCS2'],
    time: '10-18 minutes (80%)',
    usage: 'Trạm sạc Hyper-fast (Ionity, Tesla V3)',
  },
];

// ==================== PRICE RANGES BY POWER ====================

export const PRICE_RANGES = {
  'AC_SLOW': {
    minPower: 3.7,
    maxPower: 7.4,
    suggestedPrice: 2500, // VND/kWh
    description: 'Sạc AC chậm (Level 1-2)',
  },
  'AC_FAST': {
    minPower: 11,
    maxPower: 22,
    suggestedPrice: 3000,
    description: 'Sạc AC nhanh (Level 2)',
  },
  'DC_FAST': {
    minPower: 50,
    maxPower: 100,
    suggestedPrice: 3500,
    description: 'Sạc DC nhanh (50-100 kW)',
  },
  'DC_RAPID': {
    minPower: 120,
    maxPower: 180,
    suggestedPrice: 4000,
    description: 'Sạc DC siêu nhanh (120-180 kW)',
  },
  'DC_ULTRA': {
    minPower: 200,
    maxPower: 350,
    suggestedPrice: 4500,
    description: 'Sạc DC cực nhanh (200-350 kW)',
  },
};

/**
 * Get suggested price based on charging power
 */
export const getSuggestedPrice = (power) => {
  if (power <= 7.4) return PRICE_RANGES.AC_SLOW.suggestedPrice;
  if (power <= 22) return PRICE_RANGES.AC_FAST.suggestedPrice;
  if (power <= 100) return PRICE_RANGES.DC_FAST.suggestedPrice;
  if (power <= 180) return PRICE_RANGES.DC_RAPID.suggestedPrice;
  return PRICE_RANGES.DC_ULTRA.suggestedPrice;
};

/**
 * Get connector options for select dropdown
 */
export const getConnectorOptions = () => {
  return Object.values(CONNECTOR_TYPES).map(connector => ({
    value: connector.id,
    label: `${connector.icon} ${connector.name} (${connector.type}, max ${connector.maxPower}kW)`,
    description: connector.description,
    maxPower: connector.maxPower,
    type: connector.type,
  }));
};

/**
 * Get power level options for select dropdown
 */
export const getPowerLevelOptions = () => {
  return [
    { value: 3.7, label: '3.7 kW - Slow AC (Level 1)', price: 2500 },
    { value: 7.4, label: '7.4 kW - Normal AC (Level 2)', price: 2500 },
    { value: 11, label: '11 kW - Fast AC (3-phase)', price: 3000 },
    { value: 22, label: '22 kW - Rapid AC (3-phase)', price: 3000 },
    { value: 50, label: '50 kW - DC Fast Charging', price: 3500 },
    { value: 75, label: '75 kW - DC Fast Charging', price: 3500 },
    { value: 100, label: '100 kW - DC Fast Charging', price: 3500 },
    { value: 120, label: '120 kW - DC Rapid Charging', price: 4000 },
    { value: 150, label: '150 kW - DC Rapid Charging', price: 4000 },
    { value: 180, label: '180 kW - DC Rapid Charging', price: 4000 },
    { value: 200, label: '200 kW - DC Ultra-Fast', price: 4500 },
    { value: 250, label: '250 kW - DC Ultra-Fast', price: 4500 },
    { value: 350, label: '350 kW - DC Ultra-Fast (Max)', price: 4500 },
  ];
};

/**
 * Get compatible connectors for a given power level
 */
export const getCompatibleConnectors = (power) => {
  if (power <= 22) {
    return ['Type 2', 'Type 1', 'Schuko'];
  } else {
    return ['CCS2', 'CCS1', 'CHAdeMO', 'Tesla Supercharger', 'GB_T'];
  }
};

/**
 * ⭐ NEW: Get default power and price for a connector type
 * When user selects connector, auto-suggest typical power and price
 */
export const getDefaultPowerForConnector = (connectorType) => {
  const defaults = {
    // DC Fast Charging Connectors
    'CCS2': { 
      defaultPower: 150, // Most common: 150kW DC fast chargers
      minPower: 50, 
      maxPower: 350,
      suggestedPrice: 4000,
      description: 'Typical: 150kW DC Rapid Charging'
    },
    'CCS1': { 
      defaultPower: 150, 
      minPower: 50, 
      maxPower: 350,
      suggestedPrice: 4000,
      description: 'Typical: 150kW DC Rapid Charging'
    },
    'CHAdeMO': { 
      defaultPower: 50, // CHAdeMO typically 50kW
      minPower: 50, 
      maxPower: 100,
      suggestedPrice: 3500,
      description: 'Typical: 50kW DC Fast Charging'
    },
    'GB_T': { 
      defaultPower: 120, 
      minPower: 60, 
      maxPower: 237.5,
      suggestedPrice: 4000,
      description: 'Typical: 120kW DC Charging'
    },
    'Tesla Supercharger': { 
      defaultPower: 250, // Tesla V3 Supercharger
      minPower: 150, 
      maxPower: 250,
      suggestedPrice: 4500,
      description: 'Typical: 250kW Tesla V3'
    },
    
    // AC Charging Connectors
    'Type 2': { 
      defaultPower: 22, // 3-phase AC, most common
      minPower: 7.4, 
      maxPower: 43,
      suggestedPrice: 3000,
      description: 'Typical: 22kW AC 3-phase'
    },
    'Type 1': { 
      defaultPower: 7.4, // Single-phase AC
      minPower: 3.7, 
      maxPower: 19.2,
      suggestedPrice: 2500,
      description: 'Typical: 7.4kW AC single-phase'
    },
    'Schuko': { 
      defaultPower: 3.7, // Standard wall socket
      minPower: 2.3, 
      maxPower: 3.7,
      suggestedPrice: 2500,
      description: 'Typical: 3.7kW AC slow charging'
    },
  };

  return defaults[connectorType] || { 
    defaultPower: 50, 
    minPower: 3.7, 
    maxPower: 350,
    suggestedPrice: 3500,
    description: 'Select connector for suggestions'
  };
};

/**
 * ⭐ NEW: Get available power options for a specific connector
 * Returns only power levels compatible with selected connector
 */
export const getPowerOptionsForConnector = (connectorType) => {
  const allPowerOptions = getPowerLevelOptions();
  const connectorDefaults = getDefaultPowerForConnector(connectorType);
  
  // Filter power options within connector's range
  return allPowerOptions.filter(option => 
    option.value >= connectorDefaults.minPower && 
    option.value <= connectorDefaults.maxPower
  );
};

export default {
  CONNECTOR_TYPES,
  CHARGING_POWER_LEVELS,
  PRICE_RANGES,
  getSuggestedPrice,
  getConnectorOptions,
  getPowerLevelOptions,
  getCompatibleConnectors,
  getDefaultPowerForConnector, // ⭐ NEW
  getPowerOptionsForConnector, // ⭐ NEW
};
