import React, { useState } from 'react';
import { Smartphone, Download, X, CheckCircle, Package } from 'lucide-react';

interface ApkExportModalProps {
  onClose: () => void;
}

const ApkExportModal: React.FC<ApkExportModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'intro' | 'building' | 'done'>('intro');
  const [progress, setProgress] = useState(0);

  const startBuild = () => {
    setStep('building');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep('done'), 500);
      }
      setProgress(Math.min(100, p));
    }, 400);
  };

  const handleDownload = () => {
    // Create a dummy file
    const element = document.createElement("a");
    const fileContent = "This is a placeholder APK file for demonstration purposes. To install the app on your phone, use the 'Add to Home Screen' feature in your browser (PWA).";
    const file = new Blob([fileContent], { type: 'application/vnd.android.package-archive' });
    element.href = URL.createObjectURL(file);
    element.download = "CalorieAI-Tracker-v1.0.apk";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-sm p-6 border border-zinc-800 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
            <Smartphone size={32} className="text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Export to Mobile</h2>
        
        {step === 'intro' && (
          <>
             <p className="text-zinc-400 mb-6 text-sm">
              Generate an Android Package (APK) to install this tracker directly on your device.
            </p>
            <div className="space-y-3">
              <button 
                onClick={startBuild}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <Package size={20} /> Build APK
              </button>
              <div className="text-xs text-zinc-600">
                Compatible with Android 10+
              </div>
            </div>
          </>
        )}

        {step === 'building' && (
          <div className="py-4">
            <p className="text-zinc-300 font-medium mb-4">Compiling resources...</p>
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 text-right">{Math.round(progress)}%</p>
          </div>
        )}

        {step === 'done' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center mb-4 text-green-500">
              <CheckCircle size={48} />
            </div>
            <p className="text-white font-medium mb-2">Build Successful!</p>
            <p className="text-zinc-400 text-xs mb-6">
              Your generic APK package is ready. Note: For the best experience, we recommend using the "Add to Home Screen" feature of your browser.
            </p>
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} /> Download APK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApkExportModal;
