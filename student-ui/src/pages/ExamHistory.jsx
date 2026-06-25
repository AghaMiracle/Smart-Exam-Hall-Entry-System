import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { History, HelpCircle, FileX } from 'lucide-react';

export const ExamHistory = () => {
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.attendance.history(page, 20);
        // Result could be the records array directly or { records, pagination }
        if (Array.isArray(result)) {
          setRecords(result);
        } else {
          setRecords(result.records || result || []);
          setPagination(result.pagination || null);
        }
      } catch (err) {
        showToast('Failed to load attendance history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Exam History</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">View your past exam attendance and verification records.</p>
        </div>
      </div>

      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading Attendance Records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <FileX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-black uppercase text-black">No History Available</h3>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">You haven't been verified for any exams yet.</p>
        </div>
      ) : (
        <>
          <div className="flat-card bg-white p-0 border-black overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-black text-white uppercase text-xs tracking-wider border-b-4 border-black">
                  <th className="p-4 font-black">Course Code</th>
                  <th className="p-4 font-black">Course Title</th>
                  <th className="p-4 font-black">Exam Date</th>
                  <th className="p-4 font-black">Status</th>
                  <th className="p-4 font-black">Verified At</th>
                  <th className="p-4 font-black">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-xs font-semibold text-gray-700">
                {records.map((record) => {
                  const exam = record.examId || {};
                  return (
                    <tr key={record._id} className="hover:bg-gray-50 bg-white">
                      <td className="p-4 font-black text-sm text-flatBlue">{exam.courseCode || 'N/A'}</td>
                      <td className="p-4 font-black text-black text-sm">{exam.title || 'N/A'}</td>
                      <td className="p-4 font-bold text-gray-500">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`flat-badge border-2 text-[10px] font-black py-0.5 px-2.5 ${
                            record.verificationStatus === 'verified'
                              ? 'bg-flatEmerald text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {record.verificationStatus === 'verified' ? 'Verified' : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-flatBlue">
                        {record.verifiedAt ? new Date(record.verifiedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-extrabold text-black uppercase">{exam.venue || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flat-btn bg-white text-xs font-black uppercase py-2 px-4 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="flex items-center text-xs font-black uppercase">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="flat-btn bg-white text-xs font-black uppercase py-2 px-4 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Support note */}
      <div className="flat-card bg-gray-50 border-black p-4 text-left">
        <h4 className="font-black text-xs uppercase text-black mb-1 flex items-center gap-1">
          <HelpCircle className="w-4 h-4 text-flatBlue stroke-[3]" />
          Discrepancy Reporting
        </h4>
        <p className="text-[10px] font-bold text-gray-500 leading-snug uppercase">
          If you were present but marked as absent, please contact the examination coordination office immediately.
        </p>
      </div>
    </div>
  );
};

export default ExamHistory;
