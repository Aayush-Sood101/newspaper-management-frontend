'use client'

import { useState, useEffect, useCallback } from 'react';
import { newspaperAPI, recordAPI } from '../utils/api';
import { Calendar, CheckCircle2, XCircle, FileSpreadsheet, ChevronLeft, ChevronRight, Loader2, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';

export default function DailyDashboard() {
  useAuth(['user','admin'])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newspapers, setNewspapers] = useState([]);
  const [records, setRecords] = useState([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState(null);

  const fetchNewspapersAndRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const date = new Date(selectedDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const [newspapersResponse, recordsResponse] = await Promise.all([
        newspaperAPI.getByMonth(month, year),
        recordAPI.getByDate(selectedDate)
      ]);
      
      setNewspapers(newspapersResponse.data);
      setRecords(recordsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchNewspapersAndRecords();
  }, [selectedDate, fetchNewspapersAndRecords]);

  const handleRecordChange = async (newspaperId, received) => {
    setUpdatingRecord(newspaperId);
    try {
      await recordAPI.createOrUpdate({
        newspaperId,
        date: selectedDate,
        received
      });
      fetchNewspapersAndRecords();
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setUpdatingRecord(null);
    }
  };

  const isRecordReceived = (newspaperId) => {
    const record = records.find(r => r.newspaperId?._id === newspaperId);
    return record ? record.received : false;
  };

  const getDayName = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await recordAPI.getReport(reportMonth, reportYear);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newspaper-report-${reportMonth}-${reportYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate stats
  const validNewspapers = newspapers.filter(newspaper => {
    const dayName = getDayName(selectedDate);
    const rate = newspaper.rates[dayName] || 0;
    return rate > 0;
  });
  
  const totalDelivered = validNewspapers.filter(newspaper => isRecordReceived(newspaper._id)).length;
  const totalExpected = validNewspapers.length;
  const deliveryRate = totalExpected > 0 ? (totalDelivered / totalExpected) * 100 : 0;
  const totalValue = validNewspapers.reduce((sum, newspaper) => {
    const dayName = getDayName(selectedDate);
    const rate = newspaper.rates[dayName] || 0;
    return sum + (isRecordReceived(newspaper._id) ? rate : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section with Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90"></div>
          <div className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
                  Newspaper Tracking Dashboard
                </h1>
                <p className="text-blue-100 text-lg opacity-90">
                  Track deliveries and generate comprehensive reports
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 lg:p-4">
                    <div className="text-2xl lg:text-3xl font-bold">{totalDelivered}</div>
                    <div className="text-xs lg:text-sm text-blue-100 opacity-80">Received</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 lg:p-4">
                    <div className="text-2xl lg:text-3xl font-bold">{totalExpected}</div>
                    <div className="text-xs lg:text-sm text-blue-100 opacity-80">Expected</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 lg:p-4">
                    <div className="text-2xl lg:text-3xl font-bold">₹{totalValue}</div>
                    <div className="text-xs lg:text-sm text-blue-100 opacity-80">Value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{formattedSelectedDate}</h2>
                  <p className="text-slate-500 text-sm">
                    {deliveryRate.toFixed(0)}% delivery completion rate
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => changeDate(-1)}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-3 border-2 border-slate-200 rounded-xl w-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                    aria-label="Select date"
                  />
                </div>
                
                <button 
                  onClick={() => changeDate(1)}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 hover:scale-105"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Daily Progress</span>
                <span className="text-sm text-slate-500">{totalDelivered} of {totalExpected}</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${deliveryRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Newspapers List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-slate-100/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Today's Newspapers</h3>
            </div>
            <p className="text-slate-500">Track delivery status for {formattedSelectedDate}</p>
          </div>
          
          <div className="p-6 lg:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">Loading newspapers...</p>
                  <p className="text-slate-400 text-sm mt-1">Please wait while we fetch the data</p>
                </div>
              </div>
            ) : validNewspapers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <FileSpreadsheet className="h-10 w-10 text-slate-400" />
                </div>
                <h4 className="text-xl font-semibold text-slate-700 mb-2">No newspapers configured</h4>
                <p className="text-slate-500 max-w-md mx-auto">
                  No newspapers are scheduled for delivery on this date. Try selecting a different date or contact your administrator.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:gap-6">
                {validNewspapers.map(newspaper => {
                  const dayName = getDayName(selectedDate);
                  const rate = newspaper.rates[dayName] || 0;
                  const received = isRecordReceived(newspaper._id);
                  const isUpdating = updatingRecord === newspaper._id;
                  
                  return (
                    <div 
                      key={newspaper._id} 
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                        received 
                          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-green-50/40 shadow-emerald-100/50' 
                          : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-4">
                        <div className="flex-grow">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${received ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <FileSpreadsheet className={`h-6 w-6 ${received ? 'text-emerald-600' : 'text-slate-600'}`} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-slate-800 mb-2">{newspaper.name}</h4>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                                  received 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  ₹{rate}
                                </span>
                                <span className="text-sm text-slate-500 capitalize bg-slate-100 px-3 py-1.5 rounded-full">
                                  {dayName} rate
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center lg:ml-4">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleRecordChange(newspaper._id, !received)}
                            className={`
                              flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 min-w-[160px] justify-center
                              ${received 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                                : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40'
                              }
                              ${isUpdating ? 'opacity-70 cursor-not-allowed transform-none' : ''}
                            `}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : received ? (
                              <>
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Received</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5" />
                                <span>Mark Received</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtle animation indicator */}
                      {received && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Report Generator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-slate-100/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Generate Monthly Report</h3>
            </div>
            <p className="text-slate-500">Export delivery data as a comprehensive Excel spreadsheet</p>
          </div>
          
          <div className="p-6 lg:p-8">
            <div className="grid md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Month</label>
                <select 
                  value={reportMonth} 
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Year</label>
                <input
                  type="number"
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  min="2000"
                  max="2100"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className={`
                    w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105
                    ${isGeneratingReport 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 cursor-not-allowed shadow-lg transform-none' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                    }
                  `}
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-6 w-6" />
                      <span>Generate Excel Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}