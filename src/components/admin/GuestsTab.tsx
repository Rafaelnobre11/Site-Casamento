'use client';
import { useState, useTransition } from 'react';
import { useFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addDocument, deleteDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Users, UserCheck, UserX, BarChart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/lib/masks';

const newGuestSchema = z.object({
  name: z.string().min(3, "Nome precisa ter no mínimo 3 caracteres."),
  phone: z.string().refine(value => /\(\d{2}\)\s\d{5}-\d{4}/.test(value), {
    message: "Telefone inválido. Formato esperado: (99) 99999-9999.",
  }),
  maxGuests: z.coerce.number().min(1, "O convite vale para pelo menos 1 pessoa."),
});

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const StatusBadge = ({ status }: { status: 'pending' | 'confirmed' | 'declined' }) => {
    switch (status) {
        case 'confirmed':
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Confirmado</Badge>;
        case 'declined':
            return <Badge variant="destructive">Recusado</Badge>;
        default:
            return <Badge variant="secondary">Pendente</Badge>;
    }
};

type Guest = {
    id: string;
    name: string;
    phone: string;
    maxGuests: number;
    status: 'pending' | 'confirmed' | 'declined';
    confirmedGuests: number;
    message: string;
};

export default function GuestsTab() {
    const { data: guests, loading } = useCollection<Guest>('guests');
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof newGuestSchema>>({
        resolver: zodResolver(newGuestSchema),
        defaultValues: { name: '', phone: '', maxGuests: 1 },
    });
    
    if (loading) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-lg border bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalInvited = guests?.reduce((acc, guest) => acc + guest.maxGuests, 0) || 0;
    const totalConfirmedGuests = guests?.filter((g) => g.status === 'confirmed').length || 0;
    const totalConfirmedAttendees = guests?.filter((g) => g.status === 'confirmed').reduce((acc, guest) => acc + guest.confirmedGuests, 0) || 0;
    const totalDeclined = guests?.filter((g) => g.status === 'declined').length || 0;

    const handleAddGuest = (values: z.infer<typeof newGuestSchema>) => {
        startTransition(async () => {
            if (!firestore) return;
            try {
                await addDocument(firestore, 'guests', {
                    ...values,
                    phone: values.phone.replace(/\D/g, ''),
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

    const handleDeleteGuest = (guestId: string, guestName: string) => {
        if (!firestore) return;
        if (confirm(`Tem certeza que quer remover ${guestName} da lista?`)) {
            startTransition(async () => {
                 try {
                    await deleteDocument(firestore, `guests/${guestId}`);
                    toast({ title: "Removido!", description: `${guestName} não está mais na lista.` });
                 } catch (e: any) {
                    toast({ variant: 'destructive', title: "Erro ao remover", description: 'Não foi possível remover o convidado. Tente novamente.' });
                 }
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>O Gerente de Festa (Convidados)</CardTitle>
                <CardDescription>Adicione, remova e acompanhe quem vem para a festa. Os números são atualizados em tempo real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total de Convites" value={guests?.length || 0} icon={Users} />
                    <StatCard title="Convidados Confirmados" value={totalConfirmedGuests} icon={UserCheck} />
                    <StatCard title="Convidados Recusados" value={totalDeclined} icon={UserX} />
                    <StatCard title="Total de Pessoas (Confirmado)" value={totalConfirmedAttendees} icon={BarChart} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium mb-4">Adicionar Novo Convidado</h3>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddGuest)} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} placeholder="Nome do convidado" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} placeholder="(99) 99999-9999" onChange={(e) => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="maxGuests" render={({ field }) => (
                                    <FormItem><FormLabel>Nº de Pessoas no Convite</FormLabel><FormControl><Input type="number" {...field} min={1} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Adicionar à Lista
                                </Button>
                            </form>
                        </Form>
                    </div>
                     <div className="md:col-span-2">
                        <h3 className="text-lg font-medium mb-4">Lista de Convidados</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Convidados</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guests && guests.length > 0 ? guests.map((guest) => (
                                        <TableRow key={guest.id}>
                                            <TableCell className="font-medium">{guest.name}</TableCell>
                                            <TableCell><StatusBadge status={guest.status} /></TableCell>
                                            <TableCell className="text-center">{guest.status === 'confirmed' ? `${guest.confirmedGuests}/${guest.maxGuests}` : `-/${guest.maxGuests}`}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteGuest(guest.id, guest.name)} disabled={isPending}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum convidado na lista ainda.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    