
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Gift, QrCode, PartyPopper } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/siteConfig';
import { generateBRCode } from '@/lib/brcode';
import QRCode from 'qrcode';

// --- COMPONENTES INTERNOS ---

/**
 * GiftCard: O componente de cartão de presente padronizado.
 * Segue a hierarquia visual e de design especificada.
 */
const GiftCard = ({ gift, onGiftClick }: { gift: Product; onGiftClick: (g: Product) => void; }) => (
    <Card 
      className="text-left overflow-hidden group flex flex-col border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full rounded-xl"
      onClick={() => onGiftClick(gift)}
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
            <Button className="w-full mt-4 !bg-primary !text-primary-foreground">
                <Gift className="mr-2 h-4 w-4" />
                Presentear
            </Button>
        </div>
    </Card>
);

/**
 * GiftModalContent: O conteúdo do modal que se parece com uma "expansão" do card.
 */
const GiftModalContent = ({ gift, pixKey, onClose }: { gift: Product; pixKey: string; onClose: () => void; }) => {
    const [brCode, setBrCode] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const value = parseFloat(gift.price.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.').trim());
        const code = generateBRCode({
            pixKey,
            value: isNaN(value) ? 0 : value,
            merchantName: "CASAMENTO",
            merchantCity: "SAO PAULO",
            txid: `GIFT${gift.id.replace(/-/g, '')}`,
        });
        setBrCode(code);

        QRCode.toDataURL(code, { width: 280, margin: 2, errorCorrectionLevel: 'H' })
            .then(url => setQrCodeUrl(url))
            .catch(err => console.error("QR Code generation failed:", err));
    }, [gift, pixKey]);

    const handleCopyPix = () => {
        if (!brCode) return;
        navigator.clipboard.writeText(brCode);
        setIsCopied(true);
        toast({
            title: "PIX Copia e Cola copiado!",
            description: "Agora é só colar no app do seu banco.",
        });
        setTimeout(() => setIsCopied(false), 3000);
    };

    if (paymentConfirmed) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center animate-in zoom-in-50">
                    <PartyPopper className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-headline text-2xl text-primary">Muito Obrigado!</h3>
                <p className="text-muted-foreground max-w-sm">{gift.funnyNote || 'Seu presente deixou os noivos pulando de alegria!'}</p>
                <Button onClick={onClose} size="lg">Fechar</Button>
            </div>
        );
    }

    return (
        <>
            <DialogHeader className="sr-only">
                <DialogTitle>{gift.title}</DialogTitle>
                <DialogDescription>Detalhes do presente e opções de pagamento PIX.</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-4">
                {/* Coluna da Esquerda: Detalhes do Presente (Consistente com o Card) */}
                <div className="flex flex-col space-y-4">
                    <div className="aspect-[4/3] w-full relative bg-muted/50 rounded-lg overflow-hidden border">
                         {gift.imageUrl ? (
                            <Image
                                src={gift.imageUrl}
                                alt={gift.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Gift className="w-16 h-16 text-muted-foreground/30" />
                            </div>
                        )}
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold text-sm px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none">{gift.price}</div>
                    </div>
                    <div className="text-left">
                        <h3 className="font-headline text-2xl text-foreground">{gift.title}</h3>
                        <p className="text-muted-foreground mt-2">{gift.description}</p>
                    </div>
                </div>

                {/* Coluna da Direita: Ações de Pagamento */}
                <div className="flex flex-col space-y-5 items-center text-center">
                    <h4 className="font-headline text-lg text-primary">Presenteie com PIX</h4>
                    <div className="relative w-full max-w-[250px] mx-auto aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border p-4">
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt={`QR Code para ${gift.title}`} width={250} height={250} className="object-contain" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <QrCode className="w-10 h-10 animate-pulse" />
                                <p className="text-sm mt-2">Gerando QR Code...</p>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">Aponte a câmera do seu celular para o QR Code</p>

                    <div className="w-full max-w-sm">
                        <p className="text-sm text-muted-foreground mb-2">Ou use o PIX Copia e Cola:</p>
                        <div className="flex items-center gap-2">
                            <Input 
                                readOnly 
                                value={brCode || "Gerando código..."} 
                                className="text-xs text-muted-foreground truncate h-10" 
                            />
                            <Button variant="outline" size="icon" onClick={handleCopyPix} disabled={!brCode}>
                                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="w-full max-w-sm pt-2">
                        <Button size="lg" className="w-full !bg-primary !text-primary-foreground" onClick={() => setPaymentConfirmed(true)}>
                            Já fiz a transferência!
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};


// --- COMPONENTE PRINCIPAL ---

interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
  texts?: { [key: string]: string };
}

const GiftSection: React.FC<GiftSectionProps> = ({ products = [], pixKey, texts = {} }) => {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullListOpen, setIsFullListOpen] = useState(false);
  
  const finalPixKey = pixKey || "seu-pix-aqui";

  const handleGiftClick = (gift: Product) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsModalOpen(false);
    // Adiciona um delay para a animação de saída do modal antes de limpar os dados
    setTimeout(() => setSelectedGift(null), 300);
  }

  // Skeleton para loading
  const renderSkeletons = () => (
    Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <div className="w-full bg-muted animate-pulse rounded-lg aspect-[4/3]"></div>
        <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded-lg w-full mt-2"></div>
      </div>
    ))
  );

  return (
    <>
      <section id="gifts" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl text-primary mb-4">{texts.gifts_title || 'Lista de Presentes'}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-12">
            {texts.gifts_subtitle || 'Sua presença é o nosso maior presente. Mas, se você também quiser nos mimar, criamos uma lista de presentes simbólica com muito carinho.'}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {!products || products.length === 0 
              ? renderSkeletons() 
              : products.slice(0, 8).map((gift) => (
                  <GiftCard key={gift.id} gift={gift} onGiftClick={handleGiftClick} />
                ))}
          </div>
          
          {products.length > 8 && (
            <Button variant="outline" size="lg" className="mt-12">
              {texts.gifts_button || 'Ver todos os presentes'}
            </Button>
          )}
        </div>
      </section>
      
      {/* Modal da Lista Completa (ainda não implementado para manter a simplicidade, mas a estrutura está pronta) */}
      <Dialog open={isFullListOpen} onOpenChange={setIsFullListOpen}>
         {/* O conteúdo para a lista completa iria aqui, reutilizando o GiftCard */}
      </Dialog>

      {/* Modal de Pagamento */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleClosePaymentModal(); }}>
        <DialogContent className="max-w-4xl">
          {selectedGift && <GiftModalContent gift={selectedGift} pixKey={finalPixKey} onClose={handleClosePaymentModal} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GiftSection;

    