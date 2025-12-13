
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Gift, QrCode, PartyPopper } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/siteConfig';
import { generateBRCode } from '@/lib/brcode';
import QRCode from 'qrcode';

interface GiftPaymentModalProps {
    gift: Product;
    pixKey: string;
    onClose: () => void;
}

const GiftPaymentModal = ({ gift, pixKey, onClose }: GiftPaymentModalProps) => {
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
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 bg-background rounded-lg">
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
        <div className="flex flex-col md:flex-row items-start bg-background rounded-lg w-full max-h-[90vh] md:max-h-none overflow-y-auto">
            {/* Coluna da Esquerda: Detalhes do Presente */}
            <div className="w-full md:w-1/2 flex flex-col space-y-4 p-6 md:p-8 flex-shrink-0">
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
            <div className="w-full md:w-1/2 flex flex-col space-y-5 items-center text-center bg-muted/50 p-6 md:p-8 h-full justify-center flex-shrink-0">
                <h4 className="font-headline text-lg text-primary">Presenteie com PIX</h4>
                <div className="relative w-full max-w-[220px] mx-auto aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border p-4">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt={`QR Code para ${gift.title}`} width={220} height={220} className="object-contain" />
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
                            className="text-xs text-muted-foreground truncate h-10 bg-background" 
                        />
                        <Button variant="outline" size="icon" onClick={handleCopyPix} disabled={!brCode} className="bg-background">
                            {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
                
                <div className="w-full max-w-sm pt-2">
                    <Button size="lg" className="w-full" onClick={() => setPaymentConfirmed(true)}>
                        Já fiz a transferência!
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GiftPaymentModal;
