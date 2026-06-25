import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Download, 
  Printer, 
  CalendarCheck, 
  FileText 
} from 'lucide-react';

export const Attendance = () => {
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterVenue, setFilterVenue] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.attendance.list();
      setAttendance(data);
    } catch (err) {
      showToast('Failed to fetch attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filter & Search Logic
  const filteredRecords = attendance.filter(r => {
    const matchesSearch = 
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = filterCourse ? r.courseCode.toLowerCase() === filterCourse.toLowerCase() : true;
    const matchesVenue = filterVenue ? r.venue.toLowerCase() === filterVenue.toLowerCase() : true;

    return matchesSearch && matchesCourse && matchesVenue;
  });

  const exportCSV = () => {
    let csv = 'Matric,Student Name,Course Code,Course Title,Time Verified,Venue\n';
    attendance.forEach(r => {
      csv += `"${r.matricNumber}","${r.studentName}","${r.courseCode}","${r.courseTitle}","${r.timeVerified}","${r.venue}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'attendance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance CSV downloaded successfully', 'success');
  };

  const printAttendance = () => {
    const printWindow = window.open('', '_blank');
    let rowsHTML = '';
    filteredRecords.forEach((r, idx) => {
      rowsHTML += `
        <tr>
          <td>${idx + 1}</td>
          <td>${r.matricNumber}</td>
          <td>${r.studentName}</td>
          <td>${r.courseCode}</td>
          <td>${new Date(r.timeVerified).toLocaleString()}</td>
          <td>${r.venue}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Audit Log Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { border-bottom: 2px solid #000; padding-bottom: 8px; uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>EXAMINATION ATTENDANCE REGISTRY</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Verified Entries: ${filteredRecords.length}</p>
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Matric Number</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Time Verified</th>
                <th>Venue</th>
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
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Attendance</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Audit verification timestamps and course check-ins.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flat-btn bg-white hover:scale-102 flex items-center gap-1.5 py-2.5 text-xs font-black uppercase"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={printAttendance}
            className="flat-btn bg-black text-white hover:scale-102 flex items-center gap-1.5 py-2.5 text-xs font-black uppercase cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Registry
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flat-card bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            placeholder="Search student, matric, course..."
            className="flat-input pl-11 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Course */}
        <select
          className="flat-select text-sm py-2 bg-no-repeat"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          <option value="CSC 401">CSC 401</option>
          <option value="CSC 403">CSC 403</option>
          <option value="MTH 301">MTH 301</option>
        </select>

        {/* Filter Venue */}
        <select
          className="flat-select text-sm py-2 bg-no-repeat"
          value={filterVenue}
          onChange={(e) => setFilterVenue(e.target.value)}
        >
          <option value="">All Venues</option>
          <option value="Main Examination Hall A">Main Hall A</option>
          <option value="E-Learning Centre Suite B">E-Learning B</option>
          <option value="Faculty Lecture Theatre II">Lecture Theatre II</option>
        </select>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading Attendance Registers...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <CalendarCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-black uppercase text-black">No Entries Recorded</h3>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Scan student passes to generate entry logs.</p>
        </div>
      ) : (
        <div className="flat-card bg-white p-0 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black text-white uppercase text-xs tracking-wider border-b-4 border-black">
                <th className="p-4 font-black">Matric Number</th>
                <th className="p-4 font-black">Student Name</th>
                <th className="p-4 font-black">Course Code</th>
                <th className="p-4 font-black">Course Title</th>
                <th className="p-4 font-black">Verification Time</th>
                <th className="p-4 font-black">Exam Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-black text-sm text-flatBlue">{rec.matricNumber}</td>
                  <td className="p-4 font-black text-sm text-black">{rec.studentName}</td>
                  <td className="p-4 font-bold text-xs uppercase text-gray-700">{rec.courseCode}</td>
                  <td className="p-4 font-extrabold text-xs text-gray-500 truncate max-w-[200px]" title={rec.courseTitle}>{rec.courseTitle}</td>
                  <td className="p-4 font-bold text-xs font-mono text-flatBlue">
                    {new Date(rec.timeVerified).toLocaleString()}
                  </td>
                  <td className="p-4 font-extrabold text-xs text-black">{rec.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
