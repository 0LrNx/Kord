import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Trash2 } from 'lucide-react';

interface Webhooks {
  [key: string]: string;
}

export default function OptionsPage() {
  const [webhooks, setWebhooks] = useState<Webhooks>({});
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const chrome = (window as any).chrome;
    chrome.storage.local.get(['discordWebhooks'], (result: Record<string, any>) => {
      if (result.discordWebhooks) {
        setWebhooks(result.discordWebhooks);
      }
    });
  }, []);

  const saveWebhooks = (updated: Webhooks) => {
    const chrome = (window as any).chrome;
    chrome.storage.local.set({ discordWebhooks: updated }, () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  const handleAdd = () => {
    setError('');
    if (!newName.trim() || !newUrl.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (!newUrl.startsWith('https://discord.com/')) {
      setError("L'URL doit commencer par https://discord.com/");
      return;
    }

    const updated = { ...webhooks, [newName]: newUrl };
    setWebhooks(updated);
    saveWebhooks(updated);
    setNewName('');
    setNewUrl('');
  };

  const handleDelete = (name: string) => {
    const updated = { ...webhooks };
    delete updated[name];
    setWebhooks(updated);
    saveWebhooks(updated);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚙️ Paramètres de Kord</h1>
          <p className="text-gray-400">Gérez vos webhooks Discord</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert variant="success" className="mb-6">
            <Check className="h-4 w-4" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>
              Modifications enregistrées avec succès.
            </AlertDescription>
          </Alert>
        )}

        {/* Webhooks List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Webhooks Discord</CardTitle>
            <CardDescription>
              {Object.keys(webhooks).length === 0
                ? 'Aucun webhook configuré'
                : `${Object.keys(webhooks).length} webhook(s) enregistré(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(webhooks).length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">
                Aucun webhook configuré pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(webhooks).map(([name, url]) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1 overflow-hidden min-w-0">
                      <p className="font-semibold text-white truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{url}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(name)}
                      className="flex items-center gap-2 bg-red-400/10 text-red-400 hover:bg-red-400/20 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ajouter un nouveau Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Nom du bouton
              </label>
              <Input
                placeholder="Ex: Général, Setup..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                URL du Webhook
              </label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <Button
              onClick={handleAdd}
              className="w-full mt-4"
            >
              Ajouter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
