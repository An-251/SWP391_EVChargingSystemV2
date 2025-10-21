import React from 'react';
import { X, Navigation, Clock, MapPin, ArrowRight } from 'lucide-react';

function NavigationPanel({ routeInfo, onClose, stationName }) {
  if (!routeInfo) return null;

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-2xl w-80 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <h3 className="font-bold text-lg">Chỉ đường</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {stationName && (
          <div className="flex items-center gap-2 text-sm text-green-50">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{stationName}</span>
          </div>
        )}
      </div>

      {/* Route Summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Khoảng cách</p>
              <p className="font-bold text-gray-800">{routeInfo.distance}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Thời gian</p>
              <p className="font-bold text-gray-800">{routeInfo.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-turn Instructions */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Hướng dẫn từng bước
        </h4>
        
        <div className="space-y-3">
          {routeInfo.steps && routeInfo.steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 
                    ? 'bg-green-500 text-white' 
                    : index === routeInfo.steps.length - 1
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {index === 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : index === routeInfo.steps.length - 1 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                  {step.instruction}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {step.distance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            // Copy directions to clipboard
            const text = routeInfo.steps.map((step, i) => `${i + 1}. ${step.instruction} (${step.distance})`).join('\n');
            navigator.clipboard.writeText(`Khoảng cách: ${routeInfo.distance}\nThời gian: ${routeInfo.duration}\n\n${text}`);
          }}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Sao chép hướng dẫn
        </button>
      </div>
    </div>
  );
}

export default NavigationPanel;
