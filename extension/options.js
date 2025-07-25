var compressions = [['gzip', 'gz'], ['none', '']];
var encodings = [['EUC-JP', 'euc-jp'], ['UTF-8', 'utf-8']];

function buildSelect(selectElement, options) {
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');
    option.textContent = options[i][0];
    option.value = options[i][1];
    selectElement.appendChild(option);
  }
}

function onload() {
  var form = document.getElementById('system_dictionary');
  var enable_sands_checkbox = document.getElementById('enable_sands_checkbox');

  chrome.storage.sync.get('options', (data) => {
    console.dir({ 'status': 'loaded saved options', 'data': data });
    if (data.options && data.options.system_dictionary) {
      form.url.value = data.options.system_dictionary.url;
      form.compression.value = data.options.system_dictionary.compression;
      form.encoding.value = data.options.system_dictionary.encoding;
    }
    // SandS
    if (data.options && typeof data.options.enable_sands !== "undefined") {
      enable_sands_checkbox.checked = data.options.enable_sands;
    }
  });
  var url_input = form.url;
  var compression_input = form.compression;
  buildSelect(compression_input, compressions);
  var encoding_input = form.encoding;
  buildSelect(encoding_input, encodings);

  var reload_button = document.getElementById('reload_button');

  document.getElementById('reload_button').onclick = function () {
    var options = {
      system_dictionary: {
        url: url_input.value,
        compression: compression_input.value,
        encoding: encoding_input.value
      },
      enable_sands: enable_sands_checkbox.checked // SandS
    };
    // chrome storage API does not emit an event when the value is unchanged
    // Check the currently stored value to make sure the button is not disabled forever
    function isEqual(obj1, obj2) {
      var props = Object.getOwnPropertyNames(obj1);
      var props2 = Object.getOwnPropertyNames(obj2);
      if (props.length !== props2.length) return false;
      for (var i = 0; i < props.length; i++) if (obj1[props[i]] !== obj2[props[i]]) return false;
      return true;
    }
    chrome.storage.sync.get('options', (data) => {
        var prev = data.options || {};
        var changed = false;
        if (!prev.system_dictionary ||
            !isEqual(prev.system_dictionary, options.system_dictionary)) {
          changed = true;
        }
        if (prev.enable_sands !== options.enable_sands) {
          changed = true;
        }
        if (!changed) {
          console.log('The options are unchanged. Do nothing.');
          return;
        }
      chrome.storage.sync.set({ options });
      form.disabled = 'disabled';
      reload_button.disabled = 'disabled';
    });
  };
}

// request is supposed to be in {method, body} format.
function onReceive(request, sender, sendResponse) {
  switch (request.method) {
    case "update_dictionary_load_status":
      let body = request.body;
      var div = document.getElementById('reloading_message');
      div.innerHTML = '';
      if (body.status == 'written') {
        div.style.display = 'none';
        document.getElementById('system_dictionary').disabled = '';
        document.getElementById('reload_button').disabled = '';
        return;
      }
      div.style.display = 'block';
      div.appendChild(document.createTextNode(body.status));
      if (body.status == 'parsing') {
        div.appendChild(
          document.createTextNode(': ' + body.progress + '/' + body.total));
      }
      return;
    case "read_clipboard":
      (async () => {
        let text = await navigator.clipboard.readText();
        chrome.runtime.sendMessage({
          method: "read_clipboard_response",
          body: {content: text}
        });
      })();
      return;
    default:
      console.log("Unexpected request: " + request.method);
  }
}

window.addEventListener('load', onload);
chrome.runtime.onMessage.addListener(onReceive);

