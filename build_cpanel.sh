#!/bin/bash
rm -rf cpanel_deployment
cp -a .next/standalone cpanel_deployment
cp .env cpanel_deployment/ 2>/dev/null || :
cp .env.local cpanel_deployment/ 2>/dev/null || :
cp -r public cpanel_deployment/public
cp -r .next/static cpanel_deployment/.next/static

rm -f v2.zip
cd cpanel_deployment
zip -qr ../v2.zip .
cd ..
echo "v2.zip created!"
