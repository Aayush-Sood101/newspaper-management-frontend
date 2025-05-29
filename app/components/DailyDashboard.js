'use client'

import { useState, useEffect, useCallback } from 'react';
import { newspaperAPI, recordAPI } from '../utils/api';
import { Calendar, CheckCircle2, XCircle, FileSpreadsheet, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Newspaper Tracking Dashboard</h2>
          <p className="text-blue-100">Track deliveries and generate reports</p>
        </div>
        
        <div className="p-6">
          {/* Date Selection */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{formattedSelectedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select date"
                />
              </div>
              
              <button 
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Newspapers List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800">
            Today&apos;s Newspapers
          </h3>
          <p className="text-sm text-slate-500 mt-1">Track delivery status for {formattedSelectedDate}</p>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-slate-600">Loading newspapers...</span>
            </div>
          ) : newspapers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
                <FileSpreadsheet className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No newspapers configured for this date</p>
              <p className="text-slate-500 text-sm mt-1">Try selecting a different date or contact admin</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {newspapers.map(newspaper => {
                const dayName = getDayName(selectedDate);
                const rate = newspaper.rates[dayName] || 0;
                const received = isRecordReceived(newspaper._id);
                const isUpdating = updatingRecord === newspaper._id;
                
                // Skip newspapers with rate 0 for the selected day
                if (rate === 0) return null;
                
                return (
                  <div 
                    key={newspaper._id} 
                    className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                      received ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap md:flex-nowrap justify-between items-center p-4 gap-4">
                      <div className="flex-grow">
                        <h4 className="font-semibold text-slate-800">{newspaper.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            ₹{rate}
                          </span>
                          <span className="text-xs text-slate-500 ml-2 capitalize">
                            {dayName} rate
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleRecordChange(newspaper._id, !received)}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                            ${received 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }
                            ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}
                          `}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : received ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Received</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Mark as Received</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Report Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800">Generate Monthly Report</h3>
          <p className="text-sm text-slate-500 mt-1">Export delivery data as Excel spreadsheet</p>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
              <select 
                value={reportMonth} 
                onChange={(e) => setReportMonth(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
              <input
                type="number"
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                min="2000"
                max="2100"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${isGeneratingReport 
                    ? 'bg-amber-100 text-amber-700 cursor-not-allowed' 
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                  }
                `}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Generate Excel Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}