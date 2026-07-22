import { useState, useRef } from 'react';
import { Upload, File, X, Check } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const FileUpload = ({
  accept,
  maxSizeMB = 10,
  label = 'Upload File',
  hint,
  onFileSelect,
  existingFileName,
  existingFileUrl,
}) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    onFileSelect && onFileSelect(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleRemove = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect && onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}

      {/* Existing file */}
      {existingFileName && !file && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-800 border border-dark-700 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dark-100 text-sm font-semibold truncate">{existingFileName}</p>
            <p className="text-emerald-400 text-xs">Previously submitted</p>
          </div>
          {existingFileUrl && (
            <a
              href={existingFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 text-xs font-semibold transition-colors"
            >
              View
            </a>
          )}
        </div>
      )}

      {/* Upload zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-primary-500 bg-primary-600/10'
              : 'border-dark-700 hover:border-primary-500/50 hover:bg-dark-800/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              dragOver ? 'bg-primary-600/20' : 'bg-dark-800'
            }`}>
              <Upload className={`w-7 h-7 ${dragOver ? 'text-primary-400' : 'text-dark-500'}`} />
            </div>
            <div>
              <p className="text-dark-200 font-semibold text-sm">
                {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              {hint && <p className="text-dark-600 text-xs mt-1">{hint}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-dark-800 border border-primary-600/30">
          <div className="w-10 h-10 rounded-xl bg-primary-600/10 border border-primary-600/20 flex items-center justify-center flex-shrink-0">
            <File className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dark-100 text-sm font-semibold truncate">{file.name}</p>
            <p className="text-dark-500 text-xs">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
