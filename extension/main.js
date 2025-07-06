var skk_dictionary = null;
var skk = null;

function getOptions() {
  return new Promise(resolve => {
    chrome.storage.sync.get('options', data => {
        resolve(data.options || {});
        console.log("data.options");
        console.log(data.options);
    })
  });
}

(async function() {
  const options = await getOptions();
  skk_dictionary = new Dictionary(options.system_dictionary);
  chrome.input.ime.onActivate.addListener(function(engineID) {
    var enable_sands = options.enable_sands ? options.enable_sands : false;
    skk = new SKK(engineID, skk_dictionary, enable_sands);

    var menus = [
      {id:'skk-options', label:'SKK\u306E\u8A2D\u5B9A', style:'check'},
      {id:'skk-separator', style:'separator'}
    ];
    for (var i = 0; i < skk.primaryModes.length; i++) {
      var modeName = skk.primaryModes[i];
      menus.push({
        id: 'skk-' + modeName,
        label: skk.modes[modeName].displayName,
        style: 'radio',
        checked: (modeName == 'hiragana')
      });
    }
    chrome.input.ime.setMenuItems({engineID:engineID, items:menus});
  });

  chrome.input.ime.onFocus.addListener(function(context) {
    if (skk) skk.context = context.contextID;
  });

  chrome.input.ime.onKeyEvent.addListener(function(engineID, keyData) {
    return skk && skk.handleKeyEvent(keyData);
  });

  chrome.input.ime.onMenuItemActivated.addListener(function(engineID, name) {
    if (name == 'skk-options') {
      chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
      return;
    }
    var modeName = name.slice('skk-'.length);
    if (skk) skk.switchMode(modeName);
  });
})();
