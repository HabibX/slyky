// core/interfaces/IRailAdapter.ts

export interface FeeEstimate {
  amount: string;       // frais estimés ex: "0.00001 XLM"
  currency: string;     // asset utilisé pour les frais ex: "XLM"
  description: string;  // "network fee", "processing fee"
}

export interface ReceiveAddress {
  address: string;      // adresse publique du compte ou contrat
  memo?: string;        // identifiant unique pour appariement
}

export interface NormalizedTransaction {
  txHash: string;
  asset: string;
  amount: string;
  from: string;
  to: string;
  memo?: string;
  confirmations: number;
  isFinal: boolean;
  rawData?: any;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  isFinal: boolean;
}

export interface IRailAdapter {
  // Identifiants
  readonly asset: string;               // "XLM", "USDC"
  readonly network: string;             // "stellar", "tron"
  readonly requiredConfirmations: number;

  // Génération d'une adresse de réception unique pour un paiement
  generateReceiveAddress(paymentId: string): Promise<ReceiveAddress>;

  // Écoute des transactions entrantes (streaming)
  startListening(callback: (tx: NormalizedTransaction) => void): void;

  // Vérification du statut d'une transaction spécifique
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;

  // Estimation des frais pour un montant donné
  estimateFee(amount: string, from?: string): Promise<FeeEstimate>;

  // Estimation du délai de règlement (en secondes)
  estimateSettlementTime(): Promise<number>;

  // Vérification de l'état de santé du rail (connectivité, latence)
  healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }>;

  // Future: pour les smart contracts (Phase 3)
  invokeContract?(contractId: string, method: string, params: any[]): Promise<any>;
}