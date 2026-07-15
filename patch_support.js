const fs = require('fs');
const file = 'src/app/support/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const staticParams = `
export function generateStaticParams() {
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
}

`;

if (!code.includes('generateStaticParams')) {
  // insert after imports
  code = code.replace(/import.*?['"];\n\n/s, match => match + staticParams);
  fs.writeFileSync(file, code);
  console.log("Patched support");
}
