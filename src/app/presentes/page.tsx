
'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { SiteConfig, Product } from '@/types/siteConfig';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import GiftCard from '@/components/wedding/GiftCard';
import { Button } from '@/components/ui/button';
import { defaultGifts } from '@/lib/default-gifts';

export default function GiftCatalogPage() {
    const { data: siteConfig, loading } = useDoc<SiteConfig>('config/site');

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const products = siteConfig?.products && siteConfig.products.length > 0 ? siteConfig.products : defaultGifts;
    const pixKey = siteConfig?.pixKey;

    return (
        <div className="bg-muted/40 min-h-screen">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
                <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                     <Button variant="outline" asChild>
                        <Link href="/#gifts">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o Site
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
                 <div className="text-left mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl">Catálogo Completo</h1>
                    <p className="text-muted-foreground mt-2">Todos os presentes disponíveis para mimar os noivos.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {products.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} pixKey={pixKey} />
                    ))}
                </div>
            </main>
        </div>
    );
}
