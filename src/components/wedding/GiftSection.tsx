'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Gift, QrCode, ArrowRight, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/siteConfig';
import { generateBRCode } from '@/lib/brcode';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface GiftSectionProps {
  products?: Product[];
  pixKey?: string;
}

const GiftCard = ({ product, onClick }: { product: Product; onClick: () => void }) => (
  <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white flex flex-col h-full">
    <div className="relative aspect-[4/5] overflow-hidden">
      <Image
        src={product.imageUrl}
        alt={product.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
        <span className="text-primary font-bold text-sm">{product.price}</span>
      </div>
    </div>
    <CardContent className="p-5 flex flex-col flex-grow text-center">
      <h3 className="font-headline text-xl text-primary mb-2 line-clamp-1">{product.title}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
      <Button 
        onClick={onClick}
        className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border-none shadow-none transition-colors"
      >
        <Gift className="mr-2 h-4 w-4" />
        Presentear
      </Button>
    </CardContent>
  </Card>
);

export default function GiftSection({ products = [], pixKey }: GiftSectionProps) {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [showFullList, setShowFullList] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'SUCCESS'>('DETAILS');
  const [brCode, setBrCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const finalPixKey = pixKey || "7bc9bb94-0ec6-499b-8f8c-1eeb1394f382";

  useEffect(() => {
    if (selectedGift) {
      const val = parseFloat(selectedGift.price.replace(/[^\d,]/g, '').replace(',', '.'));
      const code = generateBRCode({
        pixKey: finalPixKey,
        value: val,
        merchantName: "CASAMENTO",
        merchantCity: "SAO PAULO",
      });
      setBrCode(code);
      QRCode.toDataURL(code, { width: 400, margin: 1 }).then(setQrCodeUrl);
      setPaymentStep('DETAILS');
    }
  }, [selectedGift, finalPixKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(brCode);
    setIsCopied(true);
    toast({ title: "Copiado!", description: "Código PIX copiado com sucesso." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="gifts" className="py-24 px-4 bg-[#fdfaf7]">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-16">
        <div className="flex items-center justify-center gap-2 text-primary/60 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="uppercase tracking-[0.3em] text-xs font-bold">Mimos para os Noivos</span>
          <Star className="h-4 w-4 fill-current" />
        </div>
        <h2 className="font-headline text-4xl md:text-6xl text-primary">Lista de Presentes</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
          "Sua presença é essencial, mas se quiser nos presentear, criamos esta lista com muito carinho."
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.slice(0, 8).map(p => (
          <GiftCard key={p.id} product={p} onClick={() => setSelectedGift(p)} />
        ))}
      </div>

      {products.length > 8 && (
        <div className="mt-16 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full border-primary text-primary hover:bg-primary hover:text-white px-10 h-14 text-lg"
            onClick={() => setShowFullList(true)}
          >
            Ver todos os presentes <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      {/* MODAL: LISTA COMPLETA */}
      <Dialog open={showFullList} onOpenChange={setShowFullList}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[#fdfaf7]">
          <DialogHeader className="p-8 pb-4 text-center">
            <DialogTitle className="font-headline text-4xl text-primary">Nossa Vitrine de Desejos</DialogTitle>
            <DialogDescription className="text-lg">Escolha como participar da nossa nova história.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <GiftCard key={p.id} product={p} onClick={() => setSelectedGift(p)} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: PAGAMENTO */}
      <Dialog open={!!selectedGift} onOpenChange={(o) => !o && setSelectedGift(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedGift && paymentStep === 'DETAILS' && (
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto">
                <Image src={selectedGift.imageUrl} alt={selectedGift.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-8 md:w-1/2 space-y-6 flex flex-col justify-center bg-white">
                <div>
                  <h3 className="font-headline text-3xl text-primary mb-2">{selectedGift.title}</h3>
                  <div className="text-2xl font-bold text-primary/80 mb-4">{selectedGift.price}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedGift.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-center bg-muted/30 p-2 rounded-lg">
                    {qrCodeUrl ? (
                      <Image src={qrCodeUrl} alt="QR Code PIX" width={180} height={180} className="rounded-md" />
                    ) : (
                      <div className="w-[180px] h-[180px] animate-pulse bg-muted rounded-md" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">PIX Copia e Cola</p>
                    <div className="flex gap-2">
                      <Input value={brCode} readOnly className="text-[10px] bg-muted/50 border-none" />
                      <Button size="icon" onClick={handleCopy} variant="outline" className="shrink-0">
                        {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full h-12 shadow-lg" onClick={() => setPaymentStep('SUCCESS')}>
                    Já fiz o PIX!
                  </Button>
                </div>
              </div>
            </div>
          )}

          {paymentStep === 'SUCCESS' && selectedGift && (
            <div className="p-12 text-center space-y-6 bg-white">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-success-icon">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="font-headline text-3xl text-primary">Muito Obrigado!</h3>
              <p className="text-muted-foreground text-lg italic">
                "{selectedGift.funnyNote || "Seu presente nos deixou imensamente felizes!"}"
              </p>
              <Button variant="outline" className="rounded-full px-8" onClick={() => setSelectedGift(null)}>
                Voltar para a lista
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
