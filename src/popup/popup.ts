declare const chrome: any;

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url') as HTMLInputElement;
    const channelSelect = document.getElementById('channel') as HTMLSelectElement;
    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    const statusDiv = document.getElementById('status') as HTMLDivElement;
    const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
    const noWebhooksMsg = document.getElementById('noWebhooksMsg') as HTMLParagraphElement;

    let webhooks: Record<string, string> = {};

    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    chrome.storage.local.get(['discordWebhooks'], (result: Record<string, any>) => {
        if (result.discordWebhooks) {
            webhooks = result.discordWebhooks;
            const keys = Object.keys(webhooks);
            
            if (keys.length === 0) {
                noWebhooksMsg.classList.remove('hidden');
            } else {
                keys.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    channelSelect.appendChild(option);
                });
                const firstKey = keys[0];
                if (firstKey) {
                    channelSelect.value = firstKey;
                }
            }
        } else {
            noWebhooksMsg.classList.remove('hidden');
        }
    });

    chrome.tabs.query({active: true, currentWindow: true}, (tabs: Record<string, any>) => {
        if (tabs[0] && tabs[0].url) {
            urlInput.value = tabs[0].url;
        }
    });

    sendBtn.addEventListener('click', async () => {
        const urlToSend = urlInput.value.trim();
        const selectedChannelName = channelSelect.value;
        
        statusDiv.textContent = "";
        statusDiv.className = "text-center text-sm font-medium min-h-[1.5rem] mt-2";

        if (!urlToSend) {
            statusDiv.textContent = "Veuillez coller une URL.";
            statusDiv.classList.add("text-red-400");
            return;
        }
        if (!selectedChannelName) {
            statusDiv.textContent = "Veuillez choisir un salon.";
            statusDiv.classList.add("text-red-400");
            return;
        }

        const webhookUrl = webhooks[selectedChannelName];

        if (!webhookUrl) {
            statusDiv.textContent = "Configuration Webhook introuvable.";
            statusDiv.classList.add("text-red-400");
            return;
        }

        const payload = {
            content: `**[Source Sauvegardée]** ${urlToSend}`
        };

        try {
            sendBtn.disabled = true;
            sendBtn.textContent = "Envoi...";

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                statusDiv.textContent = "Source enregistrée avec succès !";
                statusDiv.classList.add("text-green-400");
            } else {
                throw new Error("Erreur serveur Discord");
            }
        } catch (error) {
            statusDiv.textContent = "Erreur : Impossible d'envoyer.";
            statusDiv.classList.add("text-red-400");
            console.error(error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = "Envoyer à Discord";
        }
    });
});