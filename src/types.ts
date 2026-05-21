/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BudgetData {
  name: string;
  email: string;
  monthlyIncome: number;
  rent: number;
  bills: number;
  foodLifestyle: number;
  debtPayments: number;
  subscriptions: number;
  otherSpending: number;
}

export interface CPAOffer {
  id: string;
  name: string;
  anchor: string;
  conversion: string;
  epc: string;
  category_id: string;
  url_domain: string;
  user_payout: string;
  payout: string;
  network_icon: string;
  url: string;
}

export interface AnalysisResult {
  remainingCapital: number;
  totalSpending: number;
  safetyScore: number;
  expenseRate: number;
  riskLevel: 'Secure' | 'Moderate' | 'High Risk' | 'Critical';
  housingRatio: number;
  debtPressure: number;
}
