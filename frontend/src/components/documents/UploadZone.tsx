import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import type { UploadResponse } from '@/lib/types';
import { uploadDocument } from '@/lib/api/documents';
import { addUploadHistory, type UploadHistoryItem } from '@/lib/upload-history';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface UploadZoneProps {
  onUploaded?: () => void;
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [recentUploads, setRecentUploads] = useState<UploadHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      setCurrentFile(file);
      setUploadState('uploading');
      setUploadError(null);
      setUploadResult(null);

      try {
        const result = await uploadDocument(file);
        setUploadState('success');
        setUploadResult(result);
        const historyItem = addUploadHistory(result);
        setRecentUploads((prev) => [historyItem, ...prev]);
        toast(`${result.filename} uploaded successfully`, 'success');
        onUploaded?.();
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Upload failed. Try again.';
        setUploadState('error');
        setUploadError(message);
        toast('Upload failed', 'error');
      }
    },
    [toast, onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const reset = () => {
    setUploadState('idle');
    setUploadResult(null);
    setUploadError(null);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-accent-500 bg-accent-50'
            : 'border-ink-200 bg-white hover:border-ink-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Choose file"
        />

        {uploadState === 'idle' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-paper-200 text-ink-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-ink-800">
              Drop a document here
            </p>
            <p className="mt-1 text-sm text-ink-400">or</p>
            <Button
              variant="secondary"
              size="md"
              className="mt-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Choose File
            </Button>
            <p className="mt-3 text-xs text-ink-400">
              PDF, TXT, and other document formats
            </p>
          </>
        )}

        {uploadState === 'uploading' && (
          <div className="py-2">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink-400" />
            <p className="mt-3 text-sm font-medium text-ink-700">
              Uploading...
            </p>
            <p className="mt-1 truncate text-xs text-ink-400">
              {currentFile?.name}
            </p>
          </div>
        )}

        {uploadState === 'success' && uploadResult && (
          <div className="py-2">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-900">Document uploaded</p>
            <p className="mt-1 truncate text-sm text-ink-600">
              {uploadResult.filename}
            </p>
            <p className="mt-2 text-sm text-ink-700">
              <span className="font-semibold">{uploadResult.ingested_chunks}</span> chunks indexed
            </p>
            {uploadResult.failed_files.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">
                  {uploadResult.failed_files.length} file(s) failed to process
                </p>
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-ink-400">Ready for questions</span>
              <button
                onClick={reset}
                className="text-xs text-accent-700 hover:text-accent-800"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="py-2">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-900">Upload failed</p>
            <p className="mt-1 truncate text-xs text-ink-500">
              {currentFile?.name}
            </p>
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => currentFile && handleFile(currentFile)}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {recentUploads.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">
            Recent uploads (this session)
          </p>
          <ul className="space-y-1.5">
            {recentUploads.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-ink-200 bg-white px-3 py-2 animate-slide-up"
              >
                <FileText className="h-4 w-4 shrink-0 text-ink-400" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    {item.filename}
                  </p>
                  <p className="text-xs text-ink-400">
                    {item.ingested_chunks} chunks indexed
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
