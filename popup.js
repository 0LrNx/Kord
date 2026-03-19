document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const channelSelect = document.getElementById('channel');
    const sendBtn = document.getElementById('sendBtn');
    const statusDiv = document.getElementById('status');


    const WEBHOOKS = {
        'webhook_setup': import.meta.env.VITE_WEBHOOK_SETUP
    };

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            urlInput.value = tabs[0].url;
        }
    });

    sendBtn.addEventListener('click', async () => {
        const urlToSend = urlInput.value;
        const selectedChannelKey = channelSelect.value;
        
        statusDiv.textContent = "";
        statusDiv.className = "";

        if (!urlToSend) {
            statusDiv.textContent = "Veuillez coller une URL.";
            statusDiv.className = "error";
            return;
        }
        if (!selectedChannelKey) {
            statusDiv.textContent = "Veuillez choisir un salon.";
            statusDiv.className = "error";
            return;
        }

        const webhookUrl = WEBHOOKS[selectedChannelKey];

        if (!webhookUrl) {
            statusDiv.textContent = "Configuration Webhook introuvable.";
            statusDiv.className = "error";
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
                statusDiv.className = "success";
            } else {
                throw new Error("Erreur serveur Discord");
            }
        } catch (error) {
            statusDiv.textContent = "Erreur : Impossible d'envoyer.";
            statusDiv.className = "error";
            console.error(error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = "Envoyer à Discord";
        }
    });
});