
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Gift, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/siteConfig';
import { generateBRCode } from '@/lib/brcode';
import QRCode from 'qrcode';

// O novo componente de cartão de presente para garantir consistência
const GiftCard = ({ gift, onGiftClick }: { gift: Product; onGiftClick: (g: Product) => void; }) => (
    <Card className="text-left overflow-hidden group flex flex-col border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full rounded-xl">
      <CardContent className="p-0 relative">
        <div className="aspect-[4/3] w-full relative">
            {gift.imageUrl && (
              <Image
                src={gift.imageUrl}
                alt={gift.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
        </div>
        <div className="absolute top-3 right-3 bg-background/80 text-primary font-bold text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">{gift.price}</div>
      </CardContent>
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h3 className="font-headline text-lg text-foreground leading-tight">{gift.title}</h3>
        <p className="text-sm text-muted-foreground mt-2 flex-grow line-clamp-3">{gift.description}</p>
        <Button className="w-full mt-4" onClick={() => onGiftClick(gift)}>
          <Gift className="mr-2" />
          Presentear
        </Button>
      </div>
    </Card>
);


const GiftModalContent = ({ gift, pixKey, onClose }: { gift: Product; pixKey: string; onClose: () => void; }) => {
    const [brCode, setBrCode] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const value = parseFloat(gift.price.replace('R$', '').replace('.', '').replace(',', '.').trim());
        const code = generateBRCode({
            pixKey: pixKey,
            value: value,
            merchantName: "CASAMENTO CLAUDIA & RAFAEL",
            merchantCity: "SAO PAULO",
            txid: '***',
        });
        setBrCode(code);

        QRCode.toDataURL(code, { width: 300, margin: 2, errorCorrectionLevel: 'H' })
            .then(url => setQrCodeUrl(url))
            .catch(err => console.error("QR Code generation failed:", err));

    }, [gift, pixKey]);

    const handleCopyPix = () => {
        navigator.clipboard.writeText(brCode);
        setIsCopied(true);
        toast({
            title: "PIX Copia e Cola copiado!",
            description: "Agora é só colar no app do seu banco.",
        });
        setTimeout(() => setIsCopied(false), 3000);
    };

    const handlePaymentConfirmation = () => {
        setPaymentConfirmed(true);
        const message = gift.funnyNote || 'Seu presente deixou os noivos pulando de alegria! Muito obrigado!';
        setGeneratedMessage(message);
    };

    if (paymentConfirmed) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
                    <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="24" strokeDashoffset="24" /></svg>
                </div>
                <h3 className="font-headline text-2xl text-primary">Muito Obrigado!</h3>
                <p className="text-muted-foreground">{generatedMessage}</p>
                <Button onClick={onClose} >Fechar</Button>
            </div>
        );
    }

    return (
        <>
            <DialogHeader className="text-left">
                <DialogTitle className="font-headline text-2xl md:text-3xl text-primary">{gift.title}</DialogTitle>
                <DialogDescription>
                  Para presentear, aponte a câmera para o QR Code ou use o "Copia e Cola". O valor já está incluído!
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
                <div className="relative w-full max-w-xs mx-auto aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                    {qrCodeUrl ? (
                         <Image src={qrCodeUrl} alt={`QR Code para ${gift.title}`} width={300} height={300} className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <QrCode className="w-10 h-10 text-muted-foreground animate-pulse" />
                            <p className="text-sm text-muted-foreground mt-2">Gerando QR Code...</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
                         <Image src={gift.imageUrl} alt={gift.title} fill className="object-cover" />
                    </div>
                     <p className="text-center text-2xl font-bold font-headline text-primary">{gift.price}</p>
                </div>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">PIX Copia e Cola:</p>
                <div className="flex items-center gap-2 rounded-md border bg-muted p-2">
                  <p className="text-xs text-muted-foreground break-all flex-1">{brCode}</p>
                  <Button variant="ghost" size="icon" onClick={handleCopyPix}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
            </div>
             <div className="space-y-2 pt-2">
                <label htmlFor="payerName" className="text-sm font-medium">Seu nome (para sabermos a quem agradecer!)</label>
                <Input id="payerName" className="w-full" placeholder="Seu nome completo"/>
            </div>
            <Button type="submit" className="w-full" onClick={handlePaymentConfirmation}>
                Já fiz a transferência!
            </Button>
        </>
    );
};


interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
  texts?: { [key: string]: string };
}


const GiftSection: React.FC<GiftSectionProps> = ({ products = [], pixKey, texts = {} }) => {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullListOpen, setIsFullListOpen] = useState(false);
  
  const finalPixKey = pixKey || "7bc9bb94-0ec6-499b-8f8c-1eeb1394f382";

  const handlePresentearClick = (gift: Product) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedGift(null), 300);
  }


  return (
    <>
      <section id="gifts" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">{texts.gifts_title || 'Lista de Presentes'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            {texts.gifts_subtitle || 'Sua presença é o nosso maior presente. Mas, se você também quiser nos mimar, criamos uma lista de presentes simbólica com muito carinho.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 8).map((gift) => (
              <GiftCard key={gift.id} gift={gift} onGiftClick={handlePresentearClick} />
            ))}
          </div>
          
          {products.length > 8 && (
            <Button variant="outline" size="lg" className="mt-12" onClick={() => setIsFullListOpen(true)}>
              {texts.gifts_button || 'Ver todos os presentes'}
            </Button>
          )}
        </div>
      </section>
      
      <Dialog open={isFullListOpen} onOpenChange={setIsFullListOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-3xl text-primary">Nossa Lista de Desejos</DialogTitle>
                <DialogDescription>Escolha como você quer nos ajudar a começar esta nova fase.</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} onGiftClick={handlePresentearClick} />
                    ))}
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="mt-4">Fechar</Button>
            </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleClosePaymentModal(); }}>
        <DialogContent className="sm:max-w-3xl">
          {selectedGift && <GiftModalContent gift={selectedGift} pixKey={finalPixKey} onClose={handleClosePaymentModal} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GiftSection;

    