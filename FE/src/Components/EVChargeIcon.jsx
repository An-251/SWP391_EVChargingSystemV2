import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Unified EV Charge Icon Component
 * Use this across the entire application for consistency
 * 
 * @param {number} size - Icon size (default: 24)
 * @param {string} className - Additional CSS classes
 * @param {string} color - Icon color (default: currentColor)
 * @param {string} variant - Icon style variant: 'default' | 'filled' | 'outlined' | 'gradient'
 */
const EVChargeIcon = ({ 
  size = 24, 
  className = '', 
  color,
  variant = 'default',
  ...props 
}) => {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'filled':
        return 'fill-current';
      case 'outlined':
        return 'fill-none stroke-current';
      case 'gradient':
        return 'ev-charge-gradient';
      default:
        return '';
    }
  };

  const variantClass = getVariantClass();
  const combinedClassName = `ev-charge-icon ${variantClass} ${className}`.trim();

  return (
    <Zap 
      size={size} 
      className={combinedClassName}
      style={color ? { color } : {}}
      {...props}
    />
  );
};

export default EVChargeIcon;

/**
 * Usage Examples:
 * 
 * Basic:
 * <EVChargeIcon />
 * 
 * With size and color:
 * <EVChargeIcon size={32} color="#3b82f6" />
 * 
 * With Tailwind classes:
 * <EVChargeIcon className="text-blue-600" size={20} />
 * 
 * Filled variant:
 * <EVChargeIcon variant="filled" className="text-green-500" />
 * 
 * Gradient variant (requires custom CSS):
 * <EVChargeIcon variant="gradient" size={40} />
 */
