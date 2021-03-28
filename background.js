let feedback = {
  isLoading: false,
  loadedList: false
}

let portPopup;
let list;

// lê de popup
chrome.extension.onConnect.addListener((port) => {
  portPopup = port;

  port.onMessage.addListener(function(data) {
    this.sendFeedback();
    console.log(list);

    if (list && typeof data === 'object') {
      console.log("Dados do formulário: ", data);
      // loginClockfy(list, data);
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

function loginClockfy(list, user) {
  // TRATAMENTO DE LIST
  const tasksToArray = user.activity.split("\n");
  console.log('tasksToArray', tasksToArray);

  const dataTask = [];
  
  tasksToArray.map(item => {
    const task = {
      date: item.trim().substring(0, item.trim().indexOf(" ")),
      description: item.trim().substring(item.trim().indexOf(" ")).trim()
    }
    dataTask.push(task);
  });

  const DESCRIPTION_DEFAULT = user.prefix;
  const PROJECT_ID = "5ee7d2cf6e009831b01cecb7";
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
      projectId: PROJECT_ID,
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
  // FECHA TRATAMENTO DE LIST


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
      const token = JSON.parse(this.responseText).token;
      formattedList.map(item => insertRecordClockfy(token, item));
    }
  });
  
  xhr.open("POST", "https://global.api.clockify.me/auth/token");
  xhr.setRequestHeader("Content-Type", "application/json");
  
  xhr.send(data);
}

function insertRecordClockfy(token, item) {
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
