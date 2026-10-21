import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QRCodeDisplay({ address, memo }: { address: string; memo: string }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const uri = `web+stellar:pay?destination=${encodeURIComponent(address)}&memo=${encodeURIComponent(memo)}&network=testnet`;
    QRCode.toString(uri, { type: 'svg', width: 256, margin: 1 }, (err, s) => {
      if (!err) setSvg(s);
    });
  }, [address, memo]);

  if (!svg) return <div className="w-64 h-64 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div
      className="mx-auto w-64 h-64 flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}