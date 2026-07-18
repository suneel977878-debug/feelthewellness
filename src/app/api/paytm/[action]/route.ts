import { NextResponse } from 'next/server';
import { PaytmChecksum } from '../../../../utils/paytmChecksum';
import { getStoreConfig } from '../../../actions/config';

export async function POST(request: Request, context: any) {
  const { action } = await context.params;
  
  if (action === 'callback') {
    return handleCallback(request);
  } else if (action === 'initiate') {
    return handleInitiate(request);
  }
  return NextResponse.json({ message: 'Not found' }, { status: 404 });
}

export async function GET(request: Request, context: any) {
  const { action } = await context.params;
  
  if (action === 'callback') {
    return handleCallback(request);
  }
  return NextResponse.json({ message: 'Not found' }, { status: 404 });
}

async function handleCallback(request: Request) {
  try {
    let paytmParams: Record<string, string> = {};

    if (request.method === 'GET') {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        paytmParams[key] = value;
      });
    } else {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        formData.forEach((value, key) => {
          paytmParams[key] = value.toString();
        });
      } else {
        paytmParams = await request.json().catch(() => ({}));
      }
    }

    const orderId = paytmParams.ORDERID || paytmParams.orderId || '';
    const txnAmount = paytmParams.TXNAMOUNT || paytmParams.txnAmount || '0';
    const txnId = paytmParams.TXNID || paytmParams.txnId || 'N/A';
    const status = paytmParams.STATUS || paytmParams.status || '';
    const respMsg = paytmParams.RESPMSG || paytmParams.respMsg || 'Transaction cancelled or failed.';

    const storeConfig = await getStoreConfig();
    const configuredKey = storeConfig?.paytmConfig?.merchantKey || process.env.PAYTM_MERCHANT_KEY || '';
    const isMockCallback = paytmParams.isMock === 'true' || !configuredKey;

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    const redirectBase = `${protocol}://${host}/payment-status`;

    if (isMockCallback) {
      if (status === 'TXN_SUCCESS' || status === 'SUCCESS') {
        return NextResponse.redirect(`${redirectBase}?status=SUCCESS&orderId=${orderId}&txnId=${txnId}&amount=${txnAmount}`, { status: 303 });
      } else {
        return NextResponse.redirect(`${redirectBase}?status=FAILED&orderId=${orderId}&respMsg=${encodeURIComponent(respMsg)}`, { status: 303 });
      }
    }

    const merchantKey = configuredKey;
    const checksumHash = paytmParams.CHECKSUMHASH || '';
    const paramsToVerify = { ...paytmParams };
    delete paramsToVerify.CHECKSUMHASH;

    const isSignatureValid = PaytmChecksum.verifySignature(paramsToVerify, merchantKey, checksumHash);
    if (!isSignatureValid) {
      return NextResponse.redirect(`${redirectBase}?status=FAILED&orderId=${orderId}&respMsg=Signature+Verification+Failed`, { status: 303 });
    }

    if (status === 'TXN_SUCCESS') {
      return NextResponse.redirect(`${redirectBase}?status=SUCCESS&orderId=${orderId}&txnId=${txnId}&amount=${txnAmount}`, { status: 303 });
    } else {
      return NextResponse.redirect(`${redirectBase}?status=FAILED&orderId=${orderId}&respMsg=${encodeURIComponent(respMsg)}`, { status: 303 });
    }
  } catch (err: any) {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/payment-status?status=FAILED&respMsg=Server+Callback+Error`, { status: 303 });
  }
}

async function handleInitiate(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { amount, customer, items, paytmConfig } = body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }
    if (!customer || !customer.phone) {
      return NextResponse.json({ message: 'Invalid customer contact information' }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderId = `LP-ORD-${timestamp}-${random}`;

    const storeConfig = await getStoreConfig();
    const mid = paytmConfig?.mid || storeConfig?.paytmConfig?.mid || process.env.PAYTM_MID;
    const merchantKey = paytmConfig?.merchantKey || storeConfig?.paytmConfig?.merchantKey || process.env.PAYTM_MERCHANT_KEY;
    const website = paytmConfig?.website || storeConfig?.paytmConfig?.website || process.env.PAYTM_WEBSITE || 'DEFAULT';
    const environment = paytmConfig?.environment || storeConfig?.paytmConfig?.environment || process.env.PAYTM_ENVIRONMENT || 'SIMULATED';

    const isMock = environment === 'SIMULATED' || !mid || !merchantKey;
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/paytm/callback`;

    if (isMock) {
      return NextResponse.json({ isMock: true, orderId, amount, callbackUrl, message: 'Running in simulated transaction mode.' });
    }

    const paytmParams: any = {
      body: {
        requestType: 'Payment', mid, websiteName: website, orderId, callbackUrl,
        txnAmount: { value: amount.toFixed(2), currency: 'INR' },
        userInfo: { custId: `CUST_${customer.phone || 'GUEST'}`, mobile: customer.phone, email: 'customer@feelthewellness.com' },
      },
    };

    const signature = PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), merchantKey);
    paytmParams.head = { signature };

    const paytmHost = environment === 'PROD' ? 'securegw.paytm.in' : 'securegw-stage.paytm.in';
    const paytmUrl = `https://${paytmHost}/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`;

    const apiResponse = await fetch(paytmUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paytmParams) });
    const responseData = await apiResponse.json();

    if (responseData.body && responseData.body.resultInfo.resultStatus === 'S') {
      return NextResponse.json({ isMock: false, txnToken: responseData.body.txnToken, orderId, mid, amount, callbackUrl });
    } else {
      return NextResponse.json({ message: 'Transaction token generation failed.', details: responseData }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}
