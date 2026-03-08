let isSpeaking = false;

// Initial check when popup opens
chrome.storage.local.get(['lastSummary'], (result) => {
  if (result.lastSummary) {
    document.getElementById('summary').value = result.lastSummary;
    document.getElementById('readAloud').disabled = false;
  }
});

chrome.runtime.sendMessage({ action: 'isSpeaking' }, (response) => {
  if (response && response.speaking) {
    isSpeaking = true;
    document.getElementById('readAloud').innerHTML = '<span>🛑</span> Stop Reading';
    document.getElementById('readAloud').disabled = false;
  }
});

// Listen for TTS events from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'ttsEvent') {
    const readBtn = document.getElementById('readAloud');
    if (msg.type === 'start') {
      readBtn.innerHTML = '<span>🛑</span> Stop Reading';
      isSpeaking = true;
    } else {
      readBtn.innerHTML = '<span>🔊</span> Read Aloud';
      isSpeaking = false;
    }
  }
});

async function runSummarization(type) {
  const shortBtn = document.getElementById('summarize');
  const fullBtn = document.getElementById('fullSummarize');
  const readBtn = document.getElementById('readAloud');
  const summaryArea = document.getElementById('summary');
  const errorDiv = document.getElementById('error');
  
  errorDiv.style.display = 'none';
  summaryArea.value = 'Extracting text and generating ' + type + ' summary...';
  shortBtn.disabled = true;
  fullBtn.disabled = true;
  readBtn.disabled = true;

  try {
    const storage = await chrome.storage.local.get(['openaiApiKey']);
    const apiKey = storage.openaiApiKey;

    if (!apiKey) {
      throw new Error('Please set your OpenAI API Key in settings first.');
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.body.innerText.substring(0, 15000); 
      },
    });

    const pageText = results[0].result;

    if (!pageText || pageText.trim().length < 50) {
        throw new Error('Not enough text found on this page to summarize.');
    }

    let systemPrompt = '';
    if (type === 'short') {
        systemPrompt = 'You are a helpful assistant that summarizes web page content for audio playback. Your goal is to provide a high-density, informative summary. Start with a very brief introductory phrase (e.g., "This page covers..." or "Briefly..."). Then, provide a concise 2-3 sentence summary that captures all key information and core value without any unnecessary filler. Ensure it is clear and easy to understand when read aloud.';
    } else {
        systemPrompt = 'You are a helpful assistant that provides a detailed and informative summary of web page content for audio playback. Start with an introduction about the page. Then, provide a comprehensive summary in 3-5 detailed paragraphs or key sections. Cover all important points, arguments, or data provided in the text. Ensure the tone is engaging and suitable for listening.';
    }

    const requestPayload = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please summarize the following text:\n\n${pageText}` }
        ],
        temperature: 0.7
    };

    console.log('OpenAI API Request (' + type + '):', requestPayload);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    console.log('OpenAI API Response:', data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    const summaryText = data.choices[0].message.content.trim();
    summaryArea.value = summaryText;
    
    // Persist summary
    chrome.storage.local.set({ lastSummary: summaryText });
    
    readBtn.disabled = false;

  } catch (err) {
    console.error(err);
    errorDiv.textContent = err.message;
    errorDiv.style.display = 'block';
    summaryArea.value = '';
  } finally {
    shortBtn.disabled = false;
    fullBtn.disabled = false;
  }
}

document.getElementById('summarize').addEventListener('click', () => runSummarization('short'));
document.getElementById('fullSummarize').addEventListener('click', () => runSummarization('full'));

document.getElementById('readAloud').addEventListener('click', async () => {
  const summaryArea = document.getElementById('summary');
  const readBtn = document.getElementById('readAloud');

  if (isSpeaking) {
    chrome.runtime.sendMessage({ action: 'stop' });
    readBtn.innerHTML = '<span>🔊</span> Read Aloud';
    isSpeaking = false;
    return;
  }

  const text = summaryArea.value;
  if (!text) return;

  // For chrome.tts, we need to find the voice name
  chrome.storage.local.get(['preferredVoice'], (items) => {
    chrome.tts.getVoices((voices) => {
      let selectedVoice;
      
      if (items.preferredVoice) {
        selectedVoice = voices.find(v => v.voiceName === items.preferredVoice);
      }
      
      if (!selectedVoice) {
        // Fallback: Google US English, Samantha, or any female voice
        selectedVoice = voices.find(v => v.voiceName === 'Google US English') ||
                        voices.find(v => v.voiceName === 'Google US English (en-US)') ||
                        voices.find(v => v.voiceName === 'Samantha') ||
                        voices.find(v => v.voiceName.toLowerCase().includes('female'));
      }
      
      chrome.runtime.sendMessage({ 
          action: 'speak', 
          text: text,
          voiceName: selectedVoice ? selectedVoice.voiceName : undefined
      });
    });
  });
});