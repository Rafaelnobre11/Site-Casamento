'use client';
import { useState, useTransition, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, Sparkles, Save, Upload } from 'lucide-react';
import type { SiteConfig, Product } from '@/types/siteConfig';
import { generateGiftText } from '@/app/actions';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import StorageImagePicker from '@/components/admin/StorageImagePicker'; // Importa o nosso novo componente

interface ShopTabProps {
    config: SiteConfig;
}

export default function ShopTab({ config }: ShopTabProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<string | null>(null); // Manter para feedback visual se necessário

    const [products, setProducts] = useState<Product[]>(config.products || []);
    const [pixKey, setPixKey] = useState(config.pixKey || '');
    
    // Estado para controlar o seletor de imagens
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);

    useEffect(() => {
        setProducts(config.products || []);
        setPixKey(config.pixKey || '');
    }, [config]);


    const handleProductChange = (index: number, field: keyof Product, value: string) => {
        const newProducts = [...products];
        (newProducts[index] as any)[field] = value;
        setProducts(newProducts);
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

        setIsGenerating(products[index].id);
        startTransition(async () => {
             const result = await generateGiftText({ giftTitle: productTitle });
             if (result.success && result.description && result.thankYouNote) {
                const newProducts = [...products];
                newProducts[index].description = result.description;
                newProducts[index].funnyNote = result.thankYouNote;
                setProducts(newProducts);
                toast({ title: 'Textos gerados com IA!', description: 'Descrição e agradecimento criados com sucesso.' });
             } else {
                toast({ variant: 'destructive', title: 'Erro da IA', description: result.error || 'Não foi possível gerar os textos.' });
             }
             setIsGenerating(null);
        });
    };

    const openImagePicker = (index: number) => {
        setActiveProductIndex(index);
        setIsPickerOpen(true);
    };

    const handleImageSelect = (imageUrl: string) => {
        if (activeProductIndex === null) return;
        
        const newProducts = [...products];
        newProducts[activeProductIndex].imageUrl = imageUrl;
        setProducts(newProducts);
        toast({ title: 'Sucesso!', description: 'A imagem foi selecionada do banco de dados.' });
        setActiveProductIndex(null);
    };

    const addNewProduct = () => {
        const newId = `gift-${Date.now()}`;
        const newProduct: Product = {
            id: newId,
            title: 'Novo Presente Divertido',
            price: 'R$ 50,00',
            description: 'Uma nova forma de nos ajudar a pagar os boletos.',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/meu-casamento-d28e1.appspot.com/o/site_images%2Fgifts%2Fgift-placeholder.png?alt=media', // Um placeholder genérico
            funnyNote: 'Obrigado por este presente aleatório e maravilhoso!',
        };
        setProducts([...products, newProduct]);
    };

    const removeProduct = (index: number) => {
        if (confirm(`Tem certeza que quer remover "${products[index].title}"?`)) {
            const newProducts = products.filter((_, i) => i !== index);
            setProducts(newProducts);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            if (!firestore) return;
            const validProducts = products.filter(p => p.title && p.title.trim() !== '');
            await setDocument(firestore, 'config/site', { products: validProducts, pixKey: pixKey }, { merge: true });
            toast({ title: "Loja Salva!", description: "Sua lista de presentes e chave PIX foram atualizadas." });
        });
    };
    
    const findImageDimensions = (url: string) => {
        const placeholder = PlaceHolderImages.find(p => p.imageUrl === url);
        if (placeholder) {
            return { width: placeholder.width, height: placeholder.height };
        }
        // Fallback para imagens selecionadas - dimensões podem não ser perfeitas mas evitam erros
        return { width: 400, height: 250 };
    }


    return (
        <div className="space-y-6 relative">
            {/* O Modal do seletor de imagens agora faz parte da página */}
            <StorageImagePicker 
                open={isPickerOpen}
                onOpenChange={setIsPickerOpen}
                onImageSelect={handleImageSelect}
            />

             <div className="space-y-6 pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Chave PIX</CardTitle>
                        <CardDescription>Esta é a chave que será mostrada aos convidados para enviar os presentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input 
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
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
                                            <div className="flex items-center gap-4">
                                                {product.imageUrl && (
                                                    <Image src={product.imageUrl} alt="Preview" width={width} height={height} className="rounded-md h-24 w-24 object-contain bg-muted p-1 border" />
                                                )}
                                                 {/* BOTÃO MODIFICADO */}
                                                <Button variant="outline" onClick={() => openImagePicker(index)}>
                                                    <Upload />
                                                    {product.imageUrl ? 'Alterar Imagem' : 'Escolher Imagem'}
                                                </Button>
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
             <CardFooter className="justify-end sticky bottom-0 bg-background/95 py-4 border-t z-10 -mx-8 px-8">
                 <Button onClick={handleSave} disabled={isPending || !!isUploading} size="lg">
                    {isPending || !!isUploading ? <Loader2 className="animate-spin" /> : <Save />}
                    {isUploading ? 'Aguardando Upload...' : 'Salvar Loja e Chave PIX'}
                </Button>
            </CardFooter>
        </div>
    );
}
