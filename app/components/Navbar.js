'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Shield, Users, Globe } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Newspaper className="h-8 w-8 text-blue-600 mr-3" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Newspaper Management
            </span>
          </motion.div>
          
          {/* Features Section */}
          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="flex items-center space-x-2 text-gray-600"
              whileHover={{ scale: 1.05, color: '#2563eb' }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Secure</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-gray-600"
              whileHover={{ scale: 1.05, color: '#2563eb' }}
              transition={{ duration: 0.2 }}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Multi-User</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-gray-600"
              whileHover={{ scale: 1.05, color: '#2563eb' }}
              transition={{ duration: 0.2 }}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Cloud-Based</span>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/about" 
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                About
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/contact" 
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                Contact
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Features */}
        <motion.div 
          className="md:hidden pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex justify-center space-x-6 pt-2">
            <motion.div 
              className="flex items-center space-x-1 text-gray-600"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-3 h-3" />
              <span className="text-xs font-medium">Secure</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-gray-600"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-3 h-3" />
              <span className="text-xs font-medium">Multi-User</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-gray-600"
              whileHover={{ scale: 1.05 }}
            >
              <Globe className="w-3 h-3" />
              <span className="text-xs font-medium">Cloud-Based</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Animated gradient line */}
      <motion.div
        className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
    </nav>
  );
}