import * as React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SaveButton } from '../ui/SaveButton';
import { useTranslation } from 'react-i18next';

interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
}

export const PincodeInput = ({ value, onChange, onSubmit, loading, error }: PincodeInputProps) => {
  const { t } = useTranslation();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto relative flex flex-col gap-3">
      <div className="w-full relative overflow-hidden rounded-2xl bg-glass-1 border border-glass-border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] backdrop-blur-md focus-within:border-green-core/50 focus-within:ring-4 focus-within:ring-green-core/10 transition-all">
        <input
          type="text"
          maxLength={6}
          placeholder="560001"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="h-[64px] w-full text-center bg-transparent px-6 text-2xl font-mono font-bold tracking-[0.2em] text-text-primary outline-none placeholder:text-text-muted/50"
        />
      </div>
      <SaveButton
        onSave={onSubmit}
        disabled={loading || value.length !== 6}
        text={{ idle: 'Find Representative', saving: 'Searching...', saved: 'Done!' }}
        className="w-full"
      />
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center text-[10px] font-bold text-status-bad uppercase tracking-widest mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

interface LocationButtonProps {
  onDetect: (pincode: string) => void;
}

import { Geolocation } from '@capacitor/geolocation';

export const LocationButton = ({ onDetect }: LocationButtonProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleDetect = async () => {
    setLoading(true);
    try {
      // Ensure we have permissions
      await Geolocation.requestPermissions();
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const { latitude, longitude } = position.coords;
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=postcode&access_token=${token}`);
      const data = await res.json();
      
      if (data.features && data.features.length > 0) {
        const pincode = data.features[0].text;
        onDetect(pincode);
      } else {
        alert('Could not determine pincode for your location');
      }
    } catch (err) {
      console.error(err);
      alert('Error detecting location or permission denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDetect}
      disabled={loading}
      className="detect-location-btn group"
    >
      <MapPin size={14} className={cn("icon", loading && "animate-spin")} />
      <span>{loading ? 'Detecting...' : 'Use my current location'}</span>
    </button>
  );
};
