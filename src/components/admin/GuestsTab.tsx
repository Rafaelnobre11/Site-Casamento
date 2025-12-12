'use client';
import { useState, useTransition, useEffect, useRef } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { addDocument, deleteDocument } from '@/firebase/firestore/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UserCheck, UserX, Users, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { maskPhone } from '@/lib/masks';

type Guest = {
    id: string;
    name: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'declined';
    maxGuests: number;
    confirmedGuests: number;
    message?: string;
};

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

const StatusBadge = ({ status }: { status: Guest['status'] }) => {
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
    const { data: guests, loading } = useCollection<Guest>('guests');
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof newGuestSchema>>({
        resolver: zodResolver(newGuestSchema),
        defaultValues: { name: '', phone: '', maxGuests: 1 },
    });
    
    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-lg border bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalInvited = guests?.reduce((acc, guest) => acc + guest.maxGuests, 0) || 0;
    const totalConfirmedGuests = guests?.filter(g => g.status === 'confirmed').length || 0;
    const totalConfirmedAttendees = guests?.filter(g => g.status === 'confirmed').reduce((acc, guest) => acc + guest.confirmedGuests, 0) || 0;
    const totalDeclined = guests?.filter(g => g.status === 'declined').length || 0;
    const confirmationRate = totalInvited > 0 ? (totalConfirmedAttendees / totalInvited) * 100 : 0;

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

    const handleDeleteGuest = (guest: Guest) => {
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

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Confirmados" 
                    value={totalConfirmedAttendees} 
                    icon={UserCheck}
                    description={`${totalConfirmedGuests} convites aceitos`}
                />
                <StatCard 
                    title="Recusados" 
                    value={totalDeclined} 
                    icon={UserX}
                    description="Convites que não poderão comparecer"
                />
                 <StatCard 
                    title="Total de Convidados" 
                    value={totalInvited} 
                    icon={Users}
                    description="Total de pessoas na lista"
                />
                <StatCard 
                    title="Taxa de Confirmação" 
                    value={`${confirmationRate.toFixed(0)}%`} 
                    icon={Progress}
                    description="Baseado no total de convidados"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Adicionar Convidado</CardTitle>
                    <CardDescription>O Porteiro: adicione aqui as pessoas para a sua lista VIP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddGuest)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl><Input placeholder="Nome do Convidado" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="(99) 99999-9999"
                                            {...field}
                                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                            maxLength={15}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField control={form.control} name="maxGuests" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Convite para</FormLabel>
                                    <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={isPending} className="w-full md:w-auto md:self-end">
                                {isPending ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                                Adicionar
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>A Lista</CardTitle>
                    <CardDescription>
                        Acompanhe em tempo real quem já confirmou presença.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Convidados</TableHead>
                                <TableHead>Mensagem</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests && guests.length > 0 ? (
                                guests.map((guest) => (
                                    <TableRow key={guest.id}>
                                        <TableCell className="font-medium">{guest.name}</TableCell>
                                        <TableCell className="text-center">
                                            <StatusBadge status={guest.status} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {guest.status === 'confirmed' ? `${guest.confirmedGuests}/${guest.maxGuests}` : `- / ${guest.maxGuests}`}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground italic max-w-xs truncate">
                                            {guest.message || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteGuest(guest)} disabled={isPending}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Nenhum convidado na lista ainda. Comece a adicionar acima!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
