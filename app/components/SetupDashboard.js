'use client'

import { useState, useEffect, useCallback } from 'react';
import { newspaperAPI } from '../utils/api';
import { useAuth } from '../lib/useAuth';
export default function SetupDashboard() {
  useAuth(['user','admin'])
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [newspapers, setNewspapers] = useState([]);
  const [newNewspaper, setNewNewspaper] = useState({
    name: '',
    rates: {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
      friday: 0, saturday: 0, sunday: 0
    }
  });
  const [loading, setLoading] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const fetchNewspapers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await newspaperAPI.getByMonth(month, year);
      setNewspapers(response.data);
    } catch (error) {
      console.error('Error fetching newspapers:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchNewspapers();
  }, [fetchNewspapers]);

  const handleAddNewspaper = async (e) => {
    e.preventDefault();
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Setup Dashboard</h2>
            <p className="text-gray-600 mt-1">Configure newspapers and their daily rates</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Month</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Add New Newspaper Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Add New Newspaper</h3>
        </div>
        
        <form onSubmit={handleAddNewspaper} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Newspaper Name</label>
            <input
              type="text"
              value={newNewspaper.name}
              onChange={(e) => setNewNewspaper({...newNewspaper, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter newspaper name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Daily Rates (₹)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {days.map(day => (
                <div key={day} className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {day.substring(0, 3)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newNewspaper.rates[day]}
                    onChange={(e) => setNewNewspaper({
                      ...newNewspaper,
                      rates: {...newNewspaper.rates, [day]: Number(e.target.value)}
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Newspaper
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Newspapers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Existing Newspapers
              {newspapers.length > 0 && (
                <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  {newspapers.length}
                </span>
              )}
            </h3>
          </div>
          {loading && (
            <div className="flex items-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
        </div>
        
        {newspapers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No newspapers configured</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first newspaper above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {newspapers.map(newspaper => (
              <div key={newspaper._id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{newspaper.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Monthly total: ₹{Object.values(newspaper.rates).reduce((sum, rate) => sum + rate, 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNewspaper(newspaper._id)}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {days.map(day => (
                    <div key={day} className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {day.substring(0, 3)}
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
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}