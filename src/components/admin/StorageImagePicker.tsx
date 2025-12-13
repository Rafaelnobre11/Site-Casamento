
'use client';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface StorageImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (url: string) => void;
}

export default function StorageImagePicker({ open, onOpenChange, onImageSelect }: StorageImagePickerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storage = getStorage();
      const folderPaths = ['site_images/Site', 'site_images/gifts', 'site_images/uploads'];
      const allItems = [];

      for (const path of folderPaths) {
        try {
            const folderRef = ref(storage, path);
            const res = await listAll(folderRef);
            allItems.push(...res.items);
        } catch (e) {
            // Ignora pastas que não existem, não é um erro fatal.
            console.warn(`Pasta não encontrada ou vazia: ${path}`);
        }
      }
      
      const urls = await Promise.all(allItems.map(itemRef => getDownloadURL(itemRef)));
      setImageUrls(prev => Array.from(new Set([...prev, ...urls])));

    } catch (e: any) {
      console.error("Erro detalhado ao buscar imagens:", e);
      setError("Falha ao carregar imagens do banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const handleLocalImageSelect = (url: string) => {
    onImageSelect(url);
    onOpenChange(false);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const storage = getStorage();
    // Salva na pasta 'uploads' para manter a organização
    const fileRef = ref(storage, `site_images/uploads/${Date.now()}_${file.name}`);
    
    try {
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Adiciona a nova imagem no início da lista para feedback imediato
        setImageUrls(prev => [downloadURL, ...prev]);
        
    } catch (error) {
        console.error("Image upload error:", error);
        setError('Não foi possível carregar a imagem.');
    } finally {
        setIsUploading(false);
        // Limpa o input para permitir o upload do mesmo ficheiro novamente
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione uma Imagem</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow border rounded-md relative">
          <div className="p-4">
            {isLoading && imageUrls.length === 0 ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">A carregar imagens...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                 <div className="text-center text-red-500">
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageUrls.map((url) => (
                  <div key={url} className="relative aspect-square group rounded-md overflow-hidden border" onClick={() => handleLocalImageSelect(url)}>
                    <Image src={url} alt="Imagem do Storage" fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex justify-center items-center transition-all duration-300 cursor-pointer">
                      <p className="text-white opacity-0 group-hover:opacity-100 font-semibold">Selecionar</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !error && imageUrls.length === 0 && (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="text-center text-gray-500">
                  <p>Nenhuma imagem encontrada.</p>
                  <p className="text-sm">Faça um upload para começar.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t pt-4 flex-col-reverse sm:flex-row gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
                disabled={isUploading}
            />
          <Button variant="default" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {isUploading ? 'A carregar...' : 'Fazer Upload'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
