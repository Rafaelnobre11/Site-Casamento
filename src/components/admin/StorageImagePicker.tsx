'use client';
import { useState, useEffect } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface StorageImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (url: string) => void;
}

export default function StorageImagePicker({ open, onOpenChange, onImageSelect }: StorageImagePickerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchImages = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const storage = getStorage();
          // Definir referências explícitas para as pastas de imagens
          const folderPaths = ['site_images/Site', 'site_images/gifts'];
          const allItems = [];

          for (const path of folderPaths) {
            const folderRef = ref(storage, path);
            const res = await listAll(folderRef);
            allItems.push(...res.items);
          }
          
          const urls = await Promise.all(allItems.map(itemRef => getDownloadURL(itemRef)));
          
          // Remove duplicados, caso existam
          setImageUrls(Array.from(new Set(urls)));

        } catch (e: any) {
          console.error("Erro detalhado ao buscar imagens:", e);
          setError("Falha ao carregar imagens. Verifique o console para mais detalhes (F12).");
        } finally {
          setIsLoading(false);
        }
      };

      fetchImages();
    }
  }, [open]);

  const handleImageSelect = (url: string) => {
    onImageSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Selecione uma Imagem do Banco de Dados</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] border rounded-md">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Carregando imagens...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                 <div className="text-center text-red-500">
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageUrls.map((url) => (
                  <div key={url} className="relative aspect-square group" onClick={() => handleImageSelect(url)}>
                    <img src={url} alt="Imagem do Storage" className="object-cover w-full h-full rounded-md" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex justify-center items-center transition-all duration-300 cursor-pointer">
                      <p className="text-white opacity-0 group-hover:opacity-100">Selecionar</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !error && imageUrls.length === 0 && (
              <div className="flex justify-center items-center h-full min-h-[200px]">
                <div className="text-center text-gray-500">
                  <p>Nenhuma imagem encontrada.</p>
                  <p className="text-sm">Verifique se as imagens foram enviadas para as pastas 'site_images/Site' ou 'site_images/gifts' no Firebase Storage.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
