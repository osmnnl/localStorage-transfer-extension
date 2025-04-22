// background.js dosyası - LocalStorage Transfer Tool

// Chrome'dan gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureToken") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: captureLocalStorage
      }).then(result => {
        if (result && result[0] && result[0].result) {
          chrome.storage.local.set({ 'tokenData': result[0].result });
          sendResponse({ success: true, message: "LocalStorage verileri başarıyla kaydedildi!" });
        }
      }).catch(err => {
        console.error("LocalStorage verileri alınamadı:", err);
        sendResponse({ success: false, message: "LocalStorage verileri alınamadı: " + err.message });
      });
    });
    return true; // Asenkron yanıt için gerekli
  }

  if (message.action === "injectToken") {
    chrome.storage.local.get('tokenData', data => {
      if (data.tokenData) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: injectLocalStorage,
            args: [data.tokenData]
          }).then(() => {
            sendResponse({ success: true, message: "LocalStorage verileri başarıyla yerleştirildi!" });
          }).catch(err => {
            console.error("LocalStorage verileri yerleştirilemedi:", err);
            sendResponse({ success: false, message: "LocalStorage verileri yerleştirilemedi: " + err.message });
          });
        });
      } else {
        sendResponse({ success: false, message: "Önce bir sayfadan localStorage verilerini almalısınız!" });
      }
    });
    return true; // Asenkron yanıt için gerekli
  }
});

// Web sayfasından localStorage verilerini alır
function captureLocalStorage() {
  const storageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    storageData[key] = localStorage.getItem(key);
  }
  return storageData;
}

// Web sayfasına localStorage verilerini ekler
function injectLocalStorage(storageData) {
  Object.entries(storageData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  return true;
}