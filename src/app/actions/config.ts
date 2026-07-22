'use server';

import { PaytmConfig } from '../../context/CartContext';
import pool from '../../lib/db';
import { unstable_cache, revalidateTag } from 'next/cache';
import { verifyAdminAuth } from './auth';

export const getStoreConfig = unstable_cache(
  async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM StoreConfig WHERE id = 1');
      const configArr = rows as any[];
      
      let config;
      if (configArr.length === 0) {
        await pool.query('INSERT INTO StoreConfig (id, ageGateEnabled, storeUpiId, paytmMid, paytmKey, paytmEnv) VALUES (1, 1, "luxurydiscreet@ybl", "", "", "SIMULATED")');
        config = { ageGateEnabled: 1, storeUpiId: "luxurydiscreet@ybl", paytmMid: "", paytmKey: "", paytmEnv: "SIMULATED" };
      } else {
        config = configArr[0];
      }
      
      return {
        ageGateEnabled: Boolean(config?.ageGateEnabled),
        storeUpiId: config?.storeUpiId || "luxurydiscreet@ybl",
        paytmConfig: {
          mid: config?.paytmMid || "",
          merchantKey: config?.paytmKey || "",
          website: "DEFAULT",
          channelId: "WEB",
          environment: (config?.paytmEnv || "SIMULATED") as 'SIMULATED' | 'STAGE' | 'PROD'
        }
      };
    } catch(error) {
      console.error("MySQL Error StoreConfig:", error);
      return {
        ageGateEnabled: true,
        storeUpiId: "luxurydiscreet@ybl",
        paytmConfig: {
          mid: "", merchantKey: "", website: "DEFAULT", channelId: "WEB", environment: "SIMULATED" as 'SIMULATED' | 'STAGE' | 'PROD'
        }
      }
    }
  },
  ['store_config'],
  { tags: ['config'], revalidate: 60 }
);

export async function updateAgeGate(enabled: boolean) {
  await verifyAdminAuth();
  await pool.query('UPDATE StoreConfig SET ageGateEnabled = ? WHERE id = 1', [enabled ? 1 : 0]);
  revalidateTag('config', 'max');
  return true;
}

export async function updateStoreUpiId(upiId: string) {
  await verifyAdminAuth();
  const cleanUpi = (upiId || "").trim();
  if (!cleanUpi) throw new Error("UPI ID cannot be empty");
  await pool.query('UPDATE StoreConfig SET storeUpiId = ? WHERE id = 1', [cleanUpi]);
  revalidateTag('config', 'max');
  return true;
}

export async function updatePaytmConfig(config: PaytmConfig) {
  await verifyAdminAuth();
  await pool.query(
    'UPDATE StoreConfig SET paytmMid = ?, paytmKey = ?, paytmEnv = ? WHERE id = 1',
    [(config?.mid || "").trim(), (config?.merchantKey || "").trim(), config?.environment || "SIMULATED"]
  );
  revalidateTag('config', 'max');
  return true;
}


