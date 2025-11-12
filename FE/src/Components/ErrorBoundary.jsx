import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught an error:');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Có lỗi xảy ra
              </h1>
              <p className="text-gray-600 mb-6">
                Đã xảy ra lỗi khi tải trang. Vui lòng thử lại sau.
              </p>
              
              {this.state.error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Về trang đăng nhập
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
