import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { encodeQR } from '../services/mockDataService';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  User, 
  BookOpen, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export const Scanner = () => {
  const { showToast } = useToast();
  
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected exam to scan for
  const [activeExamId, setActiveExamId] = useState('');
  
  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { verified: boolean, reason: string, student: {}, exam: {}, checkInTime: '' }
  
  // Simulator state
  const [simStudentId, setSimStudentId] = useState('');
  const [simExpired, setSimExpired] = useState(false);
  const [simWrongExam, setSimWrongExam] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examList = await api.exams.list();
        const studentList = await api.students.list('INST-001'); // fetch all students
        setExams(examList.filter(e => e.status === 'Active'));
        setStudents(studentList);
      } catch (err) {
        showToast('Failed to load validation contexts', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Web camera scanner bootstrap
  useEffect(() => {
    let scanner = null;
    
    if (scanning && activeExamId) {
      // Initialize html5-qrcode scanner
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0
      });

      scanner.render(
        async (decodedText) => {
          // Success callback
          scanner.clear();
          setScanning(false);
          await processScan(decodedText);
        },
        (error) => {
          // Silent log to prevent console flood
        }
      );
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [scanning, activeExamId]);

  const processScan = async (qrString) => {
    try {
      const result = await api.attendance.verifyQR(qrString, activeExamId);
      setScanResult(result);
      if (result.verified) {
        showToast(`Verified: ${result.student.firstName} ${result.student.lastName}`, 'success');
      } else {
        showToast(`Rejected: ${result.reason}`, 'error');
      }
    } catch (e) {
      showToast('Scan failed: Invalid token data', 'error');
      setScanResult({
        verified: false,
        reason: 'Invalid QR',
        student: null,
        exam: null
      });
    }
  };

  // Simulator helper: lets user test QR scan without physical camera
  const handleSimulateScan = async () => {
    if (!activeExamId) {
      showToast('Please select the active exam course first.', 'warning');
      return;
    }
    if (!simStudentId) {
      showToast('Please select a student to simulate.', 'warning');
      return;
    }

    const student = students.find(s => s.id === simStudentId);
    let exam = exams.find(e => e.id === activeExamId);

    if (simWrongExam) {
      // Pick another active exam in DB to simulate scanning for the wrong code
      const wrong = exams.find(e => e.id !== activeExamId);
      if (wrong) exam = wrong;
    }

    // Set custom timestamp
    let timestamp = new Date().toISOString();
    if (simExpired) {
      // Generate timestamp 2 hours ago
      timestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    }

    const payload = {
      studentId: student.id,
      matricNumber: student.matricNumber,
      examId: exam.id,
      institutionId: 'INST-001',
      timestamp
    };

    const simulatedQR = encodeQR(payload);
    await processScan(simulatedQR);
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setScanning(false);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Staff Scanner</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Manual override — Staff can verify student QR passes directly as a backup verification method.</p>
        </div>
      </div>

      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading Datastores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column A & B: Scanner View & Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Exam Selector (Required first) */}
            <div className="flat-card bg-white">
              <h3 className="font-black text-xs uppercase text-black mb-3">1. Select Active Exam to Audit</h3>
              <select
                className="flat-select text-sm py-2.5"
                value={activeExamId}
                onChange={(e) => {
                  setActiveExamId(e.target.value);
                  handleResetScanner();
                }}
              >
                <option value="">-- Choose Course for Entrance Checkpoints --</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.courseCode} - {e.courseTitle} ({e.venue})</option>
                ))}
              </select>
            </div>

            {/* SCANNING & RESULT PANELS */}
            {activeExamId && (
              <div className="flat-card bg-white flex flex-col items-center">
                
                {/* Result display (Overlay/Block) */}
                {scanResult ? (
                  <div className="w-full text-center space-y-6">
                    {/* Grant Header Indicator */}
                    <div 
                      className={`flat-border p-6 flex flex-col items-center text-white select-none ${
                        scanResult.verified ? 'bg-flatEmerald' : 'bg-red-500'
                      }`}
                    >
                      {scanResult.verified ? (
                        <CheckCircle className="w-16 h-16 stroke-[2.5]" />
                      ) : (
                        <XCircle className="w-16 h-16 stroke-[2.5]" />
                      )}
                      <h2 className="text-3xl font-black uppercase mt-3 tracking-wide">
                        {scanResult.verified ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </h2>
                      <span className="text-xs font-bold bg-black text-white px-3 py-1 mt-2 flat-border-sm uppercase border-white">
                        Reason: {scanResult.reason}
                      </span>
                    </div>

                    {/* Student details display */}
                    {scanResult.student && (
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4 text-left border-2 border-black bg-gray-50">
                        {scanResult.student.passportPhoto && (
                          <img
                            src={scanResult.student.passportPhoto}
                            alt="Student Passport"
                            className="w-24 h-24 border-4 border-black object-cover shrink-0 mx-auto md:mx-0"
                          />
                        )}
                        <div className="space-y-2 flex-1">
                          <h3 className="font-black text-lg uppercase text-black leading-tight">
                            {scanResult.student.lastName}, {scanResult.student.firstName}
                          </h3>
                          <span className="flat-badge bg-white text-xs border-2 py-0.5 px-2 font-black uppercase border-black">
                            Matric: {scanResult.student.matricNumber}
                          </span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-extrabold text-gray-500 uppercase pt-2 border-t border-gray-300">
                            <div>DEPT: <span className="text-black font-black">{scanResult.student.department}</span></div>
                            <div>LEVEL: <span className="text-black font-black">{scanResult.student.level}</span></div>
                            <div>GENDER: <span className="text-black font-black">{scanResult.student.gender}</span></div>
                            <div>STATUS: <span className="text-black font-black">{scanResult.student.status}</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exam scheduled details */}
                    {scanResult.exam && (
                      <div className="p-4 text-left border-2 border-black bg-gray-50 space-y-1 font-bold text-xs text-gray-600">
                        <h4 className="font-black uppercase text-black text-xs border-b border-gray-300 pb-1 mb-2">Verified Exam Schedule</h4>
                        <div className="flex justify-between"><span>Course</span><span className="font-extrabold text-black uppercase">{scanResult.exam.courseCode} - {scanResult.exam.courseTitle}</span></div>
                        <div className="flex justify-between"><span>Venue</span><span className="font-extrabold text-black">{scanResult.exam.venue}</span></div>
                        <div className="flex justify-between"><span>Check-in Time</span><span className="font-extrabold text-flatBlue font-mono">{scanResult.checkInTime ? new Date(scanResult.checkInTime).toLocaleString() : 'N/A'}</span></div>
                      </div>
                    )}

                    {/* Reset Button */}
                    <button
                      onClick={handleResetScanner}
                      className="w-full flat-btn bg-black text-white hover:scale-102 flex items-center justify-center gap-2 py-3"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Scan Next Student
                    </button>
                  </div>
                ) : (
                  // Webcam Scanner Stream View
                  <div className="w-full flex flex-col items-center py-4">
                    {scanning ? (
                      <div className="w-full max-w-[300px] md:max-w-sm flex flex-col items-center">
                        {/* Video Viewport */}
                        <div id="qr-reader" className="w-full flat-border border-black bg-black overflow-hidden aspect-square" />
                        
                        <button
                          onClick={() => setScanning(false)}
                          className="flat-btn-danger w-full mt-4 text-xs font-black"
                        >
                          Cancel Camera Scan
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12 flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-gray-100 border-4 border-dashed border-black flex items-center justify-center">
                          <Camera className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-black uppercase text-black">Ready to manually verify student</h3>
                        <p className="text-xs font-bold text-gray-500 max-w-xs uppercase leading-snug">
                          Use this as a backup — scan a student's QR pass to manually verify their identity at the exam hall entrance.
                        </p>
                        <button
                          onClick={() => setScanning(true)}
                          className="flat-btn-blue text-sm font-black px-8 py-3.5"
                        >
                          Start Scanning View
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column C: QR Simulator (DEMO UTILITY) */}
          <div className="space-y-6">
            <div className="flat-card bg-white space-y-4">
              <h3 className="font-black text-lg uppercase border-b-4 border-black pb-3 text-black flex items-center gap-1.5">
                <Play className="w-5 h-5 text-flatBlue" />
                Demo Simulator
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase leading-snug">
                Audit access control policies offline. Selecting a mock student generates a simulated scan token instantly.
              </p>

              {/* Select student to mock */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Simulate Student</label>
                  <select
                    className="flat-select text-xs py-2 bg-no-repeat"
                    value={simStudentId}
                    onChange={(e) => setSimStudentId(e.target.value)}
                  >
                    <option value="">-- Choose Mock Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.lastName}, {s.firstName} ({s.status} - {s.matricNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulation Rule Options */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 font-extrabold text-xs text-black cursor-pointer">
                    <input
                      type="checkbox"
                      className="flat-border-sm w-4 h-4 border-black rounded-none shrink-0"
                      checked={simExpired}
                      onChange={(e) => setSimExpired(e.target.checked)}
                    />
                    <span>SIMULATE EXPIRED QR PASS</span>
                  </label>
                  <label className="flex items-center gap-2 font-extrabold text-xs text-black cursor-pointer">
                    <input
                      type="checkbox"
                      className="flat-border-sm w-4 h-4 border-black rounded-none shrink-0"
                      checked={simWrongExam}
                      onChange={(e) => setSimWrongExam(e.target.checked)}
                    />
                    <span>SIMULATE WRONG EXAM PASS</span>
                  </label>
                </div>

                <button
                  onClick={handleSimulateScan}
                  className="w-full flat-btn bg-black text-white hover:scale-102 font-black py-2.5 mt-4 flex items-center justify-center gap-2 uppercase text-xs cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Simulate QR scan
                </button>
              </div>
            </div>

            {/* Verification Reasons Info */}
            <div className="flat-card bg-gray-50 border-black space-y-4">
              <h4 className="font-black text-xs uppercase text-black border-b-2 border-black pb-2">Verification Rules</h4>
              <ul className="space-y-2 text-[10px] font-bold text-gray-500 uppercase leading-snug">
                <li><span className="text-flatEmerald font-black">✔ Green Verified:</span> Access granted. Student credentials match scheduled course, account is active, pass timestamp valid.</li>
                <li><span className="text-red-500 font-black">✖ Invalid QR:</span> QR payload corrupt or invalid signature checksum.</li>
                <li><span className="text-red-500 font-black">✖ Expired QR:</span> Passes expire after 30 minutes.</li>
                <li><span className="text-red-500 font-black">✖ Already Used:</span> Double-entry prevention. Token has already been scanned.</li>
                <li><span className="text-red-500 font-black">✖ Wrong Exam:</span> Student is trying to check into an exam they are not registered/audited for today.</li>
                <li><span className="text-red-500 font-black">✖ Suspended Student:</span> Admin suspended credentials. Access denied.</li>
              </ul>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Scanner;
