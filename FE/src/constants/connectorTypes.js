/**
 * Connector Type Constants
 * Standard EV charging connector types
 */

export const CONNECTOR_TYPES = {
  CCS1: 'CCS1',         // Combined Charging System Type 1 (North America)
  CCS2: 'CCS2',         // Combined Charging System Type 2 (Europe)
  CHADEMO: 'CHAdeMO',   // CHAdeMO (Japan standard)
  TYPE2: 'Type 2',      // Type 2 / Mennekes (AC charging, Europe)
  TYPE1: 'Type 1',      // Type 1 / J1772 (AC charging, North America)
  GBT: 'GB/T',          // GB/T (China standard)
  TESLA: 'Tesla',       // Tesla proprietary connector
  NACS: 'NACS',         // North American Charging Standard (Tesla's open standard)
};

export const CONNECTOR_TYPE_OPTIONS = [
  { value: 'CCS1', label: 'CCS1 (Combined Charging System Type 1)' },
  { value: 'CCS2', label: 'CCS2 (Combined Charging System Type 2)' },
  { value: 'CHAdeMO', label: 'CHAdeMO (Japanese Standard)' },
  { value: 'Type 2', label: 'Type 2 / Mennekes (AC)' },
  { value: 'Type 1', label: 'Type 1 / J1772 (AC)' },
  { value: 'GB/T', label: 'GB/T (Chinese Standard)' },
  { value: 'Tesla', label: 'Tesla Proprietary' },
  { value: 'NACS', label: 'NACS (North American Charging Standard)' },
];

export const CONNECTOR_TYPE_LABELS = {
  'CCS1': 'CCS1',
  'CCS2': 'CCS2',
  'CHAdeMO': 'CHAdeMO',
  'Type 2': 'Type 2',
  'Type 1': 'Type 1',
  'GB/T': 'GB/T',
  'Tesla': 'Tesla',
  'NACS': 'NACS',
};

/**
 * Get connector type label by value
 */
export const getConnectorTypeLabel = (value) => {
  return CONNECTOR_TYPE_LABELS[value] || value;
};

/**
 * Validate connector type
 */
export const isValidConnectorType = (value) => {
  return Object.values(CONNECTOR_TYPES).includes(value);
};
