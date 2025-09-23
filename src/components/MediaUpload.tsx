import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { toast } from 'sonner';
import '@/components/MediaUpload.css';

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  // NEW: A callback to hand off the selected file to the parent component
  onFileSelectForUpload: (file: File) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  isOpen,
  onClose,
  challengeTitle,
  onFileSelectForUpload, // Use the new prop
}) => {
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*,video/*';
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(files);
    setSelectedFile(files[0] || null);
  };

  // MODIFIED: This function no longer performs the upload.
  // It just validates the file and passes it to the parent.
  const handleConfirmUpload = () => {
    if (!selectedFile) {
      toast.error('Vyber súbor pre nahratie');
      return;
    }
    
    // Pass the selected file to the parent component.
    onFileSelectForUpload(selectedFile);
    
    // Close the dialog immediately.
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

        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFilesSelected}
          accept="image/*,video/*"
        />

        <div className="flex gap-2 p-4">
          <Button
            onClick={handleConfirmUpload} // MODIFIED function name
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