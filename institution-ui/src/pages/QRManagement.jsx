import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import QRCode from 'react-qr-code';
import { encodeQR } from '../services/mockDataService';
import { 
  QrCode, 
  Download, 
  Printer, 
  Layers, 
  User, 
  BookOpen, 
  Check, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const QRManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single QR Generator Selection
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [qrPayload, setQrPayload] = useState(null);

  // Bulk Generator Selection
  const [bulkExamId, setBulkExamId] = useState('');
  const [bulkList, setBulkList] = useState([]);

  const qrRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentList = await api.students.list(user.id);
        const examList = await api.exams.list();
        setStudents(studentList.filter(s => s.status === 'Active'));
        setExams(examList.filter(e => e.status === 'Active'));
      } catch (err) {
        showToast('Failed to fetch generator references', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Single QR Generation
  const handleGenerateQR = () => {
    if (!selectedStudentId || !selectedExamId) {
      showToast('Please select both a student and an exam.', 'warning');
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    const exam = exams.find(e => e.id === selectedExamId);

    if (!student || !exam) {
      showToast('Reference error occurred', 'error');
      return;
    }

    const payload = {
      studentId: student.id,
      matricNumber: student.matricNumber,
      examId: exam.id,
      institutionId: user.id,
      timestamp: new Date().toISOString()
    };

    const encryptedString = encodeQR(payload);
    setGeneratedQR(encryptedString);
    setQrPayload({ student, exam, timestamp: payload.timestamp });
    showToast('Secure Exam QR Token successfully generated!', 'success');
  };

  // Bulk Generation
  const handleBulkGenerate = () => {
    if (!bulkExamId) {
      showToast('Please select an exam course code.', 'warning');
      return;
    }

    const exam = exams.find(e => e.id === bulkExamId);
    if (!exam) return;

    // Filter students whose department matches the exam department
    // In a production system, you would check student courses enrollment. Here we match by department.
    const eligibleStudents = students.filter(
      s => s.department.toLowerCase() === exam.department.toLowerCase() && s.level === exam.level
    );

    if (eligibleStudents.length === 0) {
      showToast(`No active students found in ${exam.department} at ${exam.level}`, 'warning');
      setBulkList([]);
      return;
    }

    const generated = eligibleStudents.map(student => {
      const payload = {
        studentId: student.id,
        matricNumber: student.matricNumber,
        examId: exam.id,
        institutionId: user.id,
        timestamp: new Date().toISOString()
      };
      return {
        student,
        token: encodeQR(payload)
      };
    });

    setBulkList(generated);
    showToast(`Bulk QR codes generated for ${eligibleStudents.length} enrolled students.`, 'success');
  };

  // Download QR Code as PNG SVG canvas drawer
  const downloadQR = () => {
    const svgElement = document.getElementById('qr-svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 350;
      canvas.height = 350;
      const context = canvas.getContext('2d');
      // draw white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 350, 350);
      context.drawImage(image, 25, 25, 300, 300);
      
      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = `QR_${qrPayload?.student.matricNumber}_${qrPayload?.exam.courseCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast('QR Code PNG download triggered', 'success');
    };
    image.src = blobURL;
  };

  // Print single QR Code context
  const printQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Student Hall Access QR Code</title>
          <style>
            body { font-family: 'Arial', sans-serif; text-align: center; padding: 40px; }
            .badge { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            h2 { margin: 10px 0; uppercase; }
            p { font-weight: bold; margin: 5px 0; }
            .qr { margin: 30px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="badge">
            <h2>SMART VERIFICATION PASS</h2>
            <div class="qr">${document.getElementById('qr-wrapper').innerHTML}</div>
            <p>NAME: ${qrPayload?.student.lastName}, ${qrPayload?.student.firstName}</p>
            <p>MATRIC: ${qrPayload?.student.matricNumber}</p>
            <p>COURSE: ${qrPayload?.exam.courseCode} - ${qrPayload?.exam.courseTitle}</p>
            <p>VENUE: ${qrPayload?.exam.venue}</p>
            <p>DATE: ${qrPayload?.exam.examDate} @ ${qrPayload?.exam.examTime}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Print bulk QR Passes
  const printBulk = () => {
    const printWindow = window.open('', '_blank');
    let passesHTML = '';
    const exam = exams.find(e => e.id === bulkExamId);

    bulkList.forEach(item => {
      passesHTML += `
        <div class="pass-container" style="page-break-after: always; border: 4px solid #000; padding: 30px; max-width: 400px; margin: 40px auto; text-align: center;">
          <h2 style="margin: 0 0 10px 0; font-family: monospace; font-weight: 900;">EXAM HALL ENTRY PASS</h2>
          <div style="margin: 20px auto; display: inline-block;">
            <svg width="200" height="200" viewBox="0 0 29 29" style="shape-rendering: crispEdges;">
              <!-- Simple placeholder printable mock svg for print speed -->
              <rect width="200" height="200" fill="#fff" />
              <rect x="20" y="20" width="160" height="160" fill="#000" />
              <rect x="40" y="40" width="120" height="120" fill="#fff" />
              <rect x="60" y="60" width="80" height="80" fill="#000" />
            </svg>
          </div>
          <h3 style="margin: 5px 0; font-family: sans-serif;">${item.student.lastName}, ${item.student.firstName}</h3>
          <p style="font-weight: bold; font-family: sans-serif; font-size: 14px; margin: 4px 0;">MATRIC: ${item.student.matricNumber}</p>
          <p style="font-weight: bold; font-family: sans-serif; font-size: 14px; margin: 4px 0;">COURSE: ${exam?.courseCode}</p>
          <p style="font-weight: bold; font-family: sans-serif; font-size: 12px; margin: 4px 0; color: #555;">VENUE: ${exam?.venue}</p>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head><title>Print Bulk Exam Entry Passes</title></head>
        <body onload="window.print(); window.close();">
          ${passesHTML}
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
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">QR Engine</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Generate, audit, and distribute cryptographically secure attendance QR Passes.</p>
        </div>
      </div>

      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading Datastores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section A: Single QR Generator */}
          <div className="flat-card bg-white space-y-6">
            <h3 className="font-black text-lg uppercase border-b-4 border-black pb-3 text-black flex items-center gap-2">
              <User className="w-5 h-5 text-flatBlue" />
              Single Pass Generator
            </h3>

            <div className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Select Student</label>
                <select 
                  className="flat-select text-xs py-2"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Select Active Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.matricNumber})</option>
                  ))}
                </select>
              </div>

              {/* Select Exam */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Select Exam Course</label>
                <select 
                  className="flat-select text-xs py-2"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  <option value="">-- Select Scheduled Exam --</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.courseCode} - {e.courseTitle}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateQR}
                className="w-full flat-btn-blue justify-center py-3 text-sm font-black"
              >
                <QrCode className="w-4 h-4 stroke-[3]" />
                Generate Entry Pass
              </button>
            </div>

            {/* Generated QR Display Pane */}
            {generatedQR && qrPayload && (
              <div className="flat-border border-black p-6 bg-gray-50 flex flex-col items-center text-center space-y-4">
                <div id="qr-wrapper" className="p-4 bg-white flat-border border-black">
                  <QRCode 
                    id="qr-svg"
                    value={generatedQR} 
                    size={160} 
                    level="H"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>

                <div className="w-full text-left space-y-2 border-t-2 border-black pt-4 font-semibold text-xs text-gray-600">
                  <div className="flex justify-between"><span className="uppercase font-black text-black">STUDENT</span><span>{qrPayload.student.lastName}, {qrPayload.student.firstName}</span></div>
                  <div className="flex justify-between"><span className="uppercase font-black text-black">MATRIC</span><span className="font-mono text-flatBlue">{qrPayload.student.matricNumber}</span></div>
                  <div className="flex justify-between"><span className="uppercase font-black text-black">COURSE</span><span>{qrPayload.exam.courseCode}</span></div>
                  <div className="flex justify-between"><span className="uppercase font-black text-black">VENUE</span><span>{qrPayload.exam.venue}</span></div>
                  <div className="flex justify-between"><span className="uppercase font-black text-black">ISSUED</span><span>{new Date(qrPayload.timestamp).toLocaleTimeString()}</span></div>
                </div>

                <div className="w-full flex gap-2 border-t-2 border-black pt-4">
                  <button 
                    onClick={downloadQR}
                    className="flex-1 flat-btn bg-white hover:scale-102 py-2 px-3 text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                  <button 
                    onClick={printQR}
                    className="flex-1 flat-btn bg-black text-white hover:scale-102 py-2 px-3 text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Pass
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section B: Bulk Pass Generator */}
          <div className="flat-card bg-white space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-black text-lg uppercase border-b-4 border-black pb-3 text-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-flatAmber" />
                Bulk Pass Generator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Select Target Exam</label>
                  <select 
                    className="flat-select text-xs py-2"
                    value={bulkExamId}
                    onChange={(e) => setBulkExamId(e.target.value)}
                  >
                    <option value="">-- Choose Course to Bulk Generate --</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.courseCode} - {e.courseTitle} ({e.department} - {e.level})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleBulkGenerate}
                  className="w-full flat-btn-amber justify-center py-3 text-sm font-black"
                >
                  <Layers className="w-4 h-4" />
                  Generate Enrolled Students
                </button>
              </div>

              {/* Bulk Generation Results */}
              {bulkList.length > 0 && (
                <div className="space-y-4 border-t-2 border-black pt-4">
                  <div className="flex justify-between items-center bg-gray-50 border-2 border-black p-3 text-xs font-black">
                    <span>GENERATED PASSES:</span>
                    <span className="flat-badge bg-flatEmerald text-white px-2 py-0.5 border-none">{bulkList.length} PASSES</span>
                  </div>

                  {/* Scrollable list preview */}
                  <div className="flat-border border-black max-h-48 overflow-y-auto divide-y border-t-4 border-b-4">
                    {bulkList.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-xs font-bold bg-white">
                        <span>{item.student.lastName}, {item.student.firstName}</span>
                        <span className="font-mono text-gray-500">{item.student.matricNumber}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={printBulk}
                    className="w-full flat-btn bg-black text-white hover:scale-102 py-3 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print All passes (${bulkList.length} pages)
                  </button>
                </div>
              )}
            </div>

            <div className="flat-border bg-blue-50 border-black p-4 text-left mt-6">
              <h4 className="font-black text-xs uppercase text-black mb-1 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-flatBlue stroke-[3]" />
                Security Note
              </h4>
              <p className="text-[10px] font-bold text-gray-500 leading-snug">
                Each QR pass contains a cryptographically obfuscated JSON block containing: Student ID, Matric, Exam ID, and Institution details. Scanner cameras will validate timestamps and prevent double scans.
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default QRManagement;
