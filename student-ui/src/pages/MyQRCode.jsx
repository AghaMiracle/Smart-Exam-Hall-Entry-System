import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  ShieldCheck,
  ScanLine,
  RotateCcw,
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';

export const MyQRCode = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);

  // Request camera permission explicitly before starting the scanner
  const requestCameraPermission = async () => {
    setCameraError(null);
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use a modern browser like Chrome or Firefox.');
        return false;
      }

      // Request camera access — this triggers the browser permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Stop the stream immediately — the scanner library will handle its own stream
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permission in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please ensure your device has a working camera.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is in use by another application. Please close other camera apps and try again.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error occurred'}`);
      }
      return false;
    }
  };

  // Start/Stop scanner
  useEffect(() => {
    if (scanning) {
      // Small delay to let the DOM render the container
      const timeout = setTimeout(() => {
        const scanner = new Html5QrcodeScanner('student-qr-reader', {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        });

        scannerRef.current = scanner;

        scanner.render(
          async (decodedText) => {
            // Success callback — pause scanner and process
            scanner.clear();
            scannerRef.current = null;
            setScanning(false);
            await handleScanResult(decodedText);
          },
          (error) => {
            // Scan error — silent (prevents console flood)
          }
        );
      }, 150);

      return () => {
        clearTimeout(timeout);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {
            // ignore
          }
          scannerRef.current = null;
        }
      };
    }
  }, [scanning]);

  const handleScanResult = async (qrString) => {
    setProcessing(true);
    try {
      const result = await api.qrCodes.verify(qrString);
      setScanResult(result);
      if (result.verified) {
        showToast('Student Verified — Entry Approved!', 'success');
      } else {
        showToast(`Verification Failed: ${result.reason}`, 'error');
      }
    } catch (err) {
      const errorMessage = err.message || 'Verification failed';
      setScanResult({
        verified: false,
        reason: errorMessage,
        status: 'ERROR',
        student: null,
        exam: null,
      });
      showToast(`Scan Error: ${errorMessage}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setScanning(false);
    setCameraError(null);
  };

  const startScanning = async () => {
    setScanResult(null);
    setCameraError(null);
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setScanning(true);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Scan Entry QR</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Scan the QR code displayed at the exam hall entrance for verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left: Scanner Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flat-card bg-white flex flex-col items-center">
            
            {/* Processing Overlay */}
            {processing && (
              <div className="w-full text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-t-flatBlue border-black rounded-full animate-spin mb-6" />
                <h3 className="text-xl font-black uppercase text-black">Verifying Identity...</h3>
                <p className="text-xs font-bold text-gray-500 uppercase mt-2">Please wait while we validate your credentials</p>
              </div>
            )}

            {/* Result Display */}
            {!processing && scanResult && (
              <div className="w-full text-center space-y-6">
                {/* Verification Status Banner */}
                <div 
                  className={`flat-border p-8 flex flex-col items-center text-white select-none ${
                    scanResult.verified ? 'bg-flatEmerald' : 'bg-red-500'
                  }`}
                >
                  {scanResult.verified ? (
                    <CheckCircle className="w-20 h-20 stroke-[2.5]" />
                  ) : (
                    <XCircle className="w-20 h-20 stroke-[2.5]" />
                  )}
                  <h2 className="text-3xl md:text-4xl font-black uppercase mt-4 tracking-wide">
                    {scanResult.verified ? 'STUDENT VERIFIED' : 'VERIFICATION FAILED'}
                  </h2>
                  <p className="text-sm font-bold mt-2 bg-black text-white px-4 py-1.5 flat-border-sm uppercase border-white">
                    {scanResult.verified ? 'Entry Approved — Proceed to exam hall' : scanResult.reason}
                  </p>
                </div>

                {/* Student Details (on success) */}
                {scanResult.verified && scanResult.student && (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 text-left border-2 border-black bg-gray-50">
                    {scanResult.student.photo && (
                      <img
                        src={scanResult.student.photo}
                        alt="Student Passport"
                        className="w-24 h-24 border-4 border-black object-cover shrink-0 mx-auto md:mx-0"
                      />
                    )}
                    <div className="space-y-2 flex-1">
                      <h3 className="font-black text-xl uppercase text-black leading-tight">
                        {scanResult.student.name}
                      </h3>
                      <span className="flat-badge bg-white text-xs border-2 py-0.5 px-2 font-black uppercase border-black inline-block">
                        Matric: {scanResult.student.matricNumber}
                      </span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-extrabold text-gray-500 uppercase pt-2 border-t border-gray-300">
                        <div>DEPT: <span className="text-black font-black">{scanResult.student.department}</span></div>
                        <div>LEVEL: <span className="text-black font-black">{scanResult.student.level}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exam Details (if available) */}
                {scanResult.exam && (
                  <div className="p-4 text-left border-2 border-black bg-gray-50 space-y-2 font-bold text-xs text-gray-600">
                    <h4 className="font-black uppercase text-black text-xs border-b border-gray-300 pb-1 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-flatBlue" />
                      Exam Details
                    </h4>
                    <div className="flex justify-between">
                      <span>Course</span>
                      <span className="font-extrabold text-black uppercase">{scanResult.exam.courseCode} - {scanResult.exam.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venue</span>
                      <span className="font-extrabold text-black">{scanResult.exam.venue}</span>
                    </div>
                  </div>
                )}

                {/* Scan Again Button */}
                <button
                  onClick={handleReset}
                  className="w-full flat-btn bg-black text-white hover:scale-102 flex items-center justify-center gap-2 py-3.5 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  Scan Another QR Code
                </button>
              </div>
            )}

            {/* Scanner / Start State */}
            {!processing && !scanResult && (
              <div className="w-full flex flex-col items-center py-4">
                {scanning ? (
                  <div className="w-full max-w-[340px] md:max-w-md flex flex-col items-center">
                    {/* QR Scanner Container */}
                    <div id="student-qr-reader" className="w-full flat-border border-black bg-black overflow-hidden" />
                    
                    <button
                      onClick={() => setScanning(false)}
                      className="flat-btn bg-red-500 text-white border-red-700 hover:scale-102 w-full mt-4 text-xs font-black cursor-pointer py-2.5"
                    >
                      Cancel Scan
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center space-y-5">
                    <div className="w-24 h-24 bg-gray-100 border-4 border-dashed border-black flex items-center justify-center relative">
                      <Camera className="w-12 h-12 text-gray-600" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-flatBlue border-2 border-black flex items-center justify-center">
                        <ScanLine className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black uppercase text-black">Ready to Scan</h3>
                    <p className="text-xs font-bold text-gray-500 max-w-sm uppercase leading-snug px-4">
                      Point your camera at the QR code displayed at the exam hall entrance to verify your identity and gain entry.
                    </p>

                    {/* Camera Error Message */}
                    {cameraError && (
                      <div className="w-full max-w-sm bg-red-50 border-2 border-red-500 p-4 text-left space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-black text-red-700 uppercase">Camera Access Error</h4>
                            <p className="text-[11px] font-bold text-red-600 mt-1 leading-snug">{cameraError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={startScanning}
                      className="flat-btn-blue text-sm font-black px-10 py-4 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 stroke-[2.5]" />
                      {cameraError ? 'Retry Camera Scanner' : 'Start Camera Scanner'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info Card */}
          <div className="flat-card bg-white space-y-4">
            <h3 className="font-black text-sm uppercase border-b-2 border-black pb-2 text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-flatEmerald" />
              Your Identity
            </h3>
            <div className="flex items-center gap-4">
              {user?.passportPhoto && (
                <img
                  src={user.passportPhoto}
                  alt="Student"
                  className="w-16 h-16 border-3 border-black object-cover shrink-0"
                />
              )}
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase text-black">{user?.lastName}, {user?.firstName}</h4>
                <span className="font-mono text-xs text-flatBlue font-black">{user?.matricNumber}</span>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{user?.department} — {user?.level}</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="flat-card bg-gray-50 border-black space-y-4">
            <h4 className="font-black text-xs uppercase text-black border-b-2 border-black pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-flatAmber" />
              How It Works
            </h4>
            <ol className="space-y-3 text-[10px] font-bold text-gray-500 uppercase leading-snug">
              <li className="flex items-start gap-2">
                <span className="flat-border-sm bg-black text-white w-5 h-5 flex items-center justify-center shrink-0 font-black text-[9px]">1</span>
                <span>Your institution generates a secure QR code for your exam session.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flat-border-sm bg-black text-white w-5 h-5 flex items-center justify-center shrink-0 font-black text-[9px]">2</span>
                <span>The QR code is displayed at the exam hall entrance by staff.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flat-border-sm bg-black text-white w-5 h-5 flex items-center justify-center shrink-0 font-black text-[9px]">3</span>
                <span>Tap "Start Camera Scanner" and point your phone at the QR code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flat-border-sm bg-flatEmerald text-white w-5 h-5 flex items-center justify-center shrink-0 font-black text-[9px]">✓</span>
                <span><span className="text-flatEmerald font-black">Student Verified</span> — Your identity is confirmed and attendance is recorded.</span>
              </li>
            </ol>
          </div>

          {/* Verification Status Legend */}
          <div className="flat-card bg-white border-black space-y-3">
            <h4 className="font-black text-xs uppercase text-black border-b-2 border-black pb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-flatBlue" />
              Status Codes
            </h4>
            <ul className="space-y-2 text-[10px] font-bold text-gray-500 uppercase leading-snug">
              <li><span className="text-flatEmerald font-black">✔ Verified:</span> Identity confirmed. Proceed to exam hall.</li>
              <li><span className="text-red-500 font-black">✖ Invalid QR:</span> The QR code is corrupt or unrecognized.</li>
              <li><span className="text-red-500 font-black">✖ Expired:</span> QR code validity period has elapsed.</li>
              <li><span className="text-red-500 font-black">✖ Already Used:</span> You have already been verified for this exam.</li>
              <li><span className="text-red-500 font-black">✖ Wrong Student:</span> This QR was not generated for your account.</li>
              <li><span className="text-red-500 font-black">✖ Account Issue:</span> Your student account is suspended.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQRCode;
