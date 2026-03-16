
'use client';
import { useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import type { SiteConfig } from '@/types/siteConfig';

interface TextsTabProps {
    config: SiteConfig;
    onConfigChange: (newConfig: Partial<SiteConfig>) => void;
}

// Structure to define the fields for the text editor with witty defaults
const textFields = {
    "Menu (Navegação)": {
        nav_story: { label: "Link 'Nossa História'", default: "Nossa Novela" },
        nav_info: { label: "Link 'Informações'", default: "Onde Vai Ser o Rolê" },
        nav_gifts: { label: "Link 'Presentes'", default: "Manda PIX" },
        nav_rsvp: { label: "Botão 'Confirmar Presença'", default: "Bora beber de graça!" },
    },
    "Capa (Hero)": {
        hero_date: { label: "Texto da Data", default: "21 de Setembro de 2024" },
        hero_subtitle: { label: "Frase de Efeito", default: "O amor é lindo, a festa é cara e a gente aceita PIX em vez de faqueiro de prata." },
    },
     "Galeria de Fotos": {
        carousel_title: { label: "Título da Seção", default: "Nossa História em Fotos" },
        carousel_subtitle: { label: "Subtítulo da Seção", default: "Uma pequena viagem através de momentos especiais que nos trouxeram até aqui." },
    },
    "Confirmação (RSVP)": {
        rsvp_title: { label: "Título da Seção", default: "Bora ou não bora?" },
        rsvp_subtitle: { label: "Subtítulo da Seção", default: "Precisamos saber quantos pratos lavar. Por favor, não nos deixe no vácuo." },
        rsvp_find_button: { label: "Botão 'Buscar Convite'", default: "Achar meu convite" },
        rsvp_confirm_button: { label: "Botão 'Confirmar Presença'", default: "Bora Festejar! 🥳" },
        rsvp_decline_button: { label: "Botão 'Recusar'", default: "Vou dar o cano 😔" },
        rsvp_lock_message_title: { label: "Título Conteúdo Bloqueado", default: "🤫 Segredo, hein?" },
        rsvp_lock_message_subtitle: { label: "Subtítulo Conteúdo Bloqueado", default: "Calma lá, ansioso(a)! Primeiro confirma que você vem..." },
    },
    "Informações (Local)": {
        info_title: { label: "Título da Seção", default: "Onde Vai Ser o Rolê" },
        info_subtitle: { label: "Subtítulo da Seção", default: "Anote tudo pra não se perder e, por favor, não atrase a noiva (mais ainda)." },
        info_button: { label: "Botão 'Como Chegar'", default: "Traçar Rota" },
    },
    "Presentes (Loja)": {
        gifts_title: { label: "Título da Seção", default: "Ajude os Pombinhos" },
        gifts_subtitle: { label: "Subtítulo da Seção", default: "Presentes que valem mais que um abraço." },
        gifts_button: { label: "Botão 'Ver Todos'", default: "Ver todos os presentes" },
    },
};

export default function TextsTab({ config, onConfigChange }: TextsTabProps) {
    
    const texts = config.texts || {};

    const handleTextChange = (key: string, value: string) => {
        const newTexts = { ...texts, [key]: value };
        onConfigChange({ texts: newTexts });
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
            </CardContent>
        </Card>
    );
}
