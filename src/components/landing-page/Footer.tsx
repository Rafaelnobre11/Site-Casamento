import Link from "next/link";
import { Lock } from 'lucide-react';

interface FooterProps {
  texts?: { [key: string]: string };
  names?: string;
}

export default function Footer({ texts = {}, names }: FooterProps) {
    return (
        <footer className="w-full bg-gray-900 text-gray-400">
            <div className="container mx-auto max-w-7xl px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="font-headline text-lg opacity-70">{names || 'Jessica & Lucas'}</p>
                <p className="text-sm">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
                <Link href="/admin" className="text-sm flex items-center gap-2 hover:text-white transition-colors opacity-70 hover:opacity-100">
                    <Lock className="h-4 w-4" />
                    Área dos Noivos
                </Link>
            </div>
        </footer>
    );
}
