import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { History, Search, Filter, Printer } from 'lucide-react';

export const AuditLogs = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.auditLogs.list();
      setLogs(data);
    } catch (err) {
      showToast('Failed to fetch security audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType ? log.activityType.toLowerCase() === filterType.toLowerCase() : true;

    return matchesSearch && matchesType;
  });

  const getBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'login activity':
        return 'bg-flatBlue text-white';
      case 'student creation':
        return 'bg-flatEmerald text-white';
      case 'qr generation':
        return 'bg-flatAmber text-black';
      case 'qr verification':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  const printLogs = () => {
    const printWindow = window.open('', '_blank');
    let rowsHTML = '';
    filteredLogs.forEach((l) => {
      rowsHTML += `
        <tr>
          <td>${new Date(l.timestamp).toLocaleString()}</td>
          <td>${l.activityType}</td>
          <td>${l.description}</td>
          <td>${l.userId}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>System Security Audit logs</title>
          <style>
            body { font-family: monospace; padding: 25px; }
            h2 { border-bottom: 3px solid #000; padding-bottom: 6px; uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 2px solid #000; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #e6e6e6; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>SMART ENTRY AUDIT LOG REPORT</h2>
          <p>RUN AT: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Activity Type</th>
                <th>Description</th>
                <th>UserId/Agent</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Audit Logs</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Audit security operations and transaction logs in real time.</p>
        </div>
        <button
          onClick={printLogs}
          className="flat-btn bg-black text-white hover:scale-102 flex items-center gap-1.5 py-2.5 text-xs font-black uppercase cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Audit Log
        </button>
      </div>

      {/* Filters Box */}
      <div className="flat-card bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            placeholder="Search logs by activity text or operator..."
            className="flat-input pl-11 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Type */}
        <select
          className="flat-select text-sm py-2 bg-no-repeat"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Activity Types</option>
          <option value="Login Activity">Login Activity</option>
          <option value="Student Creation">Student Creation</option>
          <option value="Student Update">Student Update</option>
          <option value="Exam Creation">Exam Creation</option>
          <option value="QR Generation">QR Generation</option>
          <option value="QR Verification">QR Verification</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading System Audits...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-black uppercase text-black">No Logs Found</h3>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">System transactions are empty.</p>
        </div>
      ) : (
        <div className="flat-card bg-white p-0 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-black text-white uppercase text-xs tracking-wider border-b-4 border-black">
                <th className="p-4 font-black w-48">Timestamp</th>
                <th className="p-4 font-black w-48">Event Category</th>
                <th className="p-4 font-black">Audit description</th>
                <th className="p-4 font-black w-48">Operator Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-semibold text-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-4 font-mono text-flatBlue font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`flat-badge text-[10px] font-black border-2 py-0.5 px-2 ${getBadgeColor(log.activityType)}`}>
                      {log.activityType}
                    </span>
                  </td>
                  <td className="p-4 font-black text-black text-sm">{log.description}</td>
                  <td className="p-4 font-mono font-bold text-gray-500">{log.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
