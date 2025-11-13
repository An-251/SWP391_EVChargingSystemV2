import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Page Header Component
 * Provides consistent header layout with back button, breadcrumbs, and actions
 * 
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {boolean} showBackButton - Show back navigation button
 * @param {function|string} onBack - Custom back handler or navigation path
 * @param {array} breadcrumbs - Array of breadcrumb objects [{label, path}]
 * @param {node} actions - Custom action buttons/elements
 * @param {node} icon - Optional icon component
 * @param {string} iconBgColor - Background color for icon (Tailwind class)
 * @param {string} className - Additional custom classes
 */
const PageHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  breadcrumbs = [],
  actions,
  icon: IconComponent,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else if (typeof onBack === 'string') {
      navigate(onBack);
    } else {
      navigate(-1);
    }
  };

  const handleBreadcrumbClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <span className="text-gray-400 mx-2">/</span>
                  )}
                  {crumb.path ? (
                    <button
                      onClick={() => handleBreadcrumbClick(crumb.path)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {crumb.icon && <crumb.icon className="inline w-4 h-4 mr-1" />}
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {crumb.icon && <crumb.icon className="inline w-4 h-4 mr-1" />}
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                aria-label="Go back"
              >
                <ArrowLeft 
                  size={20} 
                  className="text-gray-600 group-hover:text-gray-900" 
                />
              </button>
            )}

            {/* Icon */}
            {IconComponent && (
              <div className={`p-3 ${iconBgColor} rounded-xl`}>
                <IconComponent size={28} className={iconColor} />
              </div>
            )}

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
