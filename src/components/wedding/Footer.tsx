
'use client';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface FooterProps {
  names?: string;
}

const Footer: React.FC<FooterProps> = ({ names = 'O Casal' }) => {
  return (
    <footer className="w-full bg-background/80 border-t border-border/80">
      <div className="container mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-headline text-lg text-primary text-center sm:text-left opacity-80">{names}</p>
        <p className="text-sm text-muted-foreground opacity-80 text-center">
          &copy; {new Date().getFullYear()} Feito com ❤️. Todos os direitos reservados.
        </p>
        <Link 
          href="/admin" 
          className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary transition-colors opacity-80"
        >
          <Lock className="h-4 w-4" />
          Painel dos Noivos
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
