
export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  description: string;
  silhouetteType: string;
  color: string;
  features: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isHero?: boolean;
  isOnSale?: boolean;
  discountPercent?: number;
  rating: number;
  reviews: number;
  images: string[];
  defaultZoom?: number;
  defaultZoomX?: number;
  defaultZoomY?: number;
  imageCrops?: {zoom: number, x: number, y: number}[];
};

export const categoryTree = [
  { id: 'women', name: 'Women Sex Toys', subcategories: ['Vibrators & Wands', 'Dildos', 'Anal Toys', 'Lingerie', 'All Toys'] },
  { id: 'men', name: 'Men Sex Toys', subcategories: ['Sex Dolls', 'Male Masturbators', 'Cock Rings', 'Anal Toys', 'All Toys'] },
  { id: 'sexdolls', name: 'Sex Dolls', subcategories: ['Sex Dolls', 'All Dolls'] },
  { id: 'couples', name: 'Couples Toys', subcategories: ['Vibrators & Wands', 'Bondage & BDSM', 'All Toys'] },
  { id: 'bdsm', name: 'BDSM & Bondage', subcategories: ['Bondage & BDSM', 'Lingerie', 'All Toys'] },
  { id: 'lingerie', name: 'Lingerie & Clothing', subcategories: ['Lingerie', 'All Toys'] },
  { id: 'supplements', name: 'Supplements & Condoms', subcategories: ['Condoms', 'Lubricants', 'Supplements', 'All Toys'] }
];

import productsData from './products.json';

export const products: Product[] = productsData as Product[];
