'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Image from 'next/image';

interface HeaderProps {
  texts?: { [key: string]: string };
  names?: string;
  logoUrl?: string;
}

export default function Header({ texts = {}, names, logoUrl }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '#moments', label: texts.nav_story || 'Nossa Novela' },
    { href: '#info', label: texts.nav_info || 'Onde Vai Ser o Rolê' },
    { href: '#gifts', label: texts.nav_gifts || 'Manda PIX' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavContent = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium transition-colors hover:text-primary"
          onClick={() => setMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 shadow-md backdrop-blur-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={40} height={40} className="h-10 w-auto" />
            ) : (
                <span className="font-headline text-xl font-bold">{names || 'J & L'}</span>
            )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavContent />
        </nav>
        
        <div className="flex items-center gap-2">
          <Button asChild className="hidden rounded-full shadow hover:shadow-lg md:flex">
            <Link href="#rsvp">{texts.nav_rsvp || 'Bora Confirmar!'}</Link>
          </Button>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-0">
                 <div className="flex items-center justify-between p-6 border-b">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo" width={32} height={32} className="h-8 w-auto" />
                        ) : (
                            <span className="font-headline text-lg font-bold">{names || 'J & L'}</span>
                        )}
                    </Link>
                    <SheetClose asChild>
                         <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Fechar</span>
                        </Button>
                    </SheetClose>
                 </div>
                <div className="flex h-full flex-col">
                    <nav className="mt-6 flex flex-col gap-6 px-6">
                        <NavContent />
                    </nav>
                    <div className="mt-auto p-6">
                        <Button asChild className="w-full rounded-full shadow hover:shadow-lg">
                            <Link href="#rsvp" onClick={() => setMobileMenuOpen(false)}>{texts.nav_rsvp || 'Bora Confirmar!'}</Link>
                        </Button>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
