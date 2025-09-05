import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import '@/components/MediaUpload.css';

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  onUploadComplete?: (mediaUrl: string, mediaType: 'image' | 'video') => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  isOpen,
  onClose,
  challengeTitle,
  onUploadComplete,
}) => {
  const { user } = useAuth();
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vyber súbor pre nahratie');
      return;
    }
    if (!user) {
      toast.error('Používateľ nie je prihlásený.');
      return;
    }

    // 🔒 prevent more than one proof per day
    const today = new Date().toDateString();
    if (localStorage.getItem(`challenge-${today}`) === 'completed') {
      toast.error('Už si splnil dnešnú výzvu!');
      return;
    }

    // Normalize: never send empty caption
    const title = (challengeTitle ?? '').trim() || 'daily-challenge';

    setIsUploading(true);
    try {
      // 1) upload to MinIO
      const result = await apiClient.uploadMedia(user.id, selectedFile, title);
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // 2) create the post (use the SAME title)
      await apiClient.createPost({
        user_id: user.id,
        caption: title,            // <= IMPORTANT
        media_type: mediaType,
        media_url: result.mediaUrl // if this is relative, render with API_BASE_URL prefix
      });

      toast.success('Dôkaz bol úspešne nahraný!');
      onUploadComplete?.(result.mediaUrl, mediaType);
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Nastala chyba pri nahrávaní súboru.');
    } finally {
      setIsUploading(false);
    }
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
            Pridaj dôkaz: {challengeTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-wrap gap-2 justify-center">
          {galleryFiles.length === 0 && !selectedFile && (
            <Button onClick={openGallery} className="mu-btn--ghost">
              Vybrať súbory z galérie
            </Button>
          )}

          {galleryFiles.map((file, idx) => (
            <div
              key={idx}
              className={`w-24 h-24 border-2 rounded-lg overflow-hidden cursor-pointer ${
                selectedFile === file ? 'border-pink-500' : 'border-gray-300'
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
            onClick={handleUpload}
            className="flex-1"
            style={{
              backgroundColor: '#ff0046',
              color: '#ffffff',
              border: 'none',
            }}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Nahrávam...' : 'Nahrať dôkaz'}
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
            Zrušiť
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUpload;