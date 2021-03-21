const script = document.createElement('script');
script.src = chrome.extension.getURL('injected.js');

window.onload = () => {
  console.log('window.onload');
  
  document.head.appendChild(script);
}

// lê de injected
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window) return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    console.log("listagem", event.data.list);

    // envia para background
    chrome.runtime.sendMessage({
      type: "notification", 
      data: event.data.list
    });
  }
});