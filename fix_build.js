const fs = require('fs');

// Fix cart page
let cartPage = fs.readFileSync('src/app/cart/page.tsx', 'utf8');
cartPage = cartPage.replace(/export const runtime = 'edge';\n/, '');
fs.writeFileSync('src/app/cart/page.tsx', cartPage);

// Fix layouts
const layoutCode = `export const dynamic = 'force-static';
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }`;

fs.writeFileSync('src/app/cart/layout.tsx', layoutCode);
fs.writeFileSync('src/app/payment-status/layout.tsx', layoutCode);
fs.writeFileSync('src/app/paytm-mock/layout.tsx', layoutCode);

// Fix support page
let supportPage = fs.readFileSync('src/app/support/[slug]/page.tsx', 'utf8');
// if it has 'use client', generateStaticParams is not allowed in the same file.
// Wait, generateStaticParams CANNOT be in a Client Component.
// The easiest fix is to just remove generateStaticParams and let it be dynamic, 
// since we now have cart, payment-status, and paytm-mock as static!
// Wait, if support/[slug] is dynamic, that's 1 function.
// Let's remove generateStaticParams from it.
const toRemove = `export function generateStaticParams() {
  return [
    { slug: 'delivery' },
    { slug: 'returns' },
    { slug: 'product-care' },
    { slug: 'faq' },
    { slug: 'contact' },
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'disclaimer' }
  ];
}`;

supportPage = supportPage.replace(toRemove, '');
fs.writeFileSync('src/app/support/[slug]/page.tsx', supportPage);
