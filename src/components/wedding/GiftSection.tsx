
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

interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
}

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

        QRCode.toDataURL(code, { width: 300, margin: 2 })
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
                <h3 className="font-headline text-2xl text-[#C5A086]">Muito Obrigado!</h3>
                <p className="text-muted-foreground">{generatedMessage}</p>
                <Button onClick={onClose} className="bg-[#C5A086] hover:bg-[#b89176] text-white">Fechar</Button>
            </div>
        );
    }

    return (
        <>
            <DialogHeader className="text-left">
                <DialogTitle className="font-headline text-2xl text-[#C5A086]">{gift.title}</DialogTitle>
                <DialogDescription>
                  Para presentear, leia o QR Code ou use o "Copia e Cola" no app do seu banco. O valor já está incluído!
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
                <div className="relative w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
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
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                         <Image src={gift.imageUrl} alt={gift.title} fill className="object-cover" />
                    </div>
                    <p className="text-center text-xl font-bold text-gray-800">{gift.price}</p>
                </div>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-semibold">PIX Copia e Cola:</p>
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
            <Button type="submit" className="w-full bg-[#C5A086] hover:bg-[#b89176] text-white" onClick={handlePaymentConfirmation}>
                Já fiz a transferência!
            </Button>
        </>
    );
};


const GiftSection: React.FC<GiftSectionProps> = ({ products = [], pixKey }) => {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullListOpen, setIsFullListOpen] = useState(false);
  
  const finalPixKey = pixKey || "7bc9bb94-0ec6-499b-8f8c-1eeb1394f382";

  const handlePresentearClick = (gift: Product) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
    setIsFullListOpen(false); // Close full list if open
  };

  const GiftCard = ({ gift }: { gift: Product }) => (
    <Card className="text-left overflow-hidden group flex flex-col border-[#EAE2DA] shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0 relative">
        <div className="aspect-square w-full relative">
            {gift.imageUrl && (
              <Image
                src={gift.imageUrl}
                alt={gift.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
        </div>
        <div className="absolute top-2 right-2 bg-white/80 text-[#C5A086] font-bold text-xs px-3 py-1 rounded-full shadow-sm">{gift.price}</div>
      </CardContent>
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-base md:text-lg text-gray-800">{gift.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex-grow">{gift.description}</p>
        <Button className="w-full mt-4 bg-[#C5A086] hover:bg-[#b89176] text-white" onClick={() => handlePresentearClick(gift)}>
          <Gift className="mr-2 h-4 w-4" />
          Presentear
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <section id="gifts" className="w-full py-16 md:py-24 bg-[#FBF9F6]">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl text-[#C5A086] mb-4">Lista de Presentes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Sua presença é o nosso maior presente. Mas, se você também quiser nos mimar, criamos uma lista de presentes simbólica com muito carinho.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 8).map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
          
          {products.length > 8 && (
            <Button variant="outline" className="mt-12 border-[#C5A086] text-[#C5A086] hover:bg-[#C5A086] hover:text-white" onClick={() => setIsFullListOpen(true)}>
              Ver mais presentes
            </Button>
          )}
        </div>
      </section>

      {/* Main Gift Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedGift && <GiftModalContent gift={selectedGift} pixKey={finalPixKey} onClose={() => setIsModalOpen(false)} />}
        </DialogContent>
      </Dialog>
      
      {/* Full Gift List Modal */}
      <Dialog open={isFullListOpen} onOpenChange={setIsFullListOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-3xl text-[#C5A086]">Nossa Lista de Desejos</DialogTitle>
                <DialogDescription>Escolha como você quer nos ajudar a começar esta nova fase.</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} />
                    ))}
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="mt-4 border-[#C5A086] text-[#C5A086] hover:bg-[#C5A086] hover:text-white">Fechar</Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GiftSection;
