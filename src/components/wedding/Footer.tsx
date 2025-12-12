
'use client';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface FooterProps {
  names?: string;
}

const Footer: React.FC<FooterProps> = ({ names = 'O Casal' }) => {
  return (
    <footer className="w-full bg-[#FBF9F6] border-t border-[#EAE2DA]">
      <div className="container mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
        <p className="font-headline text-lg text-[#C5A086]">{names}</p>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Feito com ❤️. Todos os direitos reservados.
        </p>
        <Link 
          href="/admin" 
          className="text-sm text-gray-500 flex items-center gap-2 hover:text-[#C5A086] transition-colors"
        >
          <Lock className="h-4 w-4" />
          Painel dos Noivos
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
