import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Verify connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface LeadSubmission {
  timestamp: string;
  email: string;
  monthlyIncome: string;
  rent: string;
  bills: string;
  foodLifestyle: string;
  debtPayments: string;
  subscriptions: string;
  otherSpending: string;
  netSurplus: string;
}

export async function addLead(lead: LeadSubmission): Promise<boolean> {
  const path = 'leads';
  // Generate positive ID structure safely matching standard alphanumeric validation rules
  const randPart1 = Math.random().toString(36).substring(2, 10);
  const randPart2 = Math.random().toString(36).substring(2, 10);
  const leadId = `lead_${randPart1}${randPart2}`;
  
  try {
    await setDoc(doc(db, path, leadId), lead);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${leadId}`);
  }
}
