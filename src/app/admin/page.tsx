'use client';
import { useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Palette, Type, Gift, Layers } from 'lucide-react';
import GuestsTab from '@/components/admin/GuestsTab';
import CustomizeTab from '@/components/admin/CustomizeTab';
import TextsTab from '@/components/admin/TextsTab';
import ShopTab from '@/components/admin/ShopTab';
import LayoutTab from '@/components/admin/LayoutTab';
import type { SiteConfig } from '@/types/siteConfig';
import { defaultGifts } from '@/lib/default-gifts';

export default function AdminPage() {
    const { data: siteConfig, loading: loadingConfig } = useDoc<SiteConfig>('config/site');
    const [activeTab, setActiveTab] = useState('guests');

    if (loadingConfig) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Carregando painel...</p>
            </div>
        );
    }
    
    // Create a processed config object
    const processedConfig = {
        ...(siteConfig || {}), // Start with loaded config or empty object
    };

    // If products are explicitly null/undefined or an empty array in Firestore, populate with defaults.
    // This ensures that if the user deletes all gifts, the default list reappears.
    if (!processedConfig.products || processedConfig.products.length === 0) {
        processedConfig.products = defaultGifts;
    }
    
    // Ensure other fields have default values if they are missing
    const config: SiteConfig = {
        names: 'Cláudia & Rafael',
        date: '2025-09-21T16:00:00',
        time: '16:00',
        texts: {},
        customColors: {},
        carouselImages: [],
        layoutOrder: ['hero', 'countdown', 'carousel', 'rsvp', 'event', 'gifts'],
        ...processedConfig, // Spread the processed config over the defaults
    };


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/50">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center">
                    <h1 className="font-headline text-3xl">Painel dos Noivos</h1>
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
                        <CustomizeTab config={config} />
                    </TabsContent>
                    <TabsContent value="texts">
                        <TextsTab config={config} />
                    </TabsContent>
                    <TabsContent value="shop">
                        <ShopTab config={config} />
                    </TabsContent>
                    <TabsContent value="layout">
                        <LayoutTab config={config} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
