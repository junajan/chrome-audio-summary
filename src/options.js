function loadVoices() {
  const voiceSelect = document.getElementById('voiceSelect');
  chrome.tts.getVoices((voices) => {
    voiceSelect.innerHTML = '<option value="">(Auto-select female voice)</option>';
    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceName;
      option.textContent = `${voice.voiceName} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    // Once voices are loaded, select the current preference
    chrome.storage.local.get(['preferredVoice'], (items) => {
      if (items.preferredVoice) {
        voiceSelect.value = items.preferredVoice;
      }
    });
  });
}

// Voices are loaded asynchronously
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

document.getElementById('testVoice').addEventListener('click', () => {
  const voiceSelect = document.getElementById('voiceSelect');
  const selectedVoice = voiceSelect.value;
  const testText = "Hello! This is a test of the selected voice for your summaries.";
  
  chrome.tts.speak(testText, {
    voiceName: selectedVoice || undefined,
    onEvent: (event) => {
      if (event.type === 'error') {
        console.error('TTS Error:', event);
      }
    }
  });
});

document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  const preferredVoice = document.getElementById('voiceSelect').value;
  
  chrome.storage.local.set({ 
    openaiApiKey: apiKey,
    preferredVoice: preferredVoice
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['openaiApiKey'], (items) => {
    if (items.openaiApiKey) {
      document.getElementById('apiKey').value = items.openaiApiKey;
    }
  });
});