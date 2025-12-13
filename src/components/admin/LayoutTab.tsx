'use client';
import { useState, useTransition, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';
import { cn } from '@/lib/utils';

interface LayoutTabProps {
    config: SiteConfig;
}

const componentNames: { [key: string]: string } = {
    hero: 'Capa Principal',
    countdown: 'Contagem Regressiva',
    carousel: 'Galeria de Fotos',
    rsvp: 'Confirmação de Presença',
    event: 'Informações do Evento',
    gifts: 'Lista de Presentes',
};

export default function LayoutTab({ config }: LayoutTabProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [layout, setLayout] = useState(config.layoutOrder || []);

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...layout];
        if (direction === 'up' && index > 0) {
            [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
        }
        if (direction === 'down' && index < newLayout.length - 1) {
            [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
        }
        setLayout(newLayout);
    };

    const handleSaveLayout = () => {
        startTransition(async () => {
            if (!firestore) return;
            await setDocument(firestore, 'config/site', { layoutOrder: layout }, { merge: true });
            toast({ title: "Layout Salvo!", description: "A ordem das seções foi atualizada." });
        });
    };
    
    // Ensure rsvp is always after hero and moments
    useEffect(() => {
        const heroIndex = layout.indexOf('hero');
        const rsvpIndex = layout.indexOf('rsvp');

        const desiredRsvpIndex = heroIndex + 1;

        if (rsvpIndex < desiredRsvpIndex) {
            const newLayout = layout.filter(item => item !== 'rsvp');
            newLayout.splice(desiredRsvpIndex, 0, 'rsvp');
            setLayout(newLayout);
        }

    }, [layout]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>O Arquiteto (Layout)</CardTitle>
                <CardDescription>Decida a ordem das coisas no seu site. Quer os presentes antes das fotos? É só mover os blocos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-2">
                    {layout.map((item, index) => (
                        <li key={item} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <span className="font-medium">{componentNames[item] || item}</span>
                                {(item === 'hero' || item === 'rsvp') && (
                                     <span className="text-xs text-muted-foreground">(fixo)</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleMove(index, 'up')} 
                                    disabled={index === 0 || ['hero', 'rsvp'].includes(item)}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleMove(index, 'down')} 
                                    disabled={index === layout.length - 1 || ['hero', 'rsvp'].includes(item)}
                                >
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                <Button onClick={handleSaveLayout} disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : 'Salvar Ordem'}
                </Button>
            </CardContent>
        </Card>
    );
}
