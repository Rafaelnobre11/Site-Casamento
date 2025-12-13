
export type Product = {
  id: string;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  funnyNote: string;
};

export type SiteConfig = {
  theme?: string;
  customColor?: string;
  customColors?: {
    headerBg?: string;
    headerText?: string;
    footerBg?: string;
    footerText?: string;
    buttonBg?: string;
    buttonText?: string;
    headingText?: string;
    heroHeadingText?: string;
    bodyText?: string;
  };
  names?: string;
  logoUrl?: string;
  heroImage?: string;
  date?: string;
  time?: string;
  locationName?: string;
  addressCep?: string;
  addressNumber?: string;
  locationAddress?: string;
  mapUrl?: string;
  wazeLink?: string;
  isContentLocked?: boolean;
  pixKey?: string;
  carouselImages?: string[];
  texts: { [key: string]: string };
  products: Product[];
  layoutOrder: string[];
};
