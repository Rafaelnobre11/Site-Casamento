'use client';
import { useState, useTransition, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';

interface TextsTabProps {
    config: SiteConfig;
}

// Structure to define the fields for the text editor
const textFields = {
    "Menu (Navegação)": {
        nav_story: "Nossa Novela",
        nav_info: "Onde Vai Ser o Rolê",
        nav_gifts: "Manda PIX",
        nav_rsvp: "Bora Confirmar!",
    },
    "Capa (Hero)": {
        hero_subtitle: "A gente se enrolou e vai casar!",
        hero_title: "Jessica & Lucas",
        hero_date: "21 de Setembro de 2024 - O dia do nosso \'sim\' (e do open bar).",
        hero_cta: "Vem beber de graça!",
    },
    "Confirmação (RSVP)": {
        rsvp_title: "E aí, vai ou racha?",
        rsvp_subtitle: "Nosso buffet não é vidente. Confirme pra gente não pagar por quem não vem!",
        rsvp_find_button: "Achar meu convite",
        rsvp_confirm_button: "Bora Festejar! 🥳",
        rsvp_decline_button: "Vou dar o cano 😔",
        rsvp_lock_message_title: "🤫 Segredo, hein?",
        rsvp_lock_message_subtitle: "Calma, curioso! Primeiro diz que vai, depois a gente te mostra onde é a festa e como nos ajudar a ficar menos duros.",
    },
    "Informações (Local)": {
        info_title: "Onde Vai Ser o Rolê",
        info_subtitle: "Anote tudo pra não se perder e, por favor, não atrase a noiva (mais ainda).",
        info_button: "Traçar Rota",
    },
    "Presentes (Loja)": {
        gifts_title: "Manda um PIX!",
        gifts_subtitle: "O melhor presente é sua presença. Mas se quiser nos ajudar a começar a vida sem dívidas, aceitamos contribuições. Nada de faqueiro, por favor!",
        gifts_button: "Ver todos os presentes",
    },
};

export default function TextsTab({ config }: TextsTabProps) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [texts, setTexts] = useState(config.texts || {});

    useEffect(() => {
        setTexts(config.texts || {});
    }, [config]);

    const handleTextChange = (key: string, value: string) => {
        setTexts(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            if (!firestore) return;
            await setDocument(firestore, 'config/site', { texts: texts });
            toast({ title: "Textos Salvos!", description: "Todos os textos do site foram atualizados." });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>O Redator</CardTitle>
                <CardDescription>O site vem com textos prontos, mas você pode reescrever tudo com a sua voz aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="multiple" defaultValue={["Menu (Navegação)"]} className="w-full">
                    {Object.entries(textFields).map(([sectionTitle, fields]) => (
                        <AccordionItem value={sectionTitle} key={sectionTitle}>
                            <AccordionTrigger className="text-lg font-semibold">{sectionTitle}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                {Object.entries(fields).map(([key, defaultText]) => (
                                     <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                        <label htmlFor={key} className="font-medium text-sm text-muted-foreground">{defaultText}</label>
                                        <Input
                                            id={key}
                                            value={texts[key] || ''}
                                            onChange={(e) => handleTextChange(key, e.target.value)}
                                            placeholder={defaultText}
                                            className="md:col-span-2"
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : 'Salvar Todos os Textos'}
                </Button>
            </CardContent>
        </Card>
    );
}
