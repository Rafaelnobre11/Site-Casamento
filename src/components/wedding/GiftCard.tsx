
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Gift } from 'lucide-react';
import type { Product } from '@/types/siteConfig';
import GiftPaymentModal from './GiftPaymentModal';

interface GiftCardProps {
  gift: Product;
  pixKey?: string;
}

const GiftCard = ({ gift, pixKey }: GiftCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGiftClick = () => {
        setIsModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsModalOpen(false);
    }

    return (
        <>
            <Card 
                className="text-left overflow-hidden group flex flex-col border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full rounded-xl cursor-pointer"
                onClick={handleGiftClick}
            >
                <div className="aspect-[4/3] w-full relative bg-muted/50 overflow-hidden">
                    {gift.imageUrl ? (
                        <Image
                            src={gift.imageUrl}
                            alt={gift.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Gift className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold text-sm px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none">{gift.price}</div>
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <h3 className="font-headline text-lg text-foreground leading-tight">{gift.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 flex-grow line-clamp-3">{gift.description}</p>
                    <Button variant="outline" className="w-full mt-4">
                        <Gift className="mr-2 h-4 w-4" />
                        Presentear
                    </Button>
                </div>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleClosePaymentModal(); }}>
                <DialogContent className="max-w-4xl p-0 border-0">
                    <GiftPaymentModal gift={gift} pixKey={pixKey || ''} onClose={handleClosePaymentModal} />
                </DialogContent>
            </Dialog>
        </>
    );
};


export default GiftCard;
