
'use client';
import { useState, useTransition, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';

interface TextsTabProps {
    config: SiteConfig;
}

// Structure to define the fields for the text editor with witty defaults
const textFields = {
    "Menu (Navegação)": {
        nav_story: { label: "Link 'Nossa História'", default: "Nossa Novela" },
        nav_info: { label: "Link 'Informações'", default: "Onde Vai Ser o Rolê" },
        nav_gifts: { label: "Link 'Presentes'", default: "Manda PIX" },
        nav_rsvp: { label: "Botão 'Confirmar Presença'", default: "Bora Confirmar!" },
    },
    "Capa (Hero)": {
        hero_subtitle: { label: "Frase Romântica/Divertida", default: "A gente se enrolou e finalmente vai casar!" },
        hero_date: { label: "Texto da Data", default: "21 de Setembro de 2024 - O dia do nosso 'sim' (e do open bar)." },
    },
     "Galeria de Fotos": {
        carousel_title: { label: "Título da Seção", default: "Nossa História em Fotos" },
        carousel_subtitle: { label: "Subtítulo da Seção", default: "Uma pequena viagem através de momentos especiais que nos trouxeram até aqui." },
    },
    "Confirmação (RSVP)": {
        rsvp_title: { label: "Título da Seção", default: "E aí, vai ou racha?" },
        rsvp_subtitle: { label: "Subtítulo da Seção", default: "Nosso buffet não é vidente. Confirme pra gente não pagar por quem não vem!" },
        rsvp_find_button: { label: "Botão 'Buscar Convite'", default: "Achar meu convite" },
        rsvp_confirm_button: { label: "Botão 'Confirmar Presença'", default: "Bora Festejar! 🥳" },
        rsvp_decline_button: { label: "Botão 'Recusar'", default: "Vou dar o cano 😔" },
        rsvp_lock_message_title: { label: "Título Conteúdo Bloqueado", default: "🤫 Segredo, hein?" },
        rsvp_lock_message_subtitle: { label: "Subtítulo Conteúdo Bloqueado", default: "Calma, curioso! Primeiro diz que vai, depois a gente mostra o resto." },
    },
    "Informações (Local)": {
        info_title: { label: "Título da Seção", default: "Onde Vai Ser o Rolê" },
        info_subtitle: { label: "Subtítulo da Seção", default: "Anote tudo pra não se perder e, por favor, não atrase a noiva (mais ainda)." },
        info_button: { label: "Botão 'Como Chegar'", default: "Traçar Rota" },
    },
    "Presentes (Loja)": {
        gifts_title: { label: "Título da Seção", default: "Manda um PIX!" },
        gifts_subtitle: { label: "Subtítulo da Seção", default: "O melhor presente é sua presença. Mas se quiser nos ajudar a começar a vida sem dívidas, aceitamos contribuições." },
        gifts_button: { label: "Botão 'Ver Todos'", default: "Ver todos os presentes" },
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
            await setDocument(firestore, 'config/site', { texts: texts }, { merge: true });
            toast({ title: "Textos Salvos!", description: "Todos os textos do site foram atualizados." });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>O Redator</CardTitle>
                <CardDescription>O site vem com textos prontos, mas você pode reescrever tudo com a sua voz aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="multiple" defaultValue={["Menu (Navegação)"]} className="w-full">
                    {Object.entries(textFields).map(([sectionTitle, fields]) => (
                        <AccordionItem value={sectionTitle} key={sectionTitle}>
                            <AccordionTrigger className="text-lg font-semibold">{sectionTitle}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                {Object.entries(fields).map(([key, fieldData]) => (
                                     <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                        <label htmlFor={key} className="font-medium text-sm text-muted-foreground">{fieldData.label}</label>
                                        <Input
                                            id={key}
                                            value={texts[key] || ''}
                                            onChange={(e) => handleTextChange(key, e.target.value)}
                                            placeholder={fieldData.default}
                                            className="md:col-span-2"
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                        Salvar Todos os Textos
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
