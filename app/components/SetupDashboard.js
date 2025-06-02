'use client'

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Newspaper, 
  Calendar,
  Trash2,
  Edit3,
  Save,
  X,
  TrendingUp,
  Filter,
  Search,
  IndianRupee 
} from 'lucide-react';
import { newspaperAPI } from '../utils/api';
import { useAuth } from '../lib/useAuth';

export default function SetupDashboard() {
  useAuth(['user','admin'])
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [newspapers, setNewspapers] = useState([]);
  const [filteredNewspapers, setFilteredNewspapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNewspaper, setNewNewspaper] = useState({
    name: '',
    rates: {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
      friday: 0, saturday: 0, sunday: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchNewspapers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await newspaperAPI.getByMonth(month, year);
      setNewspapers(response.data);
      setFilteredNewspapers(response.data);
    } catch (error) {
      console.error('Error fetching newspapers:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchNewspapers();
  }, [fetchNewspapers]);

  useEffect(() => {
    const filtered = newspapers.filter(newspaper =>
      newspaper.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNewspapers(filtered);
  }, [searchTerm, newspapers]);

  const handleAddNewspaper = async (e) => {
    e.preventDefault();
    if (!newNewspaper.name.trim()) return;
    
    setLoading(true);
    try {
      await newspaperAPI.create({
        ...newNewspaper,
        month,
        year
      });
      setNewNewspaper({
        name: '',
        rates: {
          monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
          friday: 0, saturday: 0, sunday: 0
        }
      });
      setShowAddForm(false);
      await fetchNewspapers();
    } catch (error) {
      console.error('Error adding newspaper:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNewspaper = async (id, updatedData) => {
    try {
      await newspaperAPI.update(id, updatedData);
      fetchNewspapers();
    } catch (error) {
      console.error('Error updating newspaper:', error);
    }
  };

  const handleDeleteNewspaper = async (id) => {
    if (window.confirm('Are you sure you want to delete this newspaper?')) {
      try {
        await newspaperAPI.delete(id);
        fetchNewspapers();
      } catch (error) {
        console.error('Error deleting newspaper:', error);
      }
    }
  };

  const getTotalWeeklyRate = (rates) => {
    return Object.values(rates).reduce((sum, rate) => sum + rate, 0);
  };

  const getMonthlyTotal = () => {
    return newspapers.reduce((total, newspaper) => {
      return total + getTotalWeeklyRate(newspaper.rates);
    }, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 p-8 backdrop-blur-sm"
        variants={itemVariants}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center mb-6 lg:mb-0">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                Setup Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Configure newspapers and their daily rates</p>
            </div>
          </div>
          
          
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Month
            </label>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        variants={itemVariants}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search newspapers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          />
        </div>
        
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Newspaper
        </motion.button>
      </motion.div>

      {/* Add New Newspaper Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Add New Newspaper</h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddNewspaper} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Newspaper className="w-4 h-4 mr-2" />
                    Newspaper Name
                  </label>
                  <input
                    type="text"
                    value={newNewspaper.name}
                    onChange={(e) => setNewNewspaper({...newNewspaper, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter newspaper name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Daily Rates (₹)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {days.map((day, index) => (
                      <motion.div 
                        key={day} 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-center">
                          {dayLabels[index]}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={newNewspaper.rates[day]}
                            onChange={(e) => setNewNewspaper({
                              ...newNewspaper,
                              rates: {...newNewspaper.rates, [day]: Number(e.target.value)}
                            })}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Add Newspaper
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Newspapers Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Newspaper className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Configured Newspapers
              </h3>
              {filteredNewspapers.length > 0 && (
                <p className="text-gray-600 mt-1">
                  {filteredNewspapers.length} of {newspapers.length} newspapers
                </p>
              )}
            </div>
          </div>
          {loading && (
            <div className="flex items-center text-gray-500">
              <motion.div
                className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Loading...
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {filteredNewspapers.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Newspaper className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No newspapers found' : 'No newspapers configured'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? `No newspapers match "₹{searchTerm}". Try a different search term.`
                    : 'Get started by adding your first newspaper.'
                  }
                </p>
                {!searchTerm && (
                  <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Newspaper
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredNewspapers.map((newspaper, index) => (
                <motion.div 
                  key={newspaper._id} 
                  className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                    <div className="mb-4 lg:mb-0">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{newspaper.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          Weekly: ₹{getTotalWeeklyRate(newspaper.rates).toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Avg/Day: ₹{(getTotalWeeklyRate(newspaper.rates) / 7).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleDeleteNewspaper(newspaper._id)}
                      className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {days.map((day, dayIndex) => (
                      <motion.div 
                        key={day} 
                        className="space-y-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.1) + (dayIndex * 0.02) }}
                      >
                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-center">
                          {dayLabels[dayIndex]}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={newspaper.rates[day]}
                            onChange={(e) => {
                              const updatedRates = {...newspaper.rates, [day]: Number(e.target.value)};
                              handleUpdateNewspaper(newspaper._id, {...newspaper, rates: updatedRates});
                            }}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}