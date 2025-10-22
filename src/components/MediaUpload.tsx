import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { toast } from 'sonner';
import '@/components/MediaUpload.css';

// -----------------------------------------------------
// --- CAPACITOR IMPORTS (None needed for this approach) ---
// We rely solely on standard HTML/JS APIs for file handling.
// -----------------------------------------------------

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  onFileSelectForUpload: (file: File) => void;
}

// -----------------------------------------------------
// --- Custom Helper to Safely Get Platform String ---
// Keep the platform check for consistency, though not strictly required here.
const getPlatformType = (): 'web' | 'android' | 'ios' => {
  if (typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform) {
    return (window as any).Capacitor.getPlatform() as 'web' | 'android' | 'ios';
  }
  return 'web';
};
// -----------------------------------------------------

const MediaUpload: React.FC<MediaUploadProps> = ({
  isOpen,
  onClose,
  challengeTitle,
  onFileSelectForUpload,
}) => {
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions are no longer needed as the File Input handles the object creation

  const openGallery = async () => {
    // 🚨 The definitive fix: Force a click on the hidden HTML file input.
    // On native platforms (Android/iOS), this triggers the OS's native file picker/chooser,
    // which reliably supports both 'image/*' and 'video/*' based on the 'accept' attribute.
    if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*,video/*';
        fileInputRef.current.click();
    }
    // Note: No more plugin code is required here.
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(files);
    setSelectedFile(files[0] || null);
    // Crucial: Clear the input value so the same file can be picked again later
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) {
      toast.error('Vyber súbor pre nahratie');
      return;
    }

    onFileSelectForUpload(selectedFile);
    handleClose();
  };

  const handleClose = () => {
    setGalleryFiles([]);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black" />
      <DialogContent
        className="sm:max-w-md bg-black text-white border-neutral-800"
        hideClose
        style={{
          border: '0px solid #222',
          borderRadius: '20px',
          width: '95%',
          maxWidth: '26rem',
        }}
      >
        <DialogHeader className="px-4 py-2">
          <DialogTitle className="text-center">
            Add a proof: {challengeTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-wrap gap-2 justify-center">
          {galleryFiles.length === 0 && !selectedFile && (
            <Button onClick={openGallery} className="mu-btn--ghost">
              Choose from your gallery
            </Button>
          )}

          {galleryFiles.map((file, idx) => (
            <div
              key={idx}
              className={`w-24 h-24 border-2 rounded-lg overflow-hidden cursor-pointer ${
                selectedFile === file ? 'border-[#ff0046]' : 'border-gray-300'
              }`}
              onClick={() => setSelectedFile(file)}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  alt={file.name}
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  muted
                />
              )}
            </div>
          ))}

          {selectedFile && (
            <div className="w-full mt-4">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full h-64 object-cover rounded-lg"
                  alt="Preview"
                />
              ) : (
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
          )}
        </div>

        {/* THIS IS THE HIDDEN INPUT ELEMENT.
          It handles the actual OS file selection on both web and native.
        */}
        <input
          type="file"
          // We will manage single file selection, though the input supports multiple
          multiple={false}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFilesSelected}
          // The accept attribute tells the OS picker to show images AND videos
          accept="image/*,video/*"
        />

        <div className="flex gap-2 p-4">
          <Button
            onClick={handleConfirmUpload}
            className="flex-1"
            style={{
              backgroundColor: '#ff0046',
              color: '#ffffff',
              border: 'none',
            }}
            disabled={!selectedFile}
          >
            Upload proof
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1"
            style={{
              backgroundColor: '#ff0046',
              color: '#ffffff',
              border: 'none',
            }}
          >
            Discard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUpload;