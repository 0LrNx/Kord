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
        export {};