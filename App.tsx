
import React, { useState, useCallback, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  FileArchive,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ImageFile, ConversionStatus } from './types';
import { convertToJpg, createZip } from './services/converter';
import BrutalistButton from './components/BrutalistButton';
import FileCard from './components/FileCard';

const App: React.FC = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Add explicit type for file to fix 'unknown' type error in URL.createObjectURL
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: ConversionStatus.IDLE
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  };

  const convertAll = async () => {
    setIsProcessing(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === ConversionStatus.COMPLETED) continue;

      updatedFiles[i] = { ...updatedFiles[i], status: ConversionStatus.PROCESSING };
      setFiles([...updatedFiles]);

      try {
        const jpgBlob = await convertToJpg(updatedFiles[i].file);
        updatedFiles[i] = { 
          ...updatedFiles[i], 
          status: ConversionStatus.COMPLETED, 
          convertedBlob: jpgBlob 
        };
      } catch (err) {
        updatedFiles[i] = { 
          ...updatedFiles[i], 
          status: ConversionStatus.ERROR, 
          error: 'Conversion failed' 
        };
      }
      setFiles([...updatedFiles]);
    }
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === ConversionStatus.COMPLETED && f.convertedBlob);
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      const file = completedFiles[0];
      const url = URL.createObjectURL(file.convertedBlob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.file.name.split('.')[0]}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const zipBlob = await createZip(completedFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-images-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2">
            JPG<span className="text-yellow-400">.</span>RAW
          </h1>
          <p className="bg-black text-white px-3 py-1 text-lg font-bold inline-block brutal-shadow-sm">
            Fast. Client-side. Brutal.
          </p>
        </div>
        
        <div className="flex gap-4">
          <BrutalistButton 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-lime-400"
            disabled={isProcessing}
          >
            <Plus className="w-6 h-6" />
            <span>ADD IMAGES</span>
          </BrutalistButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </header>

      {/* Main Area */}
      <main className="w-full max-w-5xl flex-1 flex flex-col">
        {files.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-8 border-dashed border-black bg-white flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-zinc-50 transition-colors brutal-shadow"
          >
            <ImageIcon className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-black uppercase mb-2">Drop it like it's hot</h2>
            <p className="text-xl font-bold">Or click anywhere to upload your images</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white border-4 border-black p-4 md:p-6 brutal-shadow">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <span className="text-2xl font-black uppercase">{files.length} FILES SELECTED</span>
                <button 
                  onClick={clearAll}
                  className="text-red-600 hover:underline font-bold text-sm uppercase tracking-wider"
                >
                  CLEAR ALL
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <BrutalistButton 
                  onClick={convertAll} 
                  className="bg-cyan-400 w-full sm:w-auto justify-center"
                  disabled={isProcessing || files.every(f => f.status === ConversionStatus.COMPLETED)}
                >
                  {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                  <span>CONVERT ALL</span>
                </BrutalistButton>
                
                <BrutalistButton 
                  onClick={downloadAll} 
                  className="bg-pink-400 w-full sm:w-auto justify-center"
                  disabled={isProcessing || !files.some(f => f.status === ConversionStatus.COMPLETED)}
                >
                  {files.filter(f => f.status === ConversionStatus.COMPLETED).length > 1 ? <FileArchive className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                  <span>DOWNLOAD {files.filter(f => f.status === ConversionStatus.COMPLETED).length > 1 ? 'ZIP' : 'JPG'}</span>
                </BrutalistButton>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {files.map((file) => (
                <FileCard 
                  key={file.id} 
                  fileData={file} 
                  onRemove={() => removeFile(file.id)} 
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Sticker */}
      <footer className="mt-12 mb-8 w-full max-w-5xl flex flex-col items-center relative">
        <div className="rotate-[-2deg]">
          <div className="bg-black text-yellow-400 p-4 border-4 border-black brutal-shadow font-black text-xl uppercase italic">
            No servers involved. Your privacy is our priority.
          </div>
        </div>
        <div className="absolute bottom-[-1.5rem] right-0 md:right-0 text-[10px] font-bold opacity-40 uppercase tracking-widest pointer-events-none">
          Version 1.2
        </div>
      </footer>
    </div>
  );
};

export default App;
