
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
    { href: '#carousel', label: texts.nav_story || 'Nossa História' },
    { href: '#event-info', label: texts.nav_info || 'O Grande Dia' },
    { href: '#gifts', label: texts.nav_gifts || 'Presentes' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavContent = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => {
        const linkProps = {
          href: link.href,
          className: cn(
            'font-medium transition-transform hover:scale-105',
            isMobile ? 'text-lg py-2' : 'text-sm'
          )
        };

        if (isMobile) {
          return (
            <SheetClose asChild key={link.href}>
              <Link {...linkProps}>{link.label}</Link>
            </SheetClose>
          );
        }
        
        return (
          <Link key={link.href} {...linkProps}>
            {link.label}
          </Link>
        );
      })}
    </>
  );

  const HeaderLogo = ({ isMobile = false }) => (
    <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileMenuOpen(false)}>
        {logoUrl ? (
            <Image src={logoUrl} alt="Logo" width={isMobile ? 32 : 36} height={isMobile ? 32 : 36} className={cn(isMobile ? 'h-8' : 'h-9', 'w-auto')} />
        ) : (
            <span className={cn('font-headline font-bold', isMobile ? 'text-base' : 'text-lg md:text-xl')}>{names || 'J & L'}</span>
        )}
    </Link>
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 max-w-7xl">
        <HeaderLogo />

        <nav className="hidden items-center gap-6 md:flex">
          <NavContent />
        </nav>
        
        <div className="flex items-center gap-2">
          <Button asChild className="hidden rounded-full shadow hover:shadow-lg md:flex">
            <Link href="#rsvp">{texts.nav_rsvp || 'Confirmar Presença'}</Link>
          </Button>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background p-0 flex flex-col">
                 <div className="flex items-center justify-between p-4 border-b">
                    <HeaderLogo isMobile />
                    <SheetClose asChild>
                         <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Fechar</span>
                        </Button>
                    </SheetClose>
                 </div>
                <div className="flex-grow flex flex-col">
                    <nav className="mt-8 flex flex-col gap-6 px-6">
                        <NavContent isMobile />
                    </nav>
                    <div className="mt-auto p-6">
                      <SheetClose asChild>
                        <Button asChild size="lg" className="w-full rounded-full shadow-lg">
                            <Link href="#rsvp">{texts.nav_rsvp || 'Confirmar Presença'}</Link>
                        </Button>
                      </SheetClose>
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
