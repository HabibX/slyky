import { useEffect, useState } from 'react';
import { MetricCard } from '../ui/MetricCard';
import { fetchStats } from '../../lib/api';
import type { Stats } from '../../lib/api';

const DEFAULT_STATS: Stats = {
  testers: 0,
  feedbackForms: 0,
  reviews: 0,
  publicComments: 0,
  testimonials: 0,
};

const TARGETS: Record<keyof Stats, { target: number; label: string }> = {
  testers: { target: 50, label: 'Stellar Testers' },
  feedbackForms: { target: 30, label: 'Feedback Forms' },
  reviews: { target: 10, label: 'Detailed Reviews' },
  publicComments: { target: 5, label: 'Public Comments' },
  testimonials: { target: 3, label: 'Video Testimonials' },
};

export function MetricsGrid() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  useEffect(() => {
    fetchStats().then(setStats);
    const interval = setInterval(() => fetchStats().then(setStats), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-text-primary">
        Validation Campaign Progress
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.keys(TARGETS) as (keyof Stats)[]).map((key) => (
          <MetricCard
            key={key}
            current={stats[key]}
            target={TARGETS[key].target}
            label={TARGETS[key].label}
          />
        ))}
      </div>
    </section>
  );
}