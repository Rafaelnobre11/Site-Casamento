
'use client';
import { useState, useTransition, useEffect, ChangeEvent } from 'react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, Image as ImageIcon, MapPin, Lock, Save, Trash2, PlusCircle, Calendar, Clock, Upload, ChevronsUpDown, Check, RefreshCcw } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { colorToHsl, colorStringToHex, hexToRgb, getYiq } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { colorPalette } from '@/lib/color-palette';

type CustomColors = NonNullable<SiteConfig['customColors']>;

interface CustomizeTabProps {
    config: SiteConfig;
}

const ColorSwatch = ({ color }: { color: string }) => {
  const hexColor = colorStringToHex(color);
  return <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: hexColor || 'transparent' }} />;
};

const ColorInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (value: string) => void, placeholder?: string }) => {
    const displayValue = value || placeholder || '';
    const hexColor = colorStringToHex(displayValue) || '#ffffff';

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-md border p-1 bg-white">
                    <div className="w-full h-full rounded" style={{ backgroundColor: hexColor }}></div>
                    <Input 
                        type="color" 
                        value={hexColor}
                        onChange={handleColorPickerChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <Input 
                    value={displayValue} 
                    onChange={handleInputChange} 
                    placeholder={placeholder}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    );
};


export default function CustomizeTab({ config }: CustomizeTabProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [openColorPopover, setOpenColorPopover] = useState(false);
    
    const [formState, setFormState] = useState<SiteConfig>(() => ({
        ...config,
        isContentLocked: config.isContentLocked !== undefined ? config.isContentLocked : true,
        customColors: {
            ...config.customColors,
        },
    }));

    useEffect(() => {
        setFormState({
            ...config,
            isContentLocked: config.isContentLocked !== undefined ? config.isContentLocked : true,
            customColors: {
                ...config.customColors,
            },
        });
    }, [config]);

    const handleFieldChange = (field: keyof SiteConfig, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (field: keyof CustomColors, value: string) => {
        setFormState(prev => ({
            ...prev,
            customColors: { ...prev.customColors, [field]: value }
        }));
    };
    
    const resetDetailedColors = () => {
        handleColorChange('headingText', '');
        handleColorChange('heroHeadingText', '');
        handleColorChange('bodyText', '');
        handleColorChange('buttonBg', '');
        handleColorChange('buttonText', '');
    }

    const handleCarouselChange = (index: number, value: string) => {
        const newImages = [...(formState.carouselImages || [])];
        newImages[index] = value;
        handleFieldChange('carouselImages', newImages);
    };

    const handleCarouselAdd = () => {
        const newImages = [...(formState.carouselImages || []), `https://picsum.photos/seed/${Date.now()}/800/800`];
        handleFieldChange('carouselImages', newImages);
    };

    const handleCarouselRemove = (index: number) => {
        const newImages = (formState.carouselImages || []).filter((_, i) => i !== index);
        handleFieldChange('carouselImages', newImages);
    };
    
    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImage' | 'carousel', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const storage = getStorage();
        const fileRef = ref(storage, `site_images/${field}_${Date.now()}_${file.name}`);
        
        try {
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            if (field === 'carousel' && index !== undefined) {
                const newImages = [...(formState.carouselImages || [])];
                newImages[index] = downloadURL;
                handleFieldChange('carouselImages', newImages);
            } else {
                handleFieldChange(field as keyof SiteConfig, downloadURL);
            }
            
            toast({ title: 'Sucesso!', description: 'Sua imagem foi carregada e o URL foi atualizado.' });
        } catch (error) {
            console.error("Image upload error:", error);
            toast({ variant: 'destructive', title: 'Erro de Upload', description: 'Não foi possível carregar a imagem.' });
        } finally {
            setIsUploading(false);
        }
    };


    const handleSave = () => {
        startTransition(async () => {
            if (!firestore) {
                toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados." });
                return;
            };

            let updatedState = { ...formState };
            
            const addressForMap = updatedState.locationAddress;
            const numberForMap = updatedState.addressNumber;

            if (addressForMap && numberForMap) {
                const fullAddressForMap = `${addressForMap}, ${numberForMap}`;
                const encodedAddress = encodeURIComponent(fullAddressForMap);
                
                updatedState.mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;
                updatedState.wazeLink = `https://www.waze.com/ul?q=${encodedAddress}`;
                updatedState.googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            }
            
            try {
                await setDocument(firestore, 'config/site', updatedState);
                toast({ title: "Salvo!", description: `Suas personalizações foram salvas com sucesso.` });
            } catch (error) {
                console.error("Error saving config:", error);
                toast({ variant: 'destructive', title: "Erro ao Salvar", description: "Não foi possível salvar as configurações." });
            }
        });
    };
    
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
                        const fullAddressForDisplay = `${street}, ${neighborhood}, ${city} - ${state}`;
                        
                        setFormState(prev => ({
                            ...prev,
                            locationAddress: fullAddressForDisplay,
                        }));
                    }
                }).catch(err => console.error("Falha ao buscar CEP:", err));
        }
    }, [formState.addressCep]);

    // Lógica para obter as cores da paleta gerada
    const mainColor = formState.customColor || '#e85d3f'; // Fallback
    const primaryHsl = colorToHsl(mainColor);
    
    let generatedHeadingText = '#111827';
    let generatedHeroHeadingText = '#FFFFFF';
    let generatedBodyText = '#4b5563';
    let generatedButtonBg = '#e85d3f';
    let generatedButtonText = '#ffffff';

    if (primaryHsl) {
        const { h, s, l } = primaryHsl;
        generatedHeadingText = `hsl(${h}, ${s * 0.9}%, ${Math.max(15, l * 0.35)}%)`;
        generatedHeroHeadingText = `hsl(${h}, ${s * 0.1}%, ${Math.min(99, l + (100 - l) * 0.98)}%)`;
        generatedBodyText = `hsl(${h}, ${s * 0.3}%, ${Math.max(15, l * 0.25)}%)`;
        generatedButtonBg = `hsl(${h}, ${s}%, ${l}%)`;
        
        const mainColorHex = colorStringToHex(mainColor);
        const primaryRgb = mainColorHex ? hexToRgb(mainColorHex) : null;
        const buttonYiq = primaryRgb ? getYiq(primaryRgb) : 128;
        generatedButtonText = buttonYiq >= 128 ? '#000000' : '#FFFFFF';
    }

    return (
        <div className="grid gap-6 relative">
            <div className="space-y-6 pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Identidade do Casal</CardTitle>
                        <CardDescription>Defina os nomes, a identidade visual, data e hora do casamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="couple-names">Nome do Casal (ex: Cláudia & Rafael)</Label>
                                <Input id="couple-names" value={formState.names || 'Cláudia & Rafael'} onChange={(e) => handleFieldChange('names', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo-url">URL do Logo / Brasão (Opcional)</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="logo-url" type="text" placeholder="Cole a URL ou faça upload" value={formState.logoUrl || ''} onChange={(e) => handleFieldChange('logoUrl', e.target.value)} />
                                    <Button asChild variant="outline">
                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                                            <input id="logo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} disabled={isUploading} />
                                        </label>
                                    </Button>
                                </div>
                                {formState.logoUrl && <img src={formState.logoUrl} alt="Preview" className="mt-2 rounded-md max-h-20 object-contain bg-muted p-2" />}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                                <Label htmlFor="wedding-date" className="flex items-center gap-2"><Calendar /> Data do Casamento</Label>
                                <Input id="wedding-date" type="date" value={(formState.date || '').substring(0, 10)} onChange={(e) => handleFieldChange('date', `${e.target.value}T${formState.time || '16:00'}:00`)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wedding-time" className="flex items-center gap-2"><Clock /> Hora da Cerimônia</Label>
                                <Input id="wedding-time" type="time" value={formState.time || ''} onChange={(e) => handleFieldChange('time', e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Cores do Tema</CardTitle>
                        <CardDescription>Escolha a cor principal para gerar uma paleta coesa ou ajuste as cores detalhadas manualmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-background space-y-4">
                            <div>
                                <Label className="font-semibold mb-2 block">1. Cor Principal (Gera Paleta Inteligente)</Label>
                                <div className="flex items-center gap-4">
                                     <div className="relative w-14 h-11 rounded-md border-2 border-muted-foreground/20 p-1 bg-white">
                                        <div className="w-full h-full rounded" style={{ backgroundColor: colorStringToHex(formState.customColor || '#e85d3f') || 'transparent' }}></div>
                                        <Input 
                                            type="color" 
                                            value={colorStringToHex(formState.customColor || '#e85d3f') || '#e85d3f'}
                                            onChange={(e) => handleFieldChange('customColor', e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Popover open={openColorPopover} onOpenChange={setOpenColorPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openColorPopover}
                                                    className="w-full justify-between font-normal h-11"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {formState.customColor || "Selecione uma cor..."}
                                                    </div>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput 
                                                        placeholder="Pesquisar cor (ex: Marsala, #e85d3f)" 
                                                        onValueChange={(search) => handleFieldChange('customColor', search)}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>Nenhuma cor encontrada.</CommandEmpty>
                                                        <CommandGroup>
                                                            {colorPalette.map((color) => (
                                                            <CommandItem
                                                                key={color.name}
                                                                value={color.name}
                                                                onSelect={(currentValue) => {
                                                                    const selectedColor = colorPalette.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                                                                    handleFieldChange('customColor', selectedColor ? selectedColor.hex : currentValue);
                                                                    setOpenColorPopover(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <ColorSwatch color={color.hex} />
                                                                    {color.name}
                                                                </div>
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        (formState.customColor || '').toLowerCase() === color.name.toLowerCase() ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Escreva um nome de cor ou um código de cor.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-background space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                 <Label className="font-semibold">2. Cores Detalhadas (Avançado)</Label>
                                 <Button variant="ghost" size="sm" onClick={resetDetailedColors} className="flex items-center gap-2 text-xs">
                                     <RefreshCcw className="w-3 h-3" />
                                     Restaurar Padrão
                                 </Button>
                            </div>
                             <p className="text-xs text-muted-foreground -mt-2">
                                Deixe em branco para usar a paleta gerada automaticamente. Preencha para substituir uma cor específica.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ColorInput label="Texto Títulos (Geral)" value={formState.customColors?.headingText || ''} onChange={(value) => handleColorChange('headingText', value)} placeholder={colorStringToHex(generatedHeadingText) || ''} />
                                <ColorInput label="Texto Títulos (Hero)" value={formState.customColors?.heroHeadingText || ''} onChange={(value) => handleColorChange('heroHeadingText', value)} placeholder={colorStringToHex(generatedHeroHeadingText) || ''} />
                                <ColorInput label="Texto do Corpo" value={formState.customColors?.bodyText || ''} onChange={(value) => handleColorChange('bodyText', value)} placeholder={colorStringToHex(generatedBodyText) || ''} />
                                <ColorInput label="Fundo do Botão" value={formState.customColors?.buttonBg || ''} onChange={(value) => handleColorChange('buttonBg', value)} placeholder={colorStringToHex(generatedButtonBg) || ''} />
                                <ColorInput label="Texto do Botão" value={formState.customColors?.buttonText || ''} onChange={(value) => handleColorChange('buttonText', value)} placeholder={colorStringToHex(generatedButtonText) || ''} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon /> Imagens Principais</CardTitle>
                        <CardDescription>Faça o upload da imagem da capa e gerencie a galeria de fotos do site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="hero-image-url">Foto da Capa (Hero)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="hero-image-url" type="text" placeholder="Cole o URL ou faça upload" value={formState.heroImage || ''} onChange={(e) => handleFieldChange('heroImage', e.target.value)} />
                                <Button asChild variant="outline">
                                    <label htmlFor="hero-upload" className="cursor-pointer">
                                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                                        <input id="hero-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} disabled={isUploading} />
                                    </label>
                                </Button>
                            </div>
                             {formState.heroImage && <img src={formState.heroImage} alt="Preview" className="mt-2 rounded-md max-h-48 object-cover w-full" />}
                        </div>
                        <div className="space-y-4">
                            <Label className="font-medium d-block">Galeria de Fotos (Carrossel)</Label>
                            <div className="space-y-3">
                                {(formState.carouselImages || []).map((img, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={img} onChange={(e) => handleCarouselChange(index, e.target.value)} placeholder="URL da imagem" />
                                     <Button asChild variant="outline" size="icon">
                                        <label htmlFor={`carousel-upload-${index}`} className="cursor-pointer">
                                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}
                                            <input id={`carousel-upload-${index}`} type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, 'carousel', index)} disabled={isUploading} />
                                        </label>
                                    </Button>
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
                        <CardDescription>Forneça os detalhes do endereço para o sistema gerar os mapas e links automaticamente ao salvar.</CardDescription>
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
                 <Button onClick={handleSave} disabled={isPending || isUploading} size="lg">
                    {isPending || isUploading ? <Loader2 className="animate-spin" /> : <Save />}
                    {isUploading ? 'Aguardando Upload...' : 'Salvar Todas as Alterações'}
                </Button>
            </CardFooter>
        </div>
    );
}
