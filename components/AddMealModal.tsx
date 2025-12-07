import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Type, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeFoodText, analyzeFoodImage } from '../services/geminiService';
import { GeminiAnalysisResult, Meal } from '../types';

interface AddMealModalProps {
  onClose: () => void;
  onAdd: (meal: Meal) => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ onClose, onAdd }) => {
  const [mode, setMode] = useState<'text' | 'camera'>('text');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setMode('camera');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error", err);
      alert("Could not access camera. Please allow permissions.");
      setMode('text');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(dataUrl);
        stopCamera();
        handleAnalyzeImage(dataUrl);
      }
    }
  };

  const handleAnalyzeText = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodText(inputText);
      setAnalysis(result);
    } catch (e) {
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(base64);
      setAnalysis(result);
    } catch (e) {
      alert("Failed to analyze image.");
      setPreviewImage(null);
      startCamera(); // restart if failed
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!analysis) return;
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: analysis.foodName,
      timestamp: Date.now(),
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      imageUrl: previewImage || undefined,
      note: analysis.servingSize
    };
    onAdd(newMeal);
    onClose();
  };

  // If analysis is done, show review screen
  if (analysis) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-6 border border-zinc-800 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-4">Review Meal</h2>
          
          {previewImage && (
            <img src={previewImage} alt="Food" className="w-full h-48 object-cover rounded-xl mb-4" />
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold">Name</label>
              <input 
                type="text" 
                value={analysis.foodName} 
                onChange={(e) => setAnalysis({...analysis, foodName: e.target.value})}
                className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Cals</label>
                  <input type="number" value={analysis.calories} onChange={e => setAnalysis({...analysis, calories: Number(e.target.value)})} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-center" />
               </div>
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Prot</label>
                  <input type="number" value={analysis.protein} onChange={e => setAnalysis({...analysis, protein: Number(e.target.value)})} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-center" />
               </div>
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Carb</label>
                  <input type="number" value={analysis.carbs} onChange={e => setAnalysis({...analysis, carbs: Number(e.target.value)})} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-center" />
               </div>
               <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold">Fat</label>
                  <input type="number" value={analysis.fat} onChange={e => setAnalysis({...analysis, fat: Number(e.target.value)})} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-center" />
               </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setAnalysis(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium">Back</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-500 transition-colors">Log Meal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-zinc-900 w-full max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-zinc-800 flex flex-col relative animate-slide-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Log Meal</h2>

        {/* Mode Switcher */}
        <div className="flex bg-zinc-800 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { stopCamera(); setMode('text'); }} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400'}`}
          >
            <Type size={18} /> Text
          </button>
          <button 
            onClick={startCamera} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400'}`}
          >
            <Camera size={18} /> Camera
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
              <Loader2 className="animate-spin text-green-500" size={48} />
              <p>Analyzing with Gemini AI...</p>
            </div>
          ) : mode === 'text' ? (
            <div className="flex-1 flex flex-col gap-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="E.g., 2 eggs, 1 slice of toast, and a black coffee..."
                className="w-full flex-1 bg-zinc-800/50 text-white p-4 rounded-xl border border-zinc-700 resize-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-zinc-500"
              />
              <button 
                onClick={handleAnalyzeText}
                disabled={!inputText.trim()}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Analyze Meal
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-black rounded-xl overflow-hidden relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center">
                 {/* File Upload Alternative */}
                 <label className="p-3 bg-zinc-800/80 backdrop-blur rounded-full text-white cursor-pointer hover:bg-zinc-700">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const res = reader.result as string;
                          setPreviewImage(res);
                          stopCamera();
                          handleAnalyzeImage(res);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <ImageIcon size={24} />
                 </label>

                 {/* Shutter Button */}
                 <button 
                   onClick={capturePhoto}
                   className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/20 transition-all"
                 >
                   <div className="w-12 h-12 bg-white rounded-full"></div>
                 </button>

                 <div className="w-12"></div> {/* Spacer for balance */}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddMealModal;
