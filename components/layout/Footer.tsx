import { Home, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-[#13a8b4] via-[#d07648] to-[#13a8b4]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top section with logo and newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 mb-10 md:mb-12 pb-10 md:pb-12 border-b border-[#13a8b4]/20">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6 group cursor-pointer">
              <div className="bg-[#0f8a94] p-2 rounded-xl shadow-lg group-hover:shadow-[#d07648]/35 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0f8a94] to-[#0b6f78] bg-clip-text text-transparent">Rexon</span>
            </div>
            <p className="hp-footer-text text-slate-600 mb-6">
              Rexon is redefining real estate in India. Get commercial property buying and selling help from a team of experts committed to your success.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <a href="mailto:contact@rexon.com" className="flex items-center gap-2 text-slate-600 hover:text-[#d07648] transition-colors duration-300 group text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#13a8b4]/10 flex items-center justify-center group-hover:bg-[#d07648]/10 transition-colors duration-300">
                  <Mail className="h-4 w-4 text-[#0f8a94] group-hover:text-[#d07648] group-hover:scale-105 transition-all duration-300" />
                </div>
                <span>rexondev5@gmail.com</span>
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-2 text-slate-600 hover:text-[#d07648] transition-colors duration-300 group text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#13a8b4]/10 flex items-center justify-center group-hover:bg-[#d07648]/10 transition-colors duration-300">
                  <Phone className="h-4 w-4 text-[#0f8a94] group-hover:text-[#d07648] group-hover:scale-105 transition-all duration-300" />
                </div>
                <span>+91 123 456 7890</span>
              </a>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#13a8b4]/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-[#0f8a94]" />
                </div>
                <span> India</span>
              </div>
            </div>
          </div>
          
          {/* Newsletter section */}
          <div className="lg:col-span-2">
            <h3 className="hp-footer-title text-[#134c52] mb-3">Stay Updated</h3>
            <p className="hp-footer-text text-slate-600 mb-4">
              Subscribe to our newsletter for the latest commercial property listings and market insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg border-2 border-[#13a8b4]/25 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13a8b4]/35 focus:border-[#13a8b4] transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-[#d07648] to-[#c46b3f] hover:from-[#c46b3f] hover:to-[#a85832] text-white rounded-lg hp-button-label shadow-lg hover:shadow-[#d07648]/30 transition-all duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Links section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-[#134c52] font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#d07648] to-[#a85832] rounded-full"></span>
              Buy & Sell
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Buy Property</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Sell Property</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Property Valuation</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Sold Properties</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Market Trends</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[#134c52] font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#d07648] to-[#a85832] rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Blog</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Guides</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">News</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Market Reports</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[#134c52] font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#d07648] to-[#a85832] rounded-full"></span>
              Company
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Investors</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-[#d07648] transition-all duration-300 hover:translate-x-1 inline-block">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[#134c52] font-bold mb-4 text-sm flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#d07648] to-[#a85832] rounded-full"></span>
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-[#13a8b4]/10 to-[#13a8b4]/20 border-2 border-[#13a8b4]/30 hover:border-[#d07648] hover:bg-gradient-to-br hover:from-[#d07648] hover:to-[#a85832] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d07648]/30 group">
                <Facebook className="h-5 w-5 text-[#0f8a94] group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-[#13a8b4]/10 to-[#13a8b4]/20 border-2 border-[#13a8b4]/30 hover:border-[#d07648] hover:bg-gradient-to-br hover:from-[#d07648] hover:to-[#a85832] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d07648]/30 group">
                <Twitter className="h-5 w-5 text-[#0f8a94] group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-[#13a8b4]/10 to-[#13a8b4]/20 border-2 border-[#13a8b4]/30 hover:border-[#d07648] hover:bg-gradient-to-br hover:from-[#d07648] hover:to-[#a85832] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d07648]/30 group">
                <Linkedin className="h-5 w-5 text-[#0f8a94] group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-[#13a8b4]/10 to-[#13a8b4]/20 border-2 border-[#13a8b4]/30 hover:border-[#d07648] hover:bg-gradient-to-br hover:from-[#d07648] hover:to-[#a85832] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d07648]/30 group">
                <Instagram className="h-5 w-5 text-[#0f8a94] group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-[#13a8b4]/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs">
            <a href="#" className="text-slate-500 hover:text-[#d07648] transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-[#d07648] transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-[#d07648] transition-colors duration-300">Cookie Policy</a>
            <a href="#" className="text-slate-500 hover:text-[#d07648] transition-colors duration-300">Accessibility</a>
          </div>
          <p className="text-xs text-slate-500">
            © 2024 Rexon. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-[#13a8b4] via-[#d07648] to-[#13a8b4]"></div>
    </footer>
  );
}