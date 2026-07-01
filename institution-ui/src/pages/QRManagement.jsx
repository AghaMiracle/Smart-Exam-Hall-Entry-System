import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import QRCode from 'react-qr-code';
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
  const [generating, setGenerating] = useState(false);

  // Exam Hall (shared) QR Generator
  const [bulkExamId, setBulkExamId] = useState('');
  const [examQR, setExamQR] = useState('');
  const [examQRInfo, setExamQRInfo] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const qrRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentList = await api.students.list({ limit: 1000 });
        const examList = await api.exams.list({ limit: 1000 });
        setStudents((studentList || []).filter(s => s.status === 'active'));
        setExams((examList || []).filter(e => ['upcoming', 'active'].includes(e.status)));
      } catch (err) {
        showToast('Failed to fetch generator references', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Single QR Generation (calls backend — persists + AES-encrypts the payload)
  const handleGenerateQR = async () => {
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

    setGenerating(true);
    try {
      const qrCode = await api.qrCodes.generate({
        studentId: selectedStudentId,
        examId: selectedExamId,
      });

      // Encode the backend's REAL encrypted payload so the student scanner
      // can decrypt it and find the matching record in the database.
      setGeneratedQR(qrCode.encryptedPayload);
      setQrPayload({ student, exam, timestamp: qrCode.createdAt || new Date().toISOString() });
      showToast('Secure Exam QR Token successfully generated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate QR code.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Exam Hall QR: ONE shared code per exam. Any registered student scans it and
  // the backend identifies them from their login session to record attendance.
  const handleBulkGenerate = async () => {
    if (!bulkExamId) {
      showToast('Please select an exam course code.', 'warning');
      return;
    }

    const exam = exams.find(e => e.id === bulkExamId);
    setBulkGenerating(true);
    try {
      const qrCode = await api.qrCodes.generateExamQR(bulkExamId);
      setExamQR(qrCode.encryptedPayload);
      setExamQRInfo({ exam, qrBase64: qrCode.qrBase64 });
      showToast('Exam hall QR ready — display it at the entrance for students to scan.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate exam hall QR.', 'error');
      setExamQR('');
      setExamQRInfo(null);
    } finally {
      setBulkGenerating(false);
    }
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
            <p>COURSE: ${qrPayload?.exam.courseCode} - ${qrPayload?.exam.title}</p>
            <p>VENUE: ${qrPayload?.exam.venue}</p>
            <p>DATE: ${qrPayload?.exam.examDate ? new Date(qrPayload.exam.examDate).toLocaleDateString() : ''} @ ${qrPayload?.exam.startTime || ''}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Print the single shared exam hall QR poster
  const printExamQR = () => {
    if (!examQRInfo?.qrBase64) return;
    const exam = examQRInfo.exam;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Hall Entry QR</title>
          <style>
            body { font-family: 'Arial', sans-serif; text-align: center; padding: 40px; }
            .poster { border: 4px solid #000; padding: 40px; max-width: 520px; margin: 0 auto; }
            h1 { margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; }
            h2 { margin: 4px 0; }
            p { font-weight: bold; margin: 6px 0; }
            .qr { margin: 30px auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="poster">
            <h1>Exam Hall Entry</h1>
            <h2>${exam?.courseCode} - ${exam?.title || ''}</h2>
            <div class="qr"><img src="${examQRInfo.qrBase64}" alt="Exam QR" width="320" height="320" /></div>
            <p>VENUE: ${exam?.venue || ''}</p>
            <p>ELIGIBLE: ${exam?.department || ''} — ${exam?.level || ''}</p>
            <p style="font-size:12px;color:#555;">Scan with the student app to verify your identity and record attendance.</p>
          </div>
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
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Generate and distribute secure QR Passes to display at exam hall entrances for student scanning.</p>
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
                    <option key={e.id} value={e.id}>{e.courseCode} - {e.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={generating}
                className="w-full flat-btn-blue justify-center py-3 text-sm font-black disabled:opacity-60"
              >
                <QrCode className="w-4 h-4 stroke-[3]" />
                {generating ? 'Generating…' : 'Generate Entry Pass'}
              </button>
            </div>

            {/* Generated QR Display Pane */}
            {generatedQR && qrPayload && (
              <div className="flat-border border-black p-6 bg-gray-50 flex flex-col items-center text-center space-y-4">
                <div id="qr-wrapper" className="p-4 bg-white flat-border border-black">
                  <QRCode 
                    id="qr-svg"
                    value={generatedQR} 
                    size={260} 
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
                Exam Hall QR
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
                      <option key={e.id} value={e.id}>{e.courseCode} - {e.title} ({e.department} - {e.level})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkGenerating}
                  className="w-full flat-btn-amber justify-center py-3 text-sm font-black disabled:opacity-60"
                >
                  <Layers className="w-4 h-4" />
                  {bulkGenerating ? 'Generating…' : 'Generate Exam Hall QR'}
                </button>
              </div>

              {/* Generated Exam Hall QR */}
              {examQR && examQRInfo && (
                <div className="flat-border border-black p-6 bg-gray-50 flex flex-col items-center text-center space-y-4">
                  <div id="exam-qr-wrapper" className="p-4 bg-white flat-border border-black">
                    <QRCode
                      value={examQR}
                      size={280}
                      level="H"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>

                  <div className="w-full text-left space-y-2 border-t-2 border-black pt-4 font-semibold text-xs text-gray-600">
                    <div className="flex justify-between"><span className="uppercase font-black text-black">COURSE</span><span>{examQRInfo.exam?.courseCode} - {examQRInfo.exam?.title}</span></div>
                    <div className="flex justify-between"><span className="uppercase font-black text-black">VENUE</span><span>{examQRInfo.exam?.venue}</span></div>
                    <div className="flex justify-between"><span className="uppercase font-black text-black">ELIGIBLE</span><span>{examQRInfo.exam?.department} — {examQRInfo.exam?.level}</span></div>
                  </div>

                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-snug">
                    One shared code for the whole hall — every registered student scans this same QR to verify.
                  </p>

                  <div className="w-full flex gap-2 border-t-2 border-black pt-4">
                    <a
                      href={examQRInfo.qrBase64}
                      download={`ExamQR_${examQRInfo.exam?.courseCode || 'exam'}.png`}
                      className="flex-1 flat-btn bg-white hover:scale-102 py-2 px-3 text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG
                    </a>
                    <button
                      onClick={printExamQR}
                      className="flex-1 flat-btn bg-black text-white hover:scale-102 py-2 px-3 text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print QR
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flat-border bg-blue-50 border-black p-4 text-left mt-6">
              <h4 className="font-black text-xs uppercase text-black mb-1 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-flatBlue stroke-[3]" />
                Security Note
              </h4>
              <p className="text-[10px] font-bold text-gray-500 leading-snug">
                The exam hall QR encodes an AES-encrypted Exam ID + Institution payload. Display this single code at the entrance — each registered student scans it with the student app, and the system identifies them from their login session to record attendance.
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default QRManagement;
