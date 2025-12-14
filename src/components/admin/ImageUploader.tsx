'use client';
import { useState, ChangeEvent, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Check } from 'lucide-react';

interface ImageUploaderProps {
    productId: string;
    uploadPath: string;
    onUploadComplete: (newUrl: string) => void;
}

export default function ImageUploader({ productId, uploadPath, onUploadComplete }: ImageUploaderProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        const storage = getStorage();
        const fileRef = ref(storage, `${uploadPath}/${productId}_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Image upload error:", error);
                toast({ variant: 'destructive', title: 'Erro de Upload', description: 'Não foi possível carregar a imagem.' });
                setIsUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    onUploadComplete(downloadURL);
                    toast({ title: 'Sucesso!', description: 'A imagem foi carregada.' });
                }).catch((error) => {
                     toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível obter o URL da imagem.' });
                }).finally(() => {
                    setIsUploading(false);
                });
            }
        );
        // Clear the input value to allow re-uploading the same file
        e.target.value = '';
    };

    return (
        <div className="space-y-2 w-full">
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="sr-only"
                disabled={isUploading}
            />
            <Button
                variant="outline"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="w-full flex items-center justify-center"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>A carregar... {uploadProgress.toFixed(0)}%</span>
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Carregar Nova Imagem</span>
                    </>
                )}
            </Button>
            {isUploading && <Progress value={uploadProgress} className="w-full h-2" />}
        </div>
    );
}
