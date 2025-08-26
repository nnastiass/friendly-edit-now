import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Video, X, Upload } from 'lucide-react';
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
  onUploadComplete
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('Podporované sú len obrázky a videá');
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Súbor je príliš veľký. Maximálna veľkosť je 50MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error('Vyber súbor pre nahratie');
      return;
    }

    setIsUploading(true);

    try {
      // Use the API client to upload the file
      const result = await apiClient.uploadMedia(user.id, selectedFile, challengeTitle);
      
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      const mediaUrl = result.mediaUrl || URL.createObjectURL(selectedFile); // Fallback to blob URL if API doesn't return URL
      
      toast.success('Dokaz bol úspešne nahraný!');
      
      if (onUploadComplete) {
        onUploadComplete(mediaUrl, mediaType);
      }
      
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Nastala chyba pri nahrávaní');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Pridaj dokaz pre: {challengeTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Selection */}
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={openFileInput}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Fotka
                </Button>
                <Button
                  onClick={openFileInput}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-sm text-gray-500 text-center">
                Vyber obrázok alebo video ako dokaz splnenia výzvy
              </p>
            </div>
          ) : (
            /* Preview and Upload */
            <div className="space-y-4">
              <div className="relative">
                {previewUrl && (
                  <div className="relative">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }
                      }}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Súbor:</strong> {selectedFile?.name}</p>
                <p><strong>Veľkosť:</strong> {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Typ:</strong> {selectedFile?.type.startsWith('image/') ? 'Obrázok' : 'Video'}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Nahrávam...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Nahrať dokaz
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isUploading}
                >
                  Zrušiť
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUpload; 