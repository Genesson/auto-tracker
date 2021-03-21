const port = chrome.extension.connect();
port.postMessage("Hi BackGround");

const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  const formData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    start_interval: document.getElementById('start_interval').value,
    end_interval: document.getElementById('end_interval').value,
    activity: document.getElementById('activity').value
  }

  if (formData.email == '' || formData.password == '') {
    alert('E-mail e senha são obrigatórios!');
    return;
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