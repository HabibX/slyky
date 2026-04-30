import { railRegistry } from './core/railRegistry';
import { MockAdapter } from './adapters/mock/MockAdapter';

async function main() {
  // Enregistrer le mock adapter
  const mockAdapter = new MockAdapter();
  railRegistry.register(mockAdapter);

  // Vérifier qu'il est bien enregistré
  const retrieved = railRegistry.getAdapter('MOCK', 'mocknet');
  console.log('Adapter retrieved:', retrieved?.asset);

  // Test de génération d'adresse
  const address = await retrieved!.generateReceiveAddress('pay_123');
  console.log('Generated address:', address);

  // Test health check
  const health = await railRegistry.healthCheckAll();
  console.log('Health check:', health);

  // Test startListening (simulé)
  console.log('Starting listener (will trigger in 5 seconds)...');
  retrieved!.startListening((tx) => {
    console.log('Received transaction:', tx);
    process.exit(0);
  });
}

main().catch(console.error);