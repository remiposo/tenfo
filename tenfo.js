(() => {
  const tenfoWindow = window.open('', 'tenfoWindow', `width=${screen.width},height=300,left=0,top=${screen.height-300}`);
  const playerKeys = ['n1', 'n2', 'n3'];
  const tedashiKeys = ['E', 'F', 'G'];
  const tedashiToPlayer = tedashiKeys.reduce((obj, dahai, idx) => {
    obj[dahai] = playerKeys[idx];
    return obj;
  }, {});
  let imagesUrl;

  const isJSON = (str) => {
    try {
      JSON.parse(str)
    } catch (e) {
      return false;
    }
    return true;
  };

  const updatePlayer = (data) => {
    playerKeys.forEach((key) => {
      if (!(key in data)) return;
      playerName = decodeURI(data[key]);
      const nameContainer = tenfoWindow.document.querySelector('#' + key + '-name');
      nameContainer.innerHTML = '';
      nameContainer.appendChild(tenfoWindow.document.createTextNode(playerName));
    });
  };

  const resetTedashi = (data) => {
    playerKeys.forEach((key) => {
      const dahaiContainer = tenfoWindow.document.querySelector('#' + key + '-dahai');
      dahaiContainer.innerHTML = '';
    });
  };

  const imageFileNameOf = (dahaiNum) => {
    let result;
    if ([16, 52, 88].includes(dahaiNum)) {
      result = imagesUrl + `r${dahaiNum}.png`;
    } else {
      result = imagesUrl + `${Math.floor(dahaiNum/4)}.png`;
    }
    return result;
  };

  const updateTedashi = (data) => {
    const dahai = data.tag.slice(0, 1);
    if (!(tedashiKeys.includes(dahai))) return;
    const dahaiNum = Number(data.tag.slice(1));
    const dahaiContainer = tenfoWindow.document.querySelector('#' + tedashiToPlayer[dahai] + '-dahai');
    const dahaiImg = tenfoWindow.document.createElement('img');
    dahaiImg.src = imageFileNameOf(dahaiNum);
    dahaiImg.width = 31;
    dahaiImg.height = 47;
    dahaiContainer.appendChild(dahaiImg);
  };

  const dataTypeOf = (data) => {
    const tag = data.tag;
    let result;
    if (tag === 'UN') {
      result = 'player';
    } else if (['INIT', 'RYUUKYOKU', 'AGARI'].includes(tag)) {
      result = 'game';
    } else if (/^[d-gD-G]\d+$/.test(tag)) {
      result = 'dahai';
    } else {
      result = 'other';
    }
    return result;
  };

  const updateTenfoWindow = (data) => {
    switch (dataTypeOf(data)) {
      case 'player':
        updatePlayer(data);
        break;
      case 'game':
        resetTedashi(data);
        break;
      case 'dahai':
        updateTedashi(data);
        break;
    }
  };

  const setupTenfoWindow = () => {
    const d = tenfoWindow.document

    const title = d.createElement('title');
    title.appendChild(d.createTextNode('Tenfo'));
    d.head.appendChild(title);

    const tedashiContainer = d.createElement('div');
    tedashiContainer.setAttribute('id', 'tedashi-container');
    d.body.appendChild(tedashiContainer);

    playerKeys.forEach((key) => {
      const playerContainer = d.createElement('div');
      playerContainer.setAttribute('id', key);
      tedashiContainer.appendChild(playerContainer);
      const nameContainer = d.createElement('div');
      nameContainer.setAttribute('id', key + '-name');
      playerContainer.appendChild(nameContainer);
      const dahaiContainer = d.createElement('div');
      dahaiContainer.setAttribute('id', key + '-dahai');
      playerContainer.appendChild(dahaiContainer);
    });
  };

  const sniffWebsocket = () => {
    WebSocket.prototype._send = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      this._send(data);
      this.addEventListener('message', (msg) => {
        if (isJSON(msg.data)) {
          updateTenfoWindow(JSON.parse(msg.data));
        }
      }, false);
      this.send = function (data) {
        this._send(data);
      };
    };
  };

  document.addEventListener('onloadTenfoExtension', (evt) => {
    imagesUrl = evt.detail;
  });
  window.addEventListener('beforeunload', (evt) => {
    tenfoWindow.close();
  });
  setupTenfoWindow();
  sniffWebsocket();
})();
