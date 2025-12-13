'use client';
import { useState, useTransition } from 'react';
import { useFirebase } from '@/firebase';
import { useDocument } from '@/firebase/firestore/use-doc';
import { setDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const newGuestSchema = z.object({
  name: z.string().min(3, "Nome precisa ter no mínimo 3 caracteres."),
  phone: z.string().refine(value => /\(\d{2}\)\s\d{5}-\d{4}/.test(value), {
    message: "Telefone inválido. Formato esperado: (99) 99999-9999.",
  }),
  maxGuests: z.coerce.number().min(1, "O convite vale para pelo menos 1 pessoa."),
});

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);


// ... (StatusBadge remains the same)
const StatusBadge = ({ status }: { status: 'pending' | 'confirmed' | 'declined' }) => {
    switch (status) {
        case 'confirmed':
            return <Badge variant="default" className="bg-green-600">Confirmado</Badge>;
        case 'declined':
            return <Badge variant="destructive">Recusado</Badge>;
        default:
            return <Badge variant="secondary">Pendente</Badge>;
    }
};


export default function GuestsTab() {
    const { data: guests, loading } = useCollection<any>('guests');
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof newGuestSchema>>({
        resolver: zodResolver(newGuestSchema),
        defaultValues: { name: '', phone: '', maxGuests: 1 },
    });
    
    // ... (loading state remains the same)
    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-lg border bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    
    const totalInvited = guests?.reduce((acc: any, guest: any) => acc + guest.maxGuests, 0) || 0;
    const totalConfirmedGuests = guests?.filter((g: any) => g.status === 'confirmed').length || 0;
    const totalConfirmedAttendees = guests?.filter((g: any) => g.status === 'confirmed').reduce((acc: any, guest: any) => acc + guest.confirmedGuests, 0) || 0;
    const totalDeclined = guests?.filter((g: any) => g.status === 'declined').length || 0;
    const confirmationRate = totalInvited > 0 ? (totalConfirmedAttendees / totalInvited) * 100 : 0;

    // ... (handleAddGuest and handleDeleteGuest remain the same)
    const handleAddGuest = (values: z.infer<typeof newGuestSchema>) => {
        startTransition(async () => {
            if (!firestore) return;
            try {
                await addDocument(firestore, 'guests', {
                    ...values,
                    phone: values.phone.replace(/\D/g, ''), // Store only numbers
                    status: 'pending',
                    confirmedGuests: 0,
                    message: '',
                });
                toast({ title: "Sucesso!", description: `${values.name} foi adicionado(a) à lista.` });
                form.reset();
            } catch (e: any) {
                 toast({ variant: 'destructive', title: "Erro ao salvar", description: 'Não foi possível adicionar o convidado. Tente novamente.' });
            }
        });
    };

    const handleDeleteGuest = (guest: any) => {
        if (!firestore) return;
        if (confirm(`Tem certeza que quer remover ${guest.name} da lista?`)) {
            startTransition(async () => {
                 try {
                    await deleteDocument(firestore, `guests/${guest.id}`);
                    toast({ title: "Removido!", description: `${guest.name} não está mais na lista.` });
                 } catch (e: any) {
                    toast({ variant: 'destructive', title: "Erro ao remover", description: 'Não foi possível remover o convidado. Tente novamente.' });
                 }
            });
        }
    };


    return (<h1>Olá</h1>);
}
