import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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

    setIsUploading(true);
    try {
      const result = await apiClient.uploadMedia(user.id, selectedFile, challengeTitle);
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      await apiClient.createPost({
        user_id: user.id,
        caption: challengeTitle,
        media_type: mediaType,
        media_url: result.mediaUrl,
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
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="px-4 py-2">
          <DialogTitle className="text-center">Pridaj dôkaz: {challengeTitle}</DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-wrap gap-2 justify-center">
          {galleryFiles.length === 0 && !selectedFile && (
            <Button onClick={openGallery} className="bg-gray-200 text-black">
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
            className="flex-1 bg-pink-500 hover:bg-pink-600"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Nahrávam...' : 'Nahrať dôkaz'}
          </Button>
          <Button onClick={handleClose} className="flex-1 border border-gray-300">
            Zrušiť
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUpload;
