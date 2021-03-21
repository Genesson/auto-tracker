// lê de popup
chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener(function(data) {
    console.log("Dados do formulário: ", data);
  });
});

// lê de content
chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log('notification', request.type);
  console.log('list', request.data);
  login(request.data);
});

function login(list) {
  const data = JSON.stringify({
    "email": "genesson.sauer@mjv.com.br",
    "password": "$142569837@Services"
  });
  
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      const token = JSON.parse(this.responseText).token;
      list.map(item => insertData(token, item));
    }
  });
  
  xhr.open("POST", "https://global.api.clockify.me/auth/token");
  xhr.setRequestHeader("Content-Type", "application/json");
  
  xhr.send(data);
}

function insertData(token, item) {
  const data = JSON.stringify(item);
  
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });
  
  xhr.open("POST", "https://global.api.clockify.me/workspaces/5cd5b8daf15c98690baa2da3/timeEntries/full");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-Auth-Token", token);
  
  xhr.send(data);
}
