declare const chrome: any;

document.addEventListener('DOMContentLoaded', () => {
    const webhookList = document.getElementById('webhookList') as HTMLDivElement;
    const newNameInput = document.getElementById('newName') as HTMLInputElement;
    const newUrlInput = document.getElementById('newUrl') as HTMLInputElement;
    const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
    const addError = document.getElementById('addError') as HTMLDivElement;
    const saveStatus = document.getElementById('saveStatus') as HTMLDivElement;

    let webhooks: Record<string, string> = {};

    chrome.storage.local.get(['discordWebhooks'], (result: Record<string, any>) => {
        if (result.discordWebhooks) {
            webhooks = result.discordWebhooks;
        }
        renderWebhooks();
    });

    function saveWebhooks() {
        chrome.storage.local.set({ discordWebhooks: webhooks }, () => {
            saveStatus.textContent = "✅ Modifications enregistrées.";
            saveStatus.className = "mt-4 text-center text-sm font-medium h-6 text-green-400";
            setTimeout(() => { saveStatus.textContent = ""; }, 3000);
            renderWebhooks();
        });
    }

    function renderWebhooks() {
        webhookList.innerHTML = '';
        const keys = Object.keys(webhooks);
        
        if (keys.length === 0) {
            webhookList.innerHTML = '<p class="text-gray-500 text-sm italic text-center py-4 border border-dashed border-gray-700 rounded">Aucun webhook configuré pour le moment.</p>';
            return;
        }

        keys.forEach(name => {
            const url = webhooks[name];
            const item = document.createElement('div');
            item.className = "flex items-center gap-4 bg-gray-900 p-3 rounded border border-gray-700 shadow-sm";
            
            item.innerHTML = `
                <div class="flex-1 overflow-hidden">
                    <p class="font-medium text-white truncate">${name}</p>
                    <p class="text-xs text-gray-400 truncate">${url}</p>
                </div>
                <button class="delete-btn text-red-400 hover:text-red-300 px-3 py-1 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors text-sm cursor-pointer whitespace-nowrap" data-name="${name}">Supprimer</button>
            `;

            const delBtn = item.querySelector('.delete-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    const n = (e.target as HTMLElement).getAttribute('data-name');
                    if (n && webhooks[n]) {
                        delete webhooks[n];
                        saveWebhooks();
                    }
                });
            }

            webhookList.appendChild(item);
        });
    }

    addBtn.addEventListener('click', () => {
        const name = newNameInput.value.trim();
        const url = newUrlInput.value.trim();

        if (!name || !url.startsWith('https://discord.com/api/webhooks/')) {
            addError.classList.remove('hidden');
            return;
        }

        addError.classList.add('hidden');
        webhooks[name] = url;
        
        newNameInput.value = '';
        newUrlInput.value = '';
        
        saveWebhooks();
    });
});