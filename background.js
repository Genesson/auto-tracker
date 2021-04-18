let feedback = {
  isLoading: false,
  loadedList: false
}

let portPopup;

let list;

let workspaceId;

let listRecordsOnMonth;

// lê de popup
chrome.extension.onConnect.addListener((port) => {
  portPopup = port;

  port.onMessage.addListener(function(data) {
    this.sendFeedback();

    if (list && typeof data === 'object') {
      loginClockfy(data);
    } else if(feedback.loadedList === false) {
      console.log(data);
    }
  });
});

function sendFeedback() {
  portPopup.postMessage(feedback);
}

// lê de content
chrome.runtime.onMessage.addListener(function(request, sender) {
  list = request.data;
  feedback.loadedList = true;
});

function loginClockfy(user) {
  const data = JSON.stringify({
    "email": user.email,
    "password": user.password
  });
  
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      if (JSON.parse(this.responseText).code === 404) {
        alert('Falha no Login. Email ou Senha Inválidos!');
        return;
      }

      const login = {
        loginId: JSON.parse(this.responseText).id,
        memberShip: JSON.parse(this.responseText).membership[0].targetId,
        token: JSON.parse(this.responseText).token
      }
      findWorkspaceId(user, login);
    }
  });
  
  xhr.open("POST", "https://global.api.clockify.me/auth/token");
  xhr.setRequestHeader("Content-Type", "application/json");
  
  xhr.send(data);
}

function findWorkspaceId(user, login) {
  const term = user.prefix.substring(user.prefix.lastIndexOf("|") + 1).trim().toLowerCase();

  const data = null;

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      if (!JSON.parse(this.responseText)[0]) {
        alert('Projeto não encontrado, verifique o formato do prefixo informado!');
        return;
      }

      workspaceId = JSON.parse(this.responseText)[0].id;
      formatList(user, login);
    }
  });

  xhr.open("GET", `https://global.api.clockify.me/workspaces/${login.memberShip}/projects/list?=&name=${term}`);
  xhr.setRequestHeader("X-Auth-Token", login.token);
  xhr.setRequestHeader("Authorization", "Bearer ");

  xhr.send(data);
}

function formatList(user, login) {
  const tasksToArray = user.activity.split("\n");

  const dataTask = [];

  tasksToArray.map(item => {
    const task = {
      date: item.trim().substring(0, item.trim().indexOf(" ")),
      description: item.trim().substring(item.trim().indexOf(" ")).trim()
    }
    dataTask.push(task);
  });

  const DESCRIPTION_DEFAULT = user.prefix;
  const hourIntervalStart = " " + user.start_interval + ":00";
  const hourIntervalEnd = " " + user.end_interval + ":00";

  formattedList = [];

  list = list.filter(item => item.marcacao1 != null);
  list = list.slice(0, 3);

  list.map(item => {
    const descriptionTask = dataTask.filter(task => task.date === item.dt);
    const description = descriptionTask[0] ? DESCRIPTION_DEFAULT + " | " + (descriptionTask[0].description) : DESCRIPTION_DEFAULT;

    const data = {
      billable: true,
      description: description,
      projectId: workspaceId,
      taskId: null,
      tagIds: null
    }

    const firstPeriod = {
      ...data,
      start: new Date(new Date(item.marcacao1).setSeconds(0,0)).toISOString(),
      end: new Date(item.data + hourIntervalStart).toISOString()
    };

    const secondPeriod = {
      ...data,
      start: new Date(item.data + hourIntervalEnd).toISOString(),
      end: new Date(new Date(item.marcacao2).setSeconds(0,0)).toISOString()
    };
    
    formattedList.push(firstPeriod, secondPeriod);
  });

  recordsOnMonth(formattedList, login);
}

function recordsOnMonth(formattedList, login) {
  const data = null;

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      listRecordsOnMonth = JSON.parse(this.responseText).durationMap;

      formattedList.map(item => insertRecordClockfy(item, login));
    }
  });

  xhr.open("GET", `https://global.api.clockify.me/workspaces/${login.memberShip}/timeEntries/user/${login.loginId}/full?=&page=0&limit=50`);
  xhr.setRequestHeader("X-Auth-Token", login.token);

  xhr.send(data);
}

function insertRecordClockfy(item, login) {
  // Verifica se já existe registro neste dia no clockfy
  if (listRecordsOnMonth[item.start.substring(0, 10)]) return;

  const data = JSON.stringify(item);

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });
  
  xhr.open("POST", `https://global.api.clockify.me/workspaces/${login.memberShip}/timeEntries/full`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-Auth-Token", login.token);
  
  xhr.send(data);
}
