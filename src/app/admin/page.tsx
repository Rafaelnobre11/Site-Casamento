
'use client';
import { useState, useTransition, useEffect } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, Users, Palette, Type, Gift, Layers, Save } from 'lucide-react';
import GuestsTab from '@/components/admin/GuestsTab';
import CustomizeTab from '@/components/admin/CustomizeTab';
import TextsTab from '@/components/admin/TextsTab';
import ShopTab from '@/components/admin/ShopTab';
import LayoutTab from '@/components/admin/LayoutTab';
import type { SiteConfig } from '@/types/siteConfig';
import { defaultGifts } from '@/lib/default-gifts';

export default function AdminPage() {
    const { data: initialSiteConfig, loading: loadingConfig } = useDoc<SiteConfig>('config/site');
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [activeTab, setActiveTab] = useState('guests');
    const [isSaving, startSaving] = useTransition();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    useEffect(() => {
        if (initialSiteConfig) {
            const products = (!initialSiteConfig.products || initialSiteConfig.products.length === 0) 
              ? defaultGifts 
              : initialSiteConfig.products;

            setConfig({
                names: 'Cláudia & Rafael',
                date: '2025-09-21T16:00:00',
                time: '16:00',
                customColors: {},
                carouselImages: [],
                layoutOrder: ['hero', 'countdown', 'carousel', 'rsvp', 'event', 'gifts'],
                ...initialSiteConfig,
                texts: initialSiteConfig.texts || {},
                products,
            });
        }
    }, [initialSiteConfig]);

    const handleConfigChange = (newConfig: Partial<SiteConfig>) => {
        setConfig(prev => prev ? { ...prev, ...newConfig } : null);
    };

    const handleSave = () => {
        if (!config || !firestore) {
            toast({ variant: 'destructive', title: "Erro", description: "Configuração não carregada ou sem conexão." });
            return;
        }

        startSaving(async () => {
            try {
                await setDocument(firestore, 'config/site', config);
                toast({ title: "Salvo!", description: "Suas configurações foram salvas com sucesso." });
            } catch (error) {
                console.error("Error saving config:", error);
                toast({ variant: 'destructive', title: "Erro ao Salvar", description: "Não foi possível salvar as configurações." });
            }
        });
    };

    if (loadingConfig || !config) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Carregando painel...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/50">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl">Painel dos Noivos</h1>
                    <Button onClick={handleSave} disabled={isSaving} size="lg">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                        Salvar Alterações
                    </Button>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                        <TabsTrigger value="guests" className="flex-col md:flex-row gap-2 h-14"><Users /> Convidados</TabsTrigger>
                        <TabsTrigger value="customize" className="flex-col md:flex-row gap-2 h-14"><Palette /> Personalizar</TabsTrigger>
                        <TabsTrigger value="texts" className="flex-col md:flex-row gap-2 h-14"><Type /> Textos</TabsTrigger>
                        <TabsTrigger value="shop" className="flex-col md:flex-row gap-2 h-14"><Gift /> Loja</TabsTrigger>
                        <TabsTrigger value="layout" className="flex-col md:flex-row gap-2 h-14"><Layers /> Layout</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="guests">
                        <GuestsTab />
                    </TabsContent>
                    <TabsContent value="customize">
                        <CustomizeTab config={config} onConfigChange={handleConfigChange} />
                    </TabsContent>
                    <TabsContent value="texts">
                        <TextsTab config={config} onConfigChange={handleConfigChange} />
                    </TabsContent>
                    <TabsContent value="shop">
                        <ShopTab config={config} onConfigChange={handleConfigChange} />
                    </TabsContent>
                    <TabsContent value="layout">
                        <LayoutTab config={config} onConfigChange={handleConfigChange} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
