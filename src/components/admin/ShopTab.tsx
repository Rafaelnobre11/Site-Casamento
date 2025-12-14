
'use client';
import { useState, useTransition } from 'react';
import { useFirebase } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, Sparkles, Upload } from 'lucide-react';
import type { SiteConfig, Product } from '@/types/siteConfig';
import { generateGiftText } from '@/app/actions';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';

interface ShopTabProps {
    config: SiteConfig;
    onConfigChange: (newConfig: Partial<SiteConfig>) => void;
}

interface UploadState {
    isLoading: boolean;
    progress: number;
}

export default function ShopTab({ config, onConfigChange }: ShopTabProps) {
    const { storage } = useFirebase();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});

    const products = config.products || [];
    const pixKey = config.pixKey || '';

    const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
        const newProducts = [...products];
        (newProducts[index] as any)[field] = value;
        onConfigChange({ products: newProducts });
    };

    const handlePixKeyChange = (value: string) => {
        onConfigChange({ pixKey: value });
    };

    const handleImageUpload = (file: File, productId: string) => {
        if (!file || !storage) {
            toast({
                variant: 'destructive',
                title: 'Erro de Configuração',
                description: 'O serviço de armazenamento não está disponível.',
            });
            return;
        }

        const uploadFolder = 'site_images/gifts/';
        const storageRef = ref(storage, `${uploadFolder}${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setUploadStates(prev => ({ ...prev, [productId]: { isLoading: true, progress: 0 } }));

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadStates(prev => ({ ...prev, [productId]: { ...prev[productId], progress } }));
            },
            (error) => {
                console.error("Upload error:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro de Upload',
                    description: `Não foi possível carregar a imagem: ${error.message}`
                });
                setUploadStates(prev => {
                    const newStates = { ...prev };
                    delete newStates[productId];
                    return newStates;
                });
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const productIndex = products.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        handleProductChange(productIndex, 'imageUrl', downloadURL);
                    }
                    
                    toast({ title: "Sucesso!", description: "A imagem foi carregada. Clique em 'Salvar Alterações' para publicá-la." });
                    
                    setUploadStates(prev => {
                        const newStates = { ...prev };
                        delete newStates[productId];
                        return newStates;
                    });
                });
            }
        );
    };


    const handleGenerateText = async (index: number) => {
        const productTitle = products[index].title;
        if (!productTitle) {
            toast({
                variant: 'destructive',
                title: 'Opa!',
                description: 'Você precisa dar um título ao presente antes de gerar os textos.',
            });
            return;
        }

        const productId = products[index].id;
        setIsGenerating(productId);
        
        const result = await generateGiftText({ giftTitle: productTitle });
        if (result.success && result.description && result.thankYouNote) {
            const newProducts = [...products];
            newProducts[index].description = result.description;
            newProducts[index].funnyNote = result.thankYouNote;
            onConfigChange({ products: newProducts });
            toast({ title: 'Textos gerados com IA!', description: 'Descrição e agradecimento criados com sucesso.' });
        } else {
            toast({ variant: 'destructive', title: 'Erro da IA', description: result.error || 'Não foi possível gerar os textos.' });
        }
        setIsGenerating(null);
    };

    const addNewProduct = () => {
        const newId = `gift-${Date.now()}`;
        const placeholderImage = PlaceHolderImages.find(p => p.id === 'gift-robo-aspirador')?.imageUrl || 'https://picsum.photos/seed/placeholder/400/250';
        const newProduct: Product = {
            id: newId,
            title: 'Novo Presente Divertido',
            price: 'R$ 50,00',
            description: 'Uma nova forma de nos ajudar a pagar os boletos.',
            imageUrl: placeholderImage,
            funnyNote: 'Obrigado por este presente aleatório e maravilhoso!',
        };
        onConfigChange({ products: [...products, newProduct] });
    };

    const removeProduct = (index: number) => {
        if (confirm(`Tem certeza que quer remover "${products[index].title}"?`)) {
            const newProducts = products.filter((_, i) => i !== index);
            onConfigChange({ products: newProducts });
        }
    };
    
    const findImageDimensions = (url: string) => {
        const placeholder = PlaceHolderImages.find(p => p.imageUrl === url);
        if (placeholder) {
            return { width: placeholder.width, height: placeholder.height };
        }
        return { width: 400, height: 250 };
    }

    return (
        <div className="space-y-6 relative">
             <div className="space-y-6 pb-16">
                <Card>
                    <CardHeader>
                        <CardTitle>Chave PIX</CardTitle>
                        <CardDescription>Esta é a chave que será mostrada aos convidados para enviar os presentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input 
                            value={pixKey}
                            onChange={(e) => handlePixKeyChange(e.target.value)}
                            placeholder="Sua chave PIX (celular, e-mail, CPF/CNPJ ou chave aleatória)"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>A Loja (de Presentes)</CardTitle>
                        <CardDescription>Crie sua vitrine de presentes divertidos. O objetivo é arrecadar PIX para a vida nova!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {products.map((product, index) => {
                                const { width, height } = findImageDimensions(product.imageUrl);
                                const uploadState = uploadStates[product.id] || { isLoading: false, progress: 0 };
                                const isPlaceholder = !!PlaceHolderImages.find(p => p.imageUrl === product.imageUrl);
                                
                                return (
                                    <div key={product.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg relative">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProduct(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <div className="space-y-2">
                                            <label className="font-medium text-sm">Título</label>
                                            <Input value={product.title} onChange={(e) => handleProductChange(index, 'title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-medium text-sm">Preço (texto)</label>
                                            <Input value={product.price} onChange={(e) => handleProductChange(index, 'price', e.target.value)} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2 relative">
                                            <label className="font-medium text-sm">Descrição</label>
                                            <Textarea value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2 relative">
                                            <label className="font-medium text-sm">Frase de Agradecimento</label>
                                            <Input value={product.funnyNote} onChange={(e) => handleProductChange(index, 'funnyNote', e.target.value)} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleGenerateText(index)}
                                                disabled={isGenerating === product.id}
                                            >
                                                {isGenerating === product.id ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                                Gerar Textos com IA
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-medium text-sm">Imagem do Produto</label>
                                            <div className="flex items-start gap-4">
                                                {product.imageUrl && (
                                                    <Image unoptimized={!isPlaceholder} src={product.imageUrl} alt={product.title} width={width} height={height} className="rounded-md h-24 w-24 object-contain bg-muted p-1 border" />
                                                )}
                                                <div className="flex-grow space-y-2">
                                                    <Button asChild variant="outline" className="w-full" disabled={uploadState.isLoading}>
                                                        <label className="cursor-pointer">
                                                            {uploadState.isLoading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2"/>}
                                                            {uploadState.isLoading ? `A carregar... ${uploadState.progress.toFixed(0)}%` : 'Carregar Nova Imagem'}
                                                            <input
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        handleImageUpload(e.target.files[0], product.id);
                                                                    }
                                                                }}
                                                                disabled={uploadState.isLoading}
                                                            />
                                                        </label>
                                                    </Button>
                                                    {uploadState.isLoading && <Progress value={uploadState.progress} className="w-full h-2" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button variant="outline" onClick={addNewProduct}>
                            <PlusCircle className="mr-2" />
                            Adicionar Novo Presente
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
