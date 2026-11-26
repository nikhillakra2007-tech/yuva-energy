import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { getOfflineState, subscribeOfflineMode } from '../services/demoMode';

// Persistent bilingual label shown whenever the API layer is serving bundled
// sample data because the backend could not be reached. Keeps the demo
// honest: visitors can always tell they are not looking at live records.
export default function OfflineBanner() {
  const [state, setState] = useState(getOfflineState());

  useEffect(() => subscribeOfflineMode(setState), []);

  if (!state.offline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/95 text-amber-950 text-xs font-bold shadow-2xl border border-amber-300"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>
        डेमो मोड: सर्वर ऑफ़लाइन है, नमूना डेटा दिख रहा है · Demo mode: server offline, showing sample data
      </span>
    </div>
  );
}
