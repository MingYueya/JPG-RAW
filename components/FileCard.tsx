
import React from 'react';
import { Trash2, CheckCircle2, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { ImageFile, ConversionStatus } from '../types';

interface FileCardProps {
  fileData: ImageFile;
  onRemove: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ fileData, onRemove }) => {
  const { file, previewUrl, status, error, convertedBlob } = fileData;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!convertedBlob) return;
    
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.split('.')[0]}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusOverlay = () => {
    switch (status) {
      case ConversionStatus.PROCESSING:
        return (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center p-4">
            <RefreshCw className="w-12 h-12 text-cyan-600 animate-spin mb-2" />
            <span className="font-black uppercase">Processing...</span>
          </div>
        );
      case ConversionStatus.COMPLETED:
        return (
          <div className="absolute inset-0 bg-lime-400/80 flex flex-col items-center justify-center p-4">
            <CheckCircle2 className="w-12 h-12 text-black mb-2" />
            <span className="font-black uppercase text-center">Ready for download</span>
          </div>
        );
      case ConversionStatus.ERROR:
        return (
          <div className="absolute inset-0 bg-red-400/80 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 text-white mb-2" />
            <span className="font-black uppercase text-center">{error || 'Failed'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative bg-white border-4 border-black brutal-shadow flex flex-col">
      {/* Image Preview Container */}
      <div className="relative aspect-video overflow-hidden border-b-4 border-black bg-zinc-100">
        <img 
          src={previewUrl} 
          alt={file.name} 
          className="w-full h-full object-cover"
        />
        {getStatusOverlay()}
        
        {/* Action Buttons Container */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          {/* Remove Button */}
          <button 
            onClick={onRemove}
            className="p-2 bg-white border-2 border-black brutal-shadow-sm hover:bg-red-500 hover:text-white transition-colors"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Individual Download Button - Only shown if completed */}
          {status === ConversionStatus.COMPLETED && convertedBlob && (
            <button 
              onClick={handleDownload}
              className="p-2 bg-white border-2 border-black brutal-shadow-sm hover:bg-lime-400 hover:text-black transition-colors"
              title="Download JPG"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="p-4 bg-zinc-50">
        <h3 className="font-black truncate text-sm" title={file.name}>{file.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs font-bold text-zinc-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
          <span className="text-xs font-black uppercase px-2 py-0.5 border-2 border-black">
            {file.type.split('/')[1] || 'IMG'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
