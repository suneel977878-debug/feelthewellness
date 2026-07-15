'use server';


import { PaytmConfig, PromoCode } from '../../context/CartContext';

import pool from '../../lib/db';

export async function getStoreConfig() {
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
      ageGateEnabled: Boolean(config.ageGateEnabled),
      storeUpiId: config.storeUpiId,
      paytmConfig: {
        mid: config.paytmMid,
        merchantKey: config.paytmKey,
        website: "DEFAULT",
        channelId: "WEB",
        environment: config.paytmEnv as 'SIMULATED' | 'STAGE' | 'PROD'
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
}

export async function updateAgeGate(enabled: boolean) {
  await pool.query('UPDATE StoreConfig SET ageGateEnabled = ? WHERE id = 1', [enabled ? 1 : 0]);
  return true;
}

export async function updateStoreUpiId(upiId: string) {
  await pool.query('UPDATE StoreConfig SET storeUpiId = ? WHERE id = 1', [upiId]);
  return true;
}

export async function updatePaytmConfig(config: PaytmConfig) {
  await pool.query(
    'UPDATE StoreConfig SET paytmMid = ?, paytmKey = ?, paytmEnv = ? WHERE id = 1',
    [config.mid, config.merchantKey, config.environment]
  );
  return true;
}

// PROMOS
export async function getPromos(): Promise<PromoCode[]> {
  try {
    const [rows] = await pool.query('SELECT * FROM PromoCode ORDER BY createdAt DESC');
    return (rows as any[]).map(p => ({
      ...p,
      isActive: Boolean(p.isActive)
    }));
  } catch(error) {
    console.error("MySQL Error Promos:", error);
    return [];
  }
}

export async function addPromo(code: string, discountPct: number) {
  const [result] = await pool.query(
    'INSERT INTO PromoCode (code, discountPct, isActive, createdAt, updatedAt) VALUES (?, ?, 1, NOW(), NOW())',
    [code.toUpperCase(), discountPct]
  );
  const insertId = (result as any).insertId;
  const [rows] = await pool.query('SELECT * FROM PromoCode WHERE id = ?', [insertId]);
  return (rows as any[])[0];
}

export async function togglePromo(id: string, isActive: boolean) {
  await pool.query('UPDATE PromoCode SET isActive = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return true;
}

export async function deletePromo(id: string) {
  await pool.query('DELETE FROM PromoCode WHERE id = ?', [id]);
  return true;
}
