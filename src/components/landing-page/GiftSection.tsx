'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast"
import { Copy, Check } from 'lucide-react';
import { getCharmingMessage } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/siteConfig';

const defaultGifts: Product[] = [
  { 
    id: 'gift-1',
    title: '1 Hora de Open Bar',
    price: 'R$ 50,00',
    description: 'Garanta a alegria dos noivos (e a sua) com mais uma hora de bons drinks.',
    funnyNote: "Boaaa! Você não é apenas um convidado, é um investidor-anjo da nossa alegria. O primeiro brinde será em sua homenagem!",
    imageUrl: 'https://picsum.photos/seed/gift1/400/250'
  },
  {
    id: 'gift-2',
    title: 'Paciência para o Noivo',
    price: 'R$ 150,00',
    description: 'Um investimento na paz conjugal. A noiva agradece e o terapeuta também.',
    funnyNote: "Você fez uma contribuição valiosíssima para a harmonia deste lar. A noiva agradece em dobro. Prometemos usar com sabedoria!",
    imageUrl: 'https://picsum.photos/seed/gift2/400/250'
  },
  { 
    id: 'gift-3',
    title: 'Kit Anti-Ressaca',
    price: 'R$ 250,00',
    description: 'Para sobrevivermos à festa e à lua de mel. Inclui analgésicos e muita água de coco.',
    funnyNote: "Herói(na)! Graças a você nossa lua de mel não será apenas à base de água e analgésicos. Sua generosidade será lembrada na manhã seguinte!",
    imageUrl: 'https://picsum.photos/seed/gift3/400/250'
  },
  { 
    id: 'gift-4',
    title: 'Curso de Culinária para a Noiva',
    price: 'R$ 500,00',
    description: 'Ajude o noivo a não viver de delivery. Uma causa nobre pela gastronomia do lar.',
    funnyNote: "Ufa! Você salvou o noivo de uma vida de miojo e delivery. Ele está emocionadíssimo com a sua generosidade e preocupação com a saúde dele.",
    imageUrl: 'https://picsum.photos/seed/gift4/400/250'
  },
];


interface GiftSectionProps {
  texts?: { [key: string]: string };
  products?: Product[];
  pixKey?: string;
}

export default function GiftSection({ texts = {}, products, pixKey }: GiftSectionProps) {
  const [selectedGift, setSelectedGift] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullListOpen, setIsFullListOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');

  const { toast } = useToast();
  
  const allGifts = products && products.length > 0 ? products : defaultGifts;
  const finalPixKey = pixKey || "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8";

  const handlePresentearClick = (gift: Product) => {
    setSelectedGift(gift);
    setPaymentConfirmed(false);
    setPixCopied(false);
    setGeneratedMessage('');
    setIsModalOpen(true);
    setIsFullListOpen(false); // Close full list if open
  };
  
  const handleCopyPix = () => {
    navigator.clipboard.writeText(finalPixKey);
    setPixCopied(true);
    toast({
        title: "PIX Copiado!",
        description: "Agora é só colar no app do seu banco e fazer a mágica.",
    });
    setTimeout(() => setPixCopied(false), 2000);
  }

  const handlePaymentConfirmation = async () => {
      setPaymentConfirmed(true);
      const message = selectedGift?.funnyNote || 'Seu presente deixou os noivos pulando de alegria! Muito obrigado!';
      setGeneratedMessage(message);
  }

  const GiftCard = ({ gift }: { gift: Product }) => {
    return (
        <Card className="text-left overflow-hidden group flex flex-col">
            <CardContent className="p-0 relative">
            {gift.imageUrl && (
                <Image
                src={gift.imageUrl}
                alt={gift.title}
                width={400}
                height={250}
                className="w-full h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
            )}
            <div className="absolute top-2 right-2 bg-background/80 text-foreground font-bold text-sm px-3 py-1 rounded-full shadow">{gift.price}</div>
            </CardContent>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg">{gift.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 h-12 flex-grow">{gift.description}</p>
                <Button className="w-full mt-4" onClick={() => handlePresentearClick(gift)}>
                    Quero dar esse!
                </Button>
            </div>
        </Card>
    );
  };


  return (
    <>
      <section id="gifts" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-headline text-4xl md:text-5xl mb-4">{texts.gifts_title || 'Manda um PIX!'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            {texts.gifts_subtitle || 'O melhor presente é sua presença. Mas se quiser nos ajudar a começar a vida sem dívidas, aceitamos contribuições. Nada de faqueiro, por favor!'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {allGifts.slice(0, 3).map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>

          <Button variant="outline" className="mt-12" onClick={() => setIsFullListOpen(true)}>
            {texts.gifts_button || 'Ver todos os presentes'}
          </Button>
        </div>
      </section>

      {/* Main Gift Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {!paymentConfirmed ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{selectedGift?.title}</DialogTitle>
                <DialogDescription>
                  Seu carinho em forma de PIX vai direto pro nosso cofrinho. Agradecemos de coração!
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm font-semibold">Chave PIX dos Noivos:</p>
                <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                  <p className="text-sm text-muted-foreground truncate flex-1">{finalPixKey}</p>
                  <Button variant="ghost" size="icon" onClick={handleCopyPix}>
                    {pixCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                 <div className="space-y-2">
                    <label htmlFor="payerName" className="text-sm font-medium">Seu nome (pra gente saber quem agradecer)</label>
                    <Input id="payerName" className="w-full" placeholder="Seu nome completo"/>
                </div>
              </div>
              <Button type="submit" className="w-full" onClick={handlePaymentConfirmation}>
                Já fiz o PIX!
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-icon">
                    <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="24" strokeDashoffset="24" /></svg>
                </div>
                <h3 className="font-headline text-2xl">Show! Muito Obrigado!</h3>
                <p className="text-muted-foreground">{generatedMessage}</p>
                <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Full Gift List Modal */}
      <Dialog open={isFullListOpen} onOpenChange={setIsFullListOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-3xl">Nossa Lista de Desejos (Sincera)</DialogTitle>
                <DialogDescription>Escolha como você quer nos ajudar a começar essa nova fase.</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGifts.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} />
                    ))}
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="mt-4">Fechar</Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
