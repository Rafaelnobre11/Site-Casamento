
'use client';
import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';
import { cn } from '@/lib/utils';

interface LayoutTabProps {
    config: SiteConfig;
    onConfigChange: (newConfig: Partial<SiteConfig>) => void;
}

const componentNames: { [key: string]: string } = {
    hero: 'Capa Principal',
    countdown: 'Contagem Regressiva',
    carousel: 'Galeria de Fotos',
    rsvp: 'Confirmação de Presença',
    event: 'Informações do Evento',
    gifts: 'Lista de Presentes',
};

// Define quais componentes não podem ser movidos
const fixedComponents = ['hero', 'rsvp'];

export default function LayoutTab({ config, onConfigChange }: LayoutTabProps) {
    const layout = config.layoutOrder || [];

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...layout];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newLayout.length) {
            [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
            onConfigChange({ layoutOrder: newLayout });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>O Arquiteto (Layout)</CardTitle>
                <CardDescription>Arraste e solte para reordenar as secções do seu site. Alguns itens são fixos para garantir a melhor experiência.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-2">
                    {layout.map((item, index) => {
                        const isFixed = fixedComponents.includes(item);
                        return (
                             <li key={item} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                <div className="flex items-center gap-3">
                                    <GripVertical className={cn("h-5 w-5 text-muted-foreground", !isFixed && "cursor-grab")} />
                                    <span className="font-medium">{componentNames[item] || item}</span>
                                    {isFixed && (
                                         <span className="text-xs text-muted-foreground">(fixo)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleMove(index, 'up')} 
                                        disabled={isFixed || index === 0 || fixedComponents.includes(layout[index - 1])}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleMove(index, 'down')} 
                                        disabled={isFixed || index === layout.length - 1}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
