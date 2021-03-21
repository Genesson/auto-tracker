const port = chrome.extension.connect();
port.postMessage("Hi BackGround");

port.onMessage.addListener((data) => {
  document.getElementById("status").textContent = (data.loadedList) ? 'Sim' : 'Não';
});

const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  const formData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    start_interval: document.getElementById('start_interval').value,
    end_interval: document.getElementById('end_interval').value,
    prefix: document.getElementById('prefix').value,
    activity: document.getElementById('activity').value
  }

  if (formData.email == '' || formData.password == '') {
    return alert('E-mail e senha são obrigatórios!');
  }

  if (formData.start_interval == '' || formData.end_interval == '') {
    return alert('Intervavo é obrigatório!');
  }

  if (formData.prefix == '') {
    return alert('Prefixo é obrigatório!');
  }

  if (formData.prefix.match(/\|/g) == null || (formData.prefix.match(/\|/g)).length != 3) {
    return alert('Prefixo fora do padrão!');
  }

  const timestampStart = new Date(
    new Date().setHours(formData.start_interval.substr(0, 2), formData.start_interval.substr(3, 2), 0, 0)
  ).getTime();
  
  const timestampEnd = new Date(
    new Date().setHours(formData.end_interval.substr(0, 2), formData.end_interval.substr(3, 2), 0, 0)
  ).getTime();

  if (timestampStart > timestampEnd) {
    return alert('Início do intervalo não pode ser maior que o fim!');
  }

  port.postMessage(formData);
});

const activity = document.getElementById('activity');
activity.addEventListener('keyup', () => {
  if (activity.scrollHeight < 125) {
    activity.style.height = "25px";
    activity.style.height = (activity.scrollHeight) + "px";
  }
});