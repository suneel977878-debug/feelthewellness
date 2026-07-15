const fs = require('fs');
const files = [
  'src/app/paytm-mock/page.tsx',
  'src/app/payment-status/page.tsx',
  'src/app/_not-found/page.tsx',
  'src/app/cart/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    if (!code.includes('export const dynamic')) {
       // if it's a client component, we cannot use export const dynamic
       if (code.includes("'use client'") || code.includes('"use client"')) {
           continue;
       }
       code = "export const dynamic = 'force-static';\n" + code;
       fs.writeFileSync(file, code);
       console.log("Patched", file);
    }
  }
}
