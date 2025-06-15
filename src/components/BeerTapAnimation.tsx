
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BeerTapAnimationProps {
  alertCount?: number;
  className?: string;
  showEasterEgg?: boolean;
}

export default function BeerTapAnimation({ 
  alertCount = 0, 
  className = "",
  showEasterEgg = false 
}: BeerTapAnimationProps) {
  const [beerTapImage, setBeerTapImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualIntensity, setManualIntensity] = useState(0);
  const { toast } = useToast();

  // Calculate intensity based on alerts (0-4 scale)
  const alertIntensity = Math.min(Math.floor(alertCount / 5), 4);
  const currentIntensity = showEasterEgg ? manualIntensity : alertIntensity;

  const generateBeerTapImage = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/generate-beer-tap-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: "A funny cartoon beer tap handle in a bar, golden beer flowing, cheerful and vibrant, transparent background",
            style: "cartoon"
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const result = await response.json();
      setBeerTapImage(result.image);
      
      // Store in localStorage for persistence
      localStorage.setItem('beerTapImage', result.image);
      
      toast({
        title: "Success!",
        description: "Beer tap image generated successfully!",
      });
    } catch (error) {
      console.error('Error generating beer tap:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate beer tap image',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Load cached image on mount
  useEffect(() => {
    const cached = localStorage.getItem('beerTapImage');
    if (cached) {
      setBeerTapImage(cached);
    }
  }, []);

  const getAnimationClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "";
      case 1:
        return "animate-pulse";
      case 2:
        return "animate-bounce";
      case 3:
        return "animate-[shake_0.5s_ease-in-out_infinite]";
      case 4:
      default:
        return "animate-[violentShake_0.2s_ease-in-out_infinite]";
    }
  };

  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 0: return "Calm";
      case 1: return "Light Activity";
      case 2: return "Moderate Alerts";
      case 3: return "High Activity";
      case 4: return "BRRRRR MODE!";
      default: return "Unknown";
    }
  };

  const handleEasterEggClick = () => {
    if (showEasterEgg) {
      setManualIntensity((prev) => (prev + 1) % 5);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Beer Tap Container */}
      <div 
        className={`relative cursor-pointer transition-all duration-200 ${getAnimationClass(currentIntensity)}`}
        onClick={handleEasterEggClick}
        title={showEasterEgg ? `Click to cycle intensity (${getIntensityLabel(currentIntensity)})` : getIntensityLabel(currentIntensity)}
      >
        {beerTapImage ? (
          <img 
            src={beerTapImage} 
            alt="Beer Tap" 
            className="w-32 h-32 object-contain drop-shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-4xl">🍺</span>
          </div>
        )}
        
        {/* Intensity Indicator */}
        {currentIntensity > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            {currentIntensity === 4 ? "BRRR!" : `${currentIntensity}`}
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">
          {getIntensityLabel(currentIntensity)}
        </p>
        {alertCount > 0 && !showEasterEgg && (
          <p className="text-xs text-gray-400">
            {alertCount} alert{alertCount !== 1 ? 's' : ''} detected
          </p>
        )}
      </div>

      {/* Generate Button */}
      {!beerTapImage && (
        <Button
          onClick={generateBeerTapImage}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate Beer Tap'}
        </Button>
      )}

      {/* Regenerate Button (smaller, for existing image) */}
      {beerTapImage && (
        <Button
          onClick={generateBeerTapImage}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {isGenerating ? 'Generating...' : 'New Image'}
        </Button>
      )}
    </div>
  );
}
