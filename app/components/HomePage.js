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
        staggerChildren: 0.15,
        delayChildren: 0.4
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 120, damping: 12 }
    }
  };

  const features = [
    { icon: Plus, title: 'Easy Setup', description: 'Quickly add and configure newspapers with intuitive forms.' },
    { icon: Search, title: 'Daily Tracking', description: 'Log deliveries and manage active subscriptions without hassle.' },
    { icon: TrendingUp, title: 'Insights', description: 'Visualize trends over time to optimize your delivery routes.' },
    { icon: BarChart3, title: 'Custom Reports', description: 'Generate detailed reports by date, paper, or subscription status.' }
  ];

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start hover:shadow-lg transition-shadow"
    >
      <div className="p-3 rounded-full bg-blue-50 mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );

  const QuickActionButton = ({ href, icon: Icon, title, description, bgColor, iconBg, iconColor }) => (
    <motion.a 
      href={href}
      variants={itemVariants}
      whileHover={{ scale: 1.03 }}
      className="flex-1 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: bgColor }} />
      <div className="p-6 flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`${iconColor} w-6 h-6`} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
        </div>
      </div>
    </motion.a>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-20 space-y-16 flex-grow"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <Newspaper className="mx-auto w-12 h-12 text-blue-600 mb-4" />
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tight">
            Newspaper Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your newspaper tracking and subscription management with our intuitive digital platform.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <FeatureCard key={feat.title} {...feat} />
          ))}
        </motion.div>

        {/* Navigation Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <QuickActionButton
            href="/setup"
            icon={Plus}
            title="Setup Newspapers"
            description="Add newspapers to your catalog and configure subscription rates for different days."
            bgColor="#3B82F6"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <QuickActionButton
            href="/daily"
            icon={Search}
            title="Daily Tracking"
            description="Mark received newspapers, manage active subscriptions, and track inventory."
            bgColor="#10B981"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <p className="text-gray-600 mb-6 text-base">
            Ready to optimize your newspaper management workflow?
          </p>
          <motion.a
            href="/setup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow transition-all duration-300"
          >
            Get Started
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.a>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Newspaper Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}