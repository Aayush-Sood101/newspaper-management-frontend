'use client';

import { Plus, Search, Newspaper, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const StatCard = ({ value, label, icon: Icon }) => (
    <motion.div 
      variants={itemVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center"
    >
      <div className="rounded-full bg-primary/5 p-3 mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-2xl font-serif font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );

  const QuickActionButton = ({ href, icon: Icon, title, description, color, delay = 0 }) => (
    <motion.a 
      href={href}
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className={`h-1.5 w-full bg-${color}`}></div>
        <div className="p-8">
          <div className="flex items-start space-x-5">
            <div className={`p-3 rounded-lg bg-${color}/10`}>
              <Icon className={`w-6 h-6 text-${color}`} />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Newspaper className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            Newspaper Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your newspaper tracking and subscription management with our intuitive digital platform
          </p>
        </motion.div>


        {/* Navigation Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          <QuickActionButton
            href="/setup"
            icon={Plus}
            title="Setup Newspapers"
            description="Add newspapers to your catalog and configure subscription rates for different days of the week."
            color="blue-600"
          />
          <QuickActionButton
            href="/daily"
            icon={Search}
            title="Daily Tracking"
            description="Mark newspapers as received, manage active subscriptions, and track your daily inventory."
            color="emerald-600"
          />
        </motion.div>
        
        {/* CTA Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-6">
            Ready to optimize your newspaper management workflow?
          </p>
          <motion.a
            href="/setup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-300"
          >
            Get Started
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </motion.a>
        </motion.div>
      </motion.main>
    </div>
  );
}