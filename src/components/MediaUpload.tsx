import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { toast } from 'sonner';
import '@/components/MediaUpload.css';

// -----------------------------------------------------
// --- CAPACITOR IMPORTS (Only import the plugin) ---
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// We are explicitly NOT importing isPlatform to avoid the build/runtime errors.
// -----------------------------------------------------

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  onFileSelectForUpload: (file: File) => void;
}

// -----------------------------------------------------
// --- FIX: Custom Helper to Safely Get Platform String ---
const getPlatformType = (): 'web' | 'android' | 'ios' => {
  // Check global Capacitor object, which is injected into the WebView on mobile.
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

  // Helper function to convert the temporary blob path to a File object
  const convertBlobUrlToFile = async (webPath: string, fileName: string): Promise<File> => {
      const blob = await fetch(webPath).then(r => r.blob());
      const mimeType = blob.type || (fileName.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
      return new File([blob], fileName, { type: mimeType });
  };


  const openGallery = async () => {
    const platform = getPlatformType();

    // 1. Mobile Platform: Use Capacitor Camera Plugin
    if (platform === 'android' || platform === 'ios') {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                resultType: CameraResultType.Uri,
                source: CameraSource.Photos,
                saveToGallery: false,
                media: 'prompt'
            });

            if (photo.webPath) {
                const format = photo.format || 'jpeg';
                const fileExtension = format === 'mp4' ? 'mp4' : format;
                const fileName = `upload_${new Date().getTime()}.${fileExtension}`;

                const file = await convertBlobUrlToFile(photo.webPath, fileName);

                setGalleryFiles([file]);
                setSelectedFile(file);
            }
        } catch (e: any) {
            // User likely cancelled or permission was denied
            if (!e.message?.includes('cancelled')) {
                 toast.error('Chyba: Nepodarilo sa otvoriť galériu. Skús znova.');
            }
            console.error(e);
        }
    }
    // 2. Web/Fallback: Use standard HTML file input
    else if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*,video/*';
        fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles(files);
    setSelectedFile(files[0] || null);
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