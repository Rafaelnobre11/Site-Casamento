'use client';

import { useState, useRef, useCallback } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  uploadFolder: string;
  onUploadComplete: (downloadURL: string) => void;
}

export function ImageUploader({ uploadFolder, onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storage = getStorage();
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${uploadFolder}${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast({
          variant: 'destructive',
          title: 'Erro de Upload',
          description: `Não foi possível carregar a imagem. Erro: ${error.message}`
        });
        setIsUploading(false);
        setUploadProgress(0);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadComplete(downloadURL);
          setIsUploading(false);
        });
      }
    );
  }, [uploadFolder, onUploadComplete, toast]);

  return (
    <div className="w-full space-y-2">
       <Button onClick={handleUploadClick} variant="outline" className="w-full" disabled={isUploading}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="sr-only"
            accept="image/*"
          />
          {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2"/>}
          {isUploading ? `A carregar... ${uploadProgress.toFixed(0)}%` : 'Carregar Nova Imagem'}
       </Button>
      {isUploading && <Progress value={uploadProgress} className="w-full h-2" />}
    </div>
  );
}
