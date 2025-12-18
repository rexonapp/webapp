import { Home } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-red-500 p-1.5 rounded-lg">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Rexon</span>
            </div>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              Rexon is redefining real estate in the consumer's favor. Get home buying and selling help from a team of experts.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-white border border-gray-300 hover:border-red-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-gray-600">
                <span className="text-xs font-semibold">f</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white border border-gray-300 hover:border-red-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-gray-600">
                <span className="text-xs font-semibold">𝕏</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white border border-gray-300 hover:border-red-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-gray-600">
                <span className="text-xs font-semibold">in</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white border border-gray-300 hover:border-red-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-gray-600">
                <span className="text-xs font-semibold">IG</span>
              </a>
            </div>
          </div>
          
\          <div>
            <h3 className="text-gray-900 font-bold mb-3 text-sm">Buy & Sell</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Buy a Home</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Sell Your Home</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Get Home Value</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">See Sold Homes</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Mortgage Rates</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-900 font-bold mb-3 text-sm">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Guides</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">News</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Real Estate Trends</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-900 font-bold mb-3 text-sm">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Investors</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-red-500 transition-colors">Press</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs">
            <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">Cookie Policy</a>
            <a href="#" className="text-gray-500 hover:text-red-500 transition-colors">Accessibility</a>
          </div>
          <p className="text-xs text-gray-500">
            © 2024 Rexon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}