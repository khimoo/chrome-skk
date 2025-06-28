(function() {
function updateComposition(skk) {
  if (skk.roman.length > 0) {
    skk.setComposition(skk.roman, skk.roman.length);
  } else {
    skk.clearComposition();
  }
}

function createRomanInput(table) {
  return function (skk, keyevent) {
    if (keyevent.key == 'Enter') {
      return false;
    }

    if (keyevent.key == 'Backspace' && skk.roman.length > 0) {
      skk.roman = skk.roman.slice(0, skk.roman.length - 1);
      return true;
    }

    if ((keyevent.key == 'Esc' ||
        (keyevent.key == 'g' && keyevent.ctrlKey)) && skk.roman.length > 0) {
      skk.roman = '';
      return true;
    }

    if (keyevent.key == 'j' && keyevent.ctrlKey) {
      return true;
    }

    if (keyevent.key.length != 1 || keyevent.ctrlKey || keyevent.altKey) {
      if (skk.sandsModeEnabled && keyevent.code === 'Space') {
        if (keyevent.type === 'keydown') {
          skk.spaceDown = true;
          return true;
        } else if (keyevent.type === 'keyup') {
          if (skk.spaceDown && !skk.otherKeyDown) {
            skk.commitText(' ');
            skk.spaceDown = false;
            return true;
          }
          skk.spaceDown = false;
          skk.otherKeyDown = false;
          return true;
        }
      }
      return false;
    }

    if (skk.sandsModeEnabled) {
      if (keyevent.type === 'keydown') {
        skk.otherKeyDown = true;
        if (skk.spaceDown) {
          keyevent.shiftKey = true;
        }
      }
    }

    if (!keyevent.shiftKey) {
      if (skk.processRoman(keyevent.key, table, skk.commitText.bind(skk))) {
        return true;
      }

      if (keyevent.key == 'q') {
        skk.switchMode(
          (skk.currentMode == 'hiragana') ? 'katakana' : 'hiragana');
        return true;
      }
      if (keyevent.key == 'l') {
        skk.switchMode('ascii');
        return true;
      }

      if (keyevent.key == '/') {
        skk.switchMode('ascii-preedit');
        return true;
      }
    } else if (keyevent.key == 'Q') {
      console.log('here');
      skk.processRoman(keyevent.key, table, skk.commitText.bind(skk));
      skk.switchMode('preedit');
      return true;
    } else if (keyevent.key == 'L') {
      skk.processRoman(keyevent.key, table, skk.commitText.bind(skk));
      skk.switchMode('full-ascii');
      return true;
    } else if (keyevent.shiftKey &&
               keyevent.key >= 'A' && keyevent.key <= 'Z') {
      skk.switchMode('preedit');
      skk.processRoman(
        keyevent.key.toLowerCase(), romanTable, function(text) {
          skk.preedit = skk.preedit.slice(0, skk.caret) +
            text + skk.preedit.slice(skk.caret);
          skk.caret += text.length;
        });
      return true;
    } else if (keyevent.key == '!' || keyevent.key == '?') {
      skk.processRoman(keyevent.key, table, skk.commitText.bind(skk));
      return true;
    }

    return false;
  };
}

SKK.registerMode('hiragana', {
  displayName: '\u3072\u3089\u304c\u306a',
  keyHandler: createRomanInput(romanTable),
  compositionHandler: updateComposition
});

SKK.registerMode('katakana', {
  displayName: '\u30ab\u30bf\u30ab\u30ca',
  keyHandler: createRomanInput(katakanaTable),
  compositionHandler: updateComposition
});
})();
