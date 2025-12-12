'use client';
import { useState, useTransition, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Image as ImageIcon, MapPin, Lock, Save, Trash2, PlusCircle, Sparkles } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';

interface CustomizeTabProps {
    config: SiteConfig;
}

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
            <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-10 p-1" />
            <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#ffffff" />
        </div>
    </div>
);


export default function CustomizeTab({ config }: CustomizeTabProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [formState, setFormState] = useState<SiteConfig>(config);
    
    useEffect(() => {
        setFormState(config);
    }, [config]);

    const handleFieldChange = (field: keyof SiteConfig, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };
    
    const handleColorChange = (field: keyof SiteConfig['customColors'], value: string) => {
        setFormState(prev => ({ 
            ...prev, 
            customColors: {
                ...prev.customColors,
                [field]: value
            }
        }));
    };
    
    const handleCarouselAdd = () => {
        const newImages = [...(formState.carouselImages || []), 'https://picsum.photos/seed/new/800/600'];
        handleFieldChange('carouselImages', newImages);
    };

    const handleCarouselChange = (index: number, value: string) => {
        const newImages = [...(formState.carouselImages || [])];
        newImages[index] = value;
        handleFieldChange('carouselImages', newImages);
    };

    const handleCarouselRemove = (index: number) => {
        const newImages = (formState.carouselImages || []).filter((_, i) => i !== index);
        handleFieldChange('carouselImages', newImages);
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                handleFieldChange(field, base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            if (!firestore) return;
            // Before saving, recalculate the map URL to ensure it's up to date
            const cep = formState.addressCep?.replace(/\D/g, '');
             if (cep && cep.length === 8) {
                 try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                     if (!data.erro) {
                        const street = data.logradouro || '';
                        const number = formState.addressNumber || '';
                        const city = data.localidade || '';
                        const state = data.uf || '';
                        const fullAddressForMap = `${street}, ${number}, ${city}, ${state}`.trim();
                        const gmapsEmbed = `https://www.google.com/maps/embed?q=${encodeURIComponent(fullAddressForMap)}`;
                        
                        const updatedState = { ...formState, mapUrl: gmapsEmbed };
                        setFormState(updatedState); // Update state before saving
                        await setDocument(firestore, 'config/site', updatedState);
                     } else {
                        // If CEP is invalid, save without changing mapUrl
                        await setDocument(firestore, 'config/site', formState);
                     }
                 } catch (err) {
                    console.error("Falha ao buscar CEP no salvamento:", err);
                    await setDocument(firestore, 'config/site', formState); // Save current state on fetch error
                 }
             } else {
                 await setDocument(firestore, 'config/site', formState); // Save if no CEP
             }
            toast({ title: "Salvo!", description: `Suas personalizações foram salvas.` });
        });
    };
    
    // Auto-fetch address from CEP when typing
    useEffect(() => {
        const cep = formState.addressCep?.replace(/\D/g, '');
        if (cep && cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        const street = data.logradouro || '';
                        const neighborhood = data.bairro || '';
                        const city = data.localidade || '';
                        const state = data.uf || '';
                        const fullAddressForDisplay = `${street}, ${neighborhood} - ${city}/${state}`;
                        
                        setFormState(prev => ({
                            ...prev,
                            locationAddress: fullAddressForDisplay,
                        }));
                    }
                }).catch(err => console.error("Falha ao buscar CEP:", err));
        }
    }, [formState.addressCep]);

    // Memoize the map URL to prevent re-renders, but ensure it's calculated on load
    const mapUrl = useMemo(() => {
        const cep = formState.addressCep?.replace(/\D/g, '');
        if (cep && cep.length === 8 && formState.addressNumber && formState.locationAddress) {
             const addressParts = formState.locationAddress.split(/, | - /);
             if (addressParts.length >= 3) {
                 const street = addressParts[0];
                 const cityState = addressParts.slice(2).join(', ');
                 const fullAddressForMap = `${street}, ${formState.addressNumber}, ${cityState}`;
                 return `https://www.google.com/maps/embed?q=${encodeURIComponent(fullAddressForMap)}`;
             }
        }
        return formState.mapUrl || ''; // Fallback to whatever is in the state/db
    }, [formState.addressCep, formState.addressNumber, formState.locationAddress, formState.mapUrl]);

    return (
        <div className="grid gap-6 relative">
            <div className="space-y-6 pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Identidade do Casal</CardTitle>
                        <CardDescription>Defina os nomes e a identidade visual do site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="couple-names">Nome do Casal (ex: J & L)</Label>
                            <Input id="couple-names" value={formState.names || ''} onChange={(e) => handleFieldChange('names', e.target.value)} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="logo-image">Logo / Brasão</Label>
                                <Input id="logo-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')}/>
                                {formState.logoUrl && <img src={formState.logoUrl} alt="Preview" className="mt-2 rounded-md max-h-32 object-contain bg-muted p-2" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Cores do Tema</CardTitle>
                        <CardDescription>Escolha a cor principal para gerar uma paleta ou defina cada cor manualmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-background">
                            <h3 className="font-semibold mb-4">1. Cor Principal (Gera Paleta Inteligente)</h3>
                            <div className="flex items-center gap-4">
                                <Input 
                                    type="color" 
                                    value={formState.customColor || '#e85d3f'}
                                    onChange={(e) => handleFieldChange('customColor', e.target.value)}
                                    className="w-24 h-12 p-1"
                                />
                                <div className="flex-1">
                                    <Input 
                                        value={formState.customColor || ''}
                                        onChange={(e) => handleFieldChange('customColor', e.target.value)}
                                        placeholder="Pesquisar cor (ex: #e85d3f)" 
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Ao selecionar uma cor aqui, o site gera automaticamente as cores dos botões, textos e fundos para manter o contraste legível.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-background">
                            <h3 className="font-semibold mb-4">2. Cores Detalhadas (Avançado)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ColorInput label="Fundo do Menu" value={formState.customColors?.headerBg || ''} onChange={(v) => handleColorChange('headerBg', v)} />
                                <ColorInput label="Texto do Menu" value={formState.customColors?.headerText || ''} onChange={(v) => handleColorChange('headerText', v)} />
                                <ColorInput label="Fundo do Rodapé" value={formState.customColors?.footerBg || ''} onChange={(v) => handleColorChange('footerBg', v)} />
                                <ColorInput label="Texto do Rodapé" value={formState.customColors?.footerText || ''} onChange={(v) => handleColorChange('footerText', v)} />
                                <ColorInput label="Fundo dos Botões" value={formState.customColors?.buttonBg || ''} onChange={(v) => handleColorChange('buttonBg', v)} />
                                <ColorInput label="Texto dos Botões" value={formState.customColors?.buttonText || ''} onChange={(v) => handleColorChange('buttonText', v)} />
                                <ColorInput label="Cor dos Títulos" value={formState.customColors?.headingText || ''} onChange={(v) => handleColorChange('headingText', v)} />
                                <ColorInput label="Cor dos Textos" value={formState.customColors?.bodyText || ''} onChange={(v) => handleColorChange('bodyText', v)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon /> Imagens Principais</CardTitle>
                        <CardDescription>Troque a foto de capa e gerencie a galeria de fotos do site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="hero-image">Foto da Capa (Hero)</Label>
                            <Input id="hero-image" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'heroImage')} />
                            {formState.heroImage && <img src={formState.heroImage} alt="Preview" className="mt-2 rounded-md max-h-48 object-cover w-full" />}
                        </div>
                        <div className="space-y-4">
                            <Label className="font-medium d-block">Galeria de Fotos (Carrossel)</Label>
                            <div className="space-y-2">
                                {(formState.carouselImages || []).map((img, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={img} onChange={(e) => handleCarouselChange(index, e.target.value)} placeholder="URL da imagem" />
                                    <Button variant="ghost" size="icon" onClick={() => handleCarouselRemove(index)}><Trash2 className="text-destructive" /></Button>
                                </div>
                                ))}
                            </div>
                            <Button variant="outline" onClick={handleCarouselAdd}><PlusCircle /> Adicionar Foto</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MapPin /> Localização do Evento</CardTitle>
                        <CardDescription>Forneça os detalhes do endereço para o sistema gerar os mapas e links automaticamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="location-name">Nome do Local</Label>
                            <Input id="location-name" value={formState.locationName || ''} onChange={(e) => handleFieldChange('locationName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-cep">CEP</Label>
                                <Input id="address-cep" value={formState.addressCep || ''} onChange={(e) => handleFieldChange('addressCep', e.target.value)} placeholder="Apenas números" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Endereço Encontrado</Label>
                                <Input value={formState.locationAddress || "Aguardando CEP..."} readOnly disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address-number">Número</Label>
                                <Input id="address-number" value={formState.addressNumber || ''} onChange={(e) => handleFieldChange('addressNumber', e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lock /> Cadeado do Conteúdo</CardTitle>
                        <CardDescription>Se ativado, o convidado só vê o endereço e os presentes depois de confirmar presença. Suspense é tudo!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-2">
                        <Switch 
                            id="lock-content"
                            checked={formState.isContentLocked}
                            onCheckedChange={(checked) => handleFieldChange('isContentLocked', checked)}
                        />
                        <label htmlFor="lock-content">Trancar site para não confirmados</label>
                    </CardContent>
                </Card>
            </div>
            
            <CardFooter className="justify-end sticky bottom-0 bg-background/95 py-4 border-t z-10 -mx-8 px-8">
                 <Button onClick={handleSave} disabled={isPending} size="lg">
                    {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                    Salvar Todas as Alterações
                </Button>
            </CardFooter>
        </div>
    );
}
