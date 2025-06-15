
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BeerTapAnimationProps {
  alertCount?: number;
  className?: string;
  showEasterEgg?: boolean;
}

function getStoredApiKey(): string | null {
  return localStorage.getItem('openai_api_key');
}
function setStoredApiKey(key: string) {
  localStorage.setItem('openai_api_key', key);
}

export default function BeerTapAnimation({ 
  alertCount = 0, 
  className = "",
  showEasterEgg = false 
}: BeerTapAnimationProps) {
  const [beerTapImage, setBeerTapImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualIntensity, setManualIntensity] = useState(0);
  const [apiKey, setApiKey] = useState<string | null>(getStoredApiKey());
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(!getStoredApiKey());
  const [tempKey, setTempKey] = useState<string>(getStoredApiKey() || '');
  const { toast } = useToast();

  // Calculate intensity based on alerts (0-4 scale)
  const alertIntensity = Math.min(Math.floor(alertCount / 5), 4);
  const currentIntensity = showEasterEgg ? manualIntensity : alertIntensity;

  // Function to fetch image directly from OpenAI API
  const generateBeerTapImage = async () => {
    setIsGenerating(true);
    try {
      if (!apiKey) throw new Error('OpenAI API key not set');

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: "Cartoon-style, funny, vibrant colors: A funny cartoon beer tap handle in a bar, golden beer flowing, cheerful and vibrant, transparent background",
          style: "cartoon",
          n: 1,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png',
          background: 'transparent'
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
      }
      // gpt-image-1 returns base64 image data
      const imageData = data.data[0].b64_json;

      setBeerTapImage(`data:image/png;base64,${imageData}`);
      localStorage.setItem('beerTapImage', `data:image/png;base64,${imageData}`);

      toast({
        title: "Success!",
        description: "Beer tap image generated successfully!",
      });
    } catch (error: any) {
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

  // API Key Modal UI
  const ApiKeyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Enter OpenAI API Key</h2>
        <input
          type="password"
          className="w-full bg-gray-100 border text-gray-900 border-gray-300 px-3 py-2 rounded mb-2"
          placeholder="sk-..."
          autoFocus
          value={tempKey}
          onChange={e => setTempKey(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button
            className="bg-gray-300 text-gray-800"
            onClick={() => setShowApiKeyModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              setApiKey(tempKey.trim());
              setStoredApiKey(tempKey.trim());
              setShowApiKeyModal(false);
            }}
            disabled={!tempKey.trim().startsWith("sk-")}
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Your OpenAI API key is stored locally in your browser and never leaves your computer except to make requests to OpenAI.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* API Key Modal */}
      {showApiKeyModal && <ApiKeyModal />}

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
          disabled={isGenerating || !apiKey}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate Beer Tap'}
        </Button>
      )}

      {/* Regenerate Button (smaller, for existing image) */}
      {beerTapImage && (
        <div className="flex gap-2">
          <Button
            onClick={generateBeerTapImage}
            disabled={isGenerating || !apiKey}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {isGenerating ? 'Generating...' : 'New Image'}
          </Button>
          <Button
            onClick={() => setShowApiKeyModal(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Change API Key
          </Button>
        </div>
      )}

      {!apiKey && (
        <Button 
          className="mt-2 bg-indigo-500 text-white"
          onClick={() => setShowApiKeyModal(true)}
        >
          Set OpenAI API Key
        </Button>
      )}
    </div>
  );
}

