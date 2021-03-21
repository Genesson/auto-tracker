(function(xhr) {
  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;

  XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = (new Date()).toISOString();

    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function(header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function(postData) {
    this.addEventListener('load', function() {
      var endTime = (new Date()).toISOString();

      var myUrl = this._url ? this._url.toLowerCase() : this._url;
      if (myUrl) {
        if (postData) {
          if (typeof postData === 'string') {
            try {
              // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
              this._requestHeaders = postData;    
            } catch(err) {
              console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
              console.log(err);
            }
          } else if (
            typeof postData === 'object' 
            || typeof postData === 'array' 
            || typeof postData === 'number' 
            || typeof postData === 'boolean') {
            // do something if you need
          }
        }
        // here you get the RESPONSE HEADERS
        var responseHeaders = this.getAllResponseHeaders();

        if (this.responseType != 'blob' && this.responseText && this._url.indexOf('verifica_acesso') > -1) {
          // responseText is string or null
          try {
            // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
            var arr = this.responseText;
            // printing url, request headers, response headers, response body, to console
            // console.log(this._url);
            // console.log(this._requestHeaders);
            // console.log(responseHeaders);
            const itens = JSON.parse(arr).itens;
            insertData(itens);
          } catch(err) {
            console.log("Error in responseType try catch");
            console.log(err);
          }
        }
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);

function insertData(list) {
  const tasksString = 
  `01/03/2021 Implementação do cupo de desconto
  02/03/2021 Deploy em produção`;
  
  const tasksToArray = tasksString.split("\n");

  const dataTask = [];
  
  tasksToArray.map(item => {
    const task = {
      date: item.trim().substring(0, item.trim().indexOf(" ")),
      description: item.trim().substring(item.trim().indexOf(" ")).trim()
    }
    dataTask.push(task);
  });

  const DESCRIPTION_DEFAULT = "Santander | CWB | Front | AutoCompara";
  const PROJECT_ID = "5ee7d2cf6e009831b01cecb7";
  const hourIntervalStart = " 12:00:00";
  const hourIntervalEnd = " 13:00:00";

  json = [];

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
    
    json.push(firstPeriod, secondPeriod);
  });

  const data = { type: "FROM_PAGE", list: json };
  // envia para content
  window.postMessage(data, "*");
}