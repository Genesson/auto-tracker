// Connect ti the BackGround
const port = chrome.extension.connect();
port.postMessage("Hi BackGround");

// Get Status From List
port.onMessage.addListener((data) => {
  document.getElementById("status").textContent = (data.loadedList) ? 'Sim' : 'Não';
});

// Set Start and End Date of the Month 
const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDate();
const lastDayMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
document.getElementById('start_period').value = new Date(new Date().setDate(firstDayMonth)).toISOString().slice(0, 10);
document.getElementById('end_period').value = new Date(new Date().setDate(lastDayMonth)).toISOString().slice(0, 10);

// Event Listener Submit Form
const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  this.clearError();

  const formData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    start_period: document.getElementById('start_period').value,
    end_period: document.getElementById('end_period').value,
    start_interval: document.getElementById('start_interval').value,
    end_interval: document.getElementById('end_interval').value,
    prefix: document.getElementById('prefix').value,
    activity: document.getElementById('activity').value
  }

  errors = 0;
  errors += this.validator("field-mail", (formData.email == ''));
  errors += this.validator("field-password", (formData.password == ''));
  errors += this.validator("field-period", (formData.start_period == '' || formData.end_period == ''));
  errors += this.validator("field-interval", (formData.start_interval == '' || formData.end_interval == ''));
  errors += this.validator("field-prefix", (formData.prefix == ''));

  if (formData.prefix.match(/\|/g) == null || (formData.prefix.match(/\|/g)).length != 3) {
    errors += this.displayError("<p>Prefixo fora do padrão!</p>");
  }

  const timestampStart = new Date(
    new Date().setHours(formData.start_interval.substr(0, 2), formData.start_interval.substr(3, 2), 0, 0)
  ).getTime();
  
  const timestampEnd = new Date(
    new Date().setHours(formData.end_interval.substr(0, 2), formData.end_interval.substr(3, 2), 0, 0)
  ).getTime();

  if (timestampStart > timestampEnd) {
    errors += this.displayError("<p>Início do intervalo não pode ser maior que o fim!</p>");
  }

  setTimeout(() => this.clearError(), 2000);

  if (errors > 0) return;

  port.postMessage(formData);
});

// Event Listener Textarea
const activity = document.getElementById('activity');
activity.addEventListener('keyup', () => {
  if (activity.scrollHeight < 125) {
    activity.style.height = "25px";
    activity.style.height = (activity.scrollHeight) + "px";
  }
});

// Auxiliary Functions
let messages = '';

function validator(field, invalid) {
  if (invalid) {
    document.getElementById(field).style.borderColor = "#FF665A";
    return 1;
  } else {
    document.getElementById(field).style.borderColor = "#DDDDDD";
    return 0;
  }
}

function displayError(message) {
  messages += message;
  document.getElementById("messagesError").style.display = "block";
  document.getElementById("messagesError").innerHTML = messages;
  return 1;
}

function clearError() {
  messages = '';
  document.getElementById("messagesError").style.display = "none";
  document.getElementById("messagesError").innerHTML = messages;
}