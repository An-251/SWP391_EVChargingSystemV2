/**
 * 🚗 REAL ELECTRIC VEHICLE DATA
 * Data từ các nhà sản xuất xe điện thực tế (2024-2025)
 */

// ==================== VEHICLE BRANDS & MODELS ====================

export const EV_BRANDS = {
  TESLA: 'Tesla',
  BYD: 'BYD',
  VINFAST: 'VinFast',
  HYUNDAI: 'Hyundai',
  KIA: 'Kia',
  BMW: 'BMW',
  AUDI: 'Audi',
  MERCEDES: 'Mercedes-Benz',
  NISSAN: 'Nissan',
  CHEVROLET: 'Chevrolet',
  VOLKSWAGEN: 'Volkswagen',
  PORSCHE: 'Porsche',
  MG: 'MG',
  PEUGEOT: 'Peugeot',
};

/**
 * Real EV models with actual battery capacity and connector types
 * Source: Manufacturer specifications 2024-2025
 */
export const EV_MODELS = [
  // TESLA
  {
    brand: 'Tesla',
    model: 'Model 3 Standard Range',
    batteryCapacity: 60, // kWh
    connectorType: 'CCS2',
    maxChargingPower: 170, // kW
    range: 491, // km (WLTP)
  },
  {
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    batteryCapacity: 75,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 629,
  },
  {
    brand: 'Tesla',
    model: 'Model 3 Performance',
    batteryCapacity: 75,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 567,
  },
  {
    brand: 'Tesla',
    model: 'Model Y Long Range',
    batteryCapacity: 75,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 533,
  },
  {
    brand: 'Tesla',
    model: 'Model Y Performance',
    batteryCapacity: 75,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 514,
  },
  {
    brand: 'Tesla',
    model: 'Model S Long Range',
    batteryCapacity: 100,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 634,
  },
  {
    brand: 'Tesla',
    model: 'Model X Long Range',
    batteryCapacity: 100,
    connectorType: 'CCS2',
    maxChargingPower: 250,
    range: 543,
  },

  // BYD
  {
    brand: 'BYD',
    model: 'Atto 3',
    batteryCapacity: 60.48,
    connectorType: 'CCS2',
    maxChargingPower: 88,
    range: 420,
  },
  {
    brand: 'BYD',
    model: 'Dolphin',
    batteryCapacity: 60.48,
    connectorType: 'CCS2',
    maxChargingPower: 60,
    range: 427,
  },
  {
    brand: 'BYD',
    model: 'Seal',
    batteryCapacity: 82.56,
    connectorType: 'CCS2',
    maxChargingPower: 150,
    range: 570,
  },
  {
    brand: 'BYD',
    model: 'Han EV',
    batteryCapacity: 85.44,
    connectorType: 'CCS2',
    maxChargingPower: 120,
    range: 605,
  },

  // VINFAST
  {
    brand: 'VinFast',
    model: 'VF 5 Plus',
    batteryCapacity: 37.23,
    connectorType: 'CCS2',
    maxChargingPower: 70,
    range: 326,
  },
  {
    brand: 'VinFast',
    model: 'VF 6',
    batteryCapacity: 59.6,
    connectorType: 'CCS2',
    maxChargingPower: 80,
    range: 410,
  },
  {
    brand: 'VinFast',
    model: 'VF 7',
    batteryCapacity: 75.3,
    connectorType: 'CCS2',
    maxChargingPower: 110,
    range: 450,
  },
  {
    brand: 'VinFast',
    model: 'VF 8',
    batteryCapacity: 87.7,
    connectorType: 'CCS2',
    maxChargingPower: 150,
    range: 471,
  },
  {
    brand: 'VinFast',
    model: 'VF 9',
    batteryCapacity: 123,
    connectorType: 'CCS2',
    maxChargingPower: 150,
    range: 594,
  },
  {
    brand: 'VinFast',
    model: 'VF e34',
    batteryCapacity: 42,
    connectorType: 'CCS2',
    maxChargingPower: 60,
    range: 285,
  },

  // HYUNDAI
  {
    brand: 'Hyundai',
    model: 'Ioniq 5 Standard Range',
    batteryCapacity: 58,
    connectorType: 'CCS2',
    maxChargingPower: 220,
    range: 384,
  },
  {
    brand: 'Hyundai',
    model: 'Ioniq 5 Long Range',
    batteryCapacity: 77.4,
    connectorType: 'CCS2',
    maxChargingPower: 350,
    range: 507,
  },
  {
    brand: 'Hyundai',
    model: 'Ioniq 6 Long Range',
    batteryCapacity: 77.4,
    connectorType: 'CCS2',
    maxChargingPower: 350,
    range: 614,
  },
  {
    brand: 'Hyundai',
    model: 'Kona Electric',
    batteryCapacity: 64.8,
    connectorType: 'CCS2',
    maxChargingPower: 77,
    range: 484,
  },

  // KIA
  {
    brand: 'Kia',
    model: 'EV6 Standard Range',
    batteryCapacity: 58,
    connectorType: 'CCS2',
    maxChargingPower: 220,
    range: 394,
  },
  {
    brand: 'Kia',
    model: 'EV6 Long Range',
    batteryCapacity: 77.4,
    connectorType: 'CCS2',
    maxChargingPower: 350,
    range: 528,
  },
  {
    brand: 'Kia',
    model: 'EV6 GT',
    batteryCapacity: 77.4,
    connectorType: 'CCS2',
    maxChargingPower: 350,
    range: 424,
  },
  {
    brand: 'Kia',
    model: 'Niro EV',
    batteryCapacity: 64.8,
    connectorType: 'CCS2',
    maxChargingPower: 77,
    range: 460,
  },

  // BMW
  {
    brand: 'BMW',
    model: 'i4 eDrive40',
    batteryCapacity: 83.9,
    connectorType: 'CCS2',
    maxChargingPower: 205,
    range: 590,
  },
  {
    brand: 'BMW',
    model: 'iX xDrive50',
    batteryCapacity: 111.5,
    connectorType: 'CCS2',
    maxChargingPower: 200,
    range: 630,
  },
  {
    brand: 'BMW',
    model: 'i7 xDrive60',
    batteryCapacity: 101.7,
    connectorType: 'CCS2',
    maxChargingPower: 195,
    range: 625,
  },

  // AUDI
  {
    brand: 'Audi',
    model: 'e-tron GT',
    batteryCapacity: 93.4,
    connectorType: 'CCS2',
    maxChargingPower: 270,
    range: 488,
  },
  {
    brand: 'Audi',
    model: 'Q4 e-tron',
    batteryCapacity: 82,
    connectorType: 'CCS2',
    maxChargingPower: 135,
    range: 534,
  },

  // MERCEDES-BENZ
  {
    brand: 'Mercedes-Benz',
    model: 'EQS 450+',
    batteryCapacity: 107.8,
    connectorType: 'CCS2',
    maxChargingPower: 200,
    range: 782,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'EQE 350+',
    batteryCapacity: 90.6,
    connectorType: 'CCS2',
    maxChargingPower: 170,
    range: 639,
  },

  // NISSAN
  {
    brand: 'Nissan',
    model: 'Leaf',
    batteryCapacity: 40,
    connectorType: 'CHAdeMO',
    maxChargingPower: 50,
    range: 270,
  },
  {
    brand: 'Nissan',
    model: 'Leaf e+',
    batteryCapacity: 62,
    connectorType: 'CHAdeMO',
    maxChargingPower: 100,
    range: 385,
  },
  {
    brand: 'Nissan',
    model: 'Ariya',
    batteryCapacity: 87,
    connectorType: 'CCS2',
    maxChargingPower: 130,
    range: 520,
  },

  // MG
  {
    brand: 'MG',
    model: 'ZS EV',
    batteryCapacity: 72.6,
    connectorType: 'CCS2',
    maxChargingPower: 76,
    range: 440,
  },
  {
    brand: 'MG',
    model: 'MG4 Electric',
    batteryCapacity: 64,
    connectorType: 'CCS2',
    maxChargingPower: 135,
    range: 450,
  },

  // PORSCHE
  {
    brand: 'Porsche',
    model: 'Taycan',
    batteryCapacity: 93.4,
    connectorType: 'CCS2',
    maxChargingPower: 270,
    range: 431,
  },

  // VOLKSWAGEN
  {
    brand: 'Volkswagen',
    model: 'ID.4',
    batteryCapacity: 77,
    connectorType: 'CCS2',
    maxChargingPower: 135,
    range: 520,
  },

  // PEUGEOT
  {
    brand: 'Peugeot',
    model: 'e-2008',
    batteryCapacity: 50,
    connectorType: 'CCS2',
    maxChargingPower: 100,
    range: 340,
  },
];

/**
 * Get unique brands from EV_MODELS
 */
export const getBrands = () => {
  return [...new Set(EV_MODELS.map(ev => ev.brand))].sort();
};

/**
 * Get models for a specific brand
 */
export const getModelsByBrand = (brand) => {
  return EV_MODELS.filter(ev => ev.brand === brand).map(ev => ev.model);
};

/**
 * Get full vehicle data by brand and model
 */
export const getVehicleData = (brand, model) => {
  return EV_MODELS.find(ev => ev.brand === brand && ev.model === model);
};

/**
 * Search vehicles by keyword
 */
export const searchVehicles = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return EV_MODELS.filter(ev => 
    ev.brand.toLowerCase().includes(lowerKeyword) ||
    ev.model.toLowerCase().includes(lowerKeyword)
  );
};

export default {
  EV_BRANDS,
  EV_MODELS,
  getBrands,
  getModelsByBrand,
  getVehicleData,
  searchVehicles,
};
