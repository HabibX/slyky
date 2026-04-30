// core/railRegistry.ts

import { IRailAdapter } from './interfaces/IRailAdapter';

export class RailRegistry {
  private adapters: Map<string, IRailAdapter> = new Map();

  /**
   * Enregistre un nouvel adaptateur.
   * La clé est composée comme "asset:network", ex: "XLM:stellar".
   */
  register(adapter: IRailAdapter): void {
    const key = `${adapter.asset}:${adapter.network}`;
    if (this.adapters.has(key)) {
      console.warn(`Adapter ${key} replaced`);
    }
    this.adapters.set(key, adapter);
    console.log(`Rail registered: ${key}`);
  }

  /**
   * Récupère un adaptateur par asset et réseau.
   */
  getAdapter(asset: string, network: string): IRailAdapter | undefined {
    return this.adapters.get(`${asset}:${network}`);
  }

  /**
   * Retourne tous les adaptateurs enregistrés.
   */
  getAllAdapters(): IRailAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Vérifie l'état de santé de tous les rails.
   * Utile pour le monitoring et le dashboard.
   */
  async healthCheckAll(): Promise<Map<string, { healthy: boolean; latency: number; error?: string }>> {
    const results = new Map<string, { healthy: boolean; latency: number; error?: string }>();
    for (const [key, adapter] of this.adapters) {
      results.set(key, await adapter.healthCheck());
    }
    return results;
  }
}

// Export a singleton instance
export const railRegistry = new RailRegistry();