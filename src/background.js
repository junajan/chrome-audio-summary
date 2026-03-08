chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'speak') {
    chrome.tts.speak(request.text, {
      voiceName: request.voiceName,
      rate: 1.0,
      pitch: 1.0,
      onEvent: (event) => {
        if (event.type === 'start' || event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled' || event.type === 'error') {
            // Forward event back to popup if it's still open
            chrome.runtime.sendMessage({ action: 'ttsEvent', type: event.type });
        }
      }
    });
  } else if (request.action === 'stop') {
    chrome.tts.stop();
  } else if (request.action === 'isSpeaking') {
    chrome.tts.isSpeaking((speaking) => {
        sendResponse({ speaking });
    });
    return true; // Keep channel open for async response
  }
});