import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Settings } from 'lucide-react';

interface Webhooks {
  [key: string]: string;
}

export default function PopupPage() {
  const [webhooks, setWebhooks] = useState<Webhooks>({});
  const [url, setUrl] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const chrome = (window as any).chrome;

    // Load webhooks
    chrome.storage.local.get(['discordWebhooks'], (result: Record<string, any>) => {
      if (result.discordWebhooks) {
        setWebhooks(result.discordWebhooks);
        const keys = Object.keys(result.discordWebhooks);
        if (keys.length > 0) {
          setSelectedChannel(keys[0]);
        }
      }
    });

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: Record<string, any>) => {
      if (tabs[0] && tabs[0].url) {
        setUrl(tabs[0].url);
      }
    });
  }, []);

  const handleSend = async () => {
    setStatus('');
    setError('');

    if (!selectedChannel) {
      setError('Veuillez sélectionner un canal');
      return;
    }

    if (!url.trim()) {
      setError('URL vide');
      return;
    }

    setLoading(true);

    try {
      const webhookUrl = webhooks[selectedChannel];
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: url,
          username: 'Kord',
        }),
      });

      if (response.ok) {
        setStatus('✅ Lien envoyé avec succès au canal Discord!');
        setUrl('');
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setError('Erreur lors de l\'envoi du lien');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = () => {
    const chrome = (window as any).chrome;
    chrome.runtime.openOptionsPage();
  };

  const webhookCount = Object.keys(webhooks).length;

  return (
    <div className="w-96 bg-gray-950 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">🎵 Kord</h1>
          <p className="text-sm text-gray-400">Partager vers Discord</p>
        </div>

        {/* No Webhooks Alert */}
        {webhookCount === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pas de webhooks</AlertTitle>
            <AlertDescription>
              Veuillez configurer au moins un webhook dans les paramètres.
            </AlertDescription>
          </Alert>
        )}

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        {webhookCount > 0 && (
          <>
            {/* URL Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Lien
              </label>
              <Input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
            </div>

            {/* Channel Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Canal Discord
              </label>
              <Select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                disabled={loading || webhookCount === 0}
              >
                {Object.keys(webhooks).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={loading || !selectedChannel}
              className="w-full"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
          </>
        )}

        {/* Settings Button */}
        <Button
          onClick={handleSettings}
          variant="outline"
          className="w-full flex items-center gap-2 justify-center bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-200"
        >
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </Button>
      </div>
    </div>
  );
}
