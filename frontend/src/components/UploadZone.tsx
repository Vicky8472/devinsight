import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  file?: File | null;
  onClear?: () => void;
}

export default function UploadZone({ onFile, accept = '.pdf,.docx', disabled, file, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) onFile(picked);
  };

  if (file) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        dragging
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
        <Upload size={22} className="text-slate-400" />
      </div>
      <p className="text-white font-medium mb-1">Drop your resume here</p>
      <p className="text-slate-500 text-sm mb-3">or click to browse</p>
      <span className="text-xs text-slate-600 bg-slate-800 px-3 py-1 rounded-full">PDF or DOCX</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
