// popup.js dosyası - LocalStorage Transfer Tool

document.addEventListener('DOMContentLoaded', function () {
  const captureBtn = document.getElementById('captureBtn');
  const injectBtn = document.getElementById('injectBtn');
  const manualBtn = document.getElementById('manualBtn');
  const statusDiv = document.getElementById('status');

  // Herhangi bir sayfadan localStorage verilerini al
  captureBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: "captureToken" }, function (response) {
      if (response && response.success) {
        statusDiv.textContent = response.message;
        statusDiv.className = 'success';

        // Veriler alındığında sayfada tooltip göster
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: showTooltipOnPage,
            args: ["LocalStorage verileri başarıyla alındı!"]
          });
        });

        // 2 saniye sonra popup'ı kapat
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        statusDiv.textContent = response.message || 'Bir hata oluştu.';
        statusDiv.className = 'error';
      }
    });
  });

  // Mevcut sayfaya localStorage verilerini yerleştir
  injectBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: "injectToken" }, function (response) {
      if (response && response.success) {
        statusDiv.textContent = response.message;
        statusDiv.className = 'success';

        // Veriler yerleştirildiğinde sayfada tooltip göster
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: showTooltipOnPage,
            args: ["LocalStorage verileri başarıyla yerleştirildi!"]
          });
        });

        // 2 saniye sonra popup'ı kapat
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        statusDiv.textContent = response.message || 'Bir hata oluştu.';
        statusDiv.className = 'error';
      }
    });
  });

  // Manuel aktarım için localStorage verilerini kopyala
  manualBtn.addEventListener('click', function () {
    chrome.storage.local.get('tokenData', function (data) {
      if (data.tokenData) {
        const tokenScript = `Object.entries(${JSON.stringify(data.tokenData)})
          .forEach(([k,v])=>localStorage.setItem(k,v))`;

        // Panodan kopyala
        navigator.clipboard.writeText(tokenScript).then(() => {
          statusDiv.textContent = 'LocalStorage kodu panoya kopyalandı!';
          statusDiv.className = 'success';

          // Veriler kopyalandığında sayfada tooltip göster
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: showTooltipOnPage,
              args: ["LocalStorage kodu panoya kopyalandı!"]
            });
          });

          // 2 saniye sonra popup'ı kapat
          setTimeout(() => {
            window.close();
          }, 2000);
        }).catch(err => {
          statusDiv.textContent = 'Panoya kopyalanamadı: ' + err.message;
          statusDiv.className = 'error';
        });
      } else {
        statusDiv.textContent = 'Önce bir sayfadan localStorage verilerini almalısınız!';
        statusDiv.className = 'error';
      }
    });
  });
});

// Sayfada tooltip gösterme fonksiyonu
function showTooltipOnPage(message) {
  // Eğer zaten varsa eski tooltip'i kaldır
  let oldTooltip = document.getElementById('localstorage-transfer-tooltip');
  if (oldTooltip) {
    document.body.removeChild(oldTooltip);
  }

  // Yeni tooltip oluştur
  const tooltip = document.createElement('div');
  tooltip.id = 'localstorage-transfer-tooltip';
  tooltip.textContent = message;
  tooltip.style.position = 'fixed';
  tooltip.style.top = '20px';
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%)';
  tooltip.style.padding = '10px 15px';
  tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  tooltip.style.color = 'white';
  tooltip.style.borderRadius = '4px';
  tooltip.style.zIndex = '10000';
  tooltip.style.fontSize = '14px';
  tooltip.style.transition = 'opacity 0.3s';
  tooltip.style.opacity = '1';

  // Sayfaya ekle
  document.body.appendChild(tooltip);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    tooltip.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    }, 300);
  }, 3000);

  return true;
}