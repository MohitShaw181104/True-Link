import { Shield, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SafeLink</h1>
              <p className="text-xs text-gray-500">Security Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </a>
            <a href="/settings" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">
              Settings
            </a>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}