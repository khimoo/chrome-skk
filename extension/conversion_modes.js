(function() {

function updateComposition(skk) {
  var entry = skk.entries.entries[skk.entries.index];
  if (!entry) {
    skk.clearComposition();
  }

  var preedit = '\u25bc' + entry.word;
  if (skk.okuriText.length > 0) {
    preedit += skk.okuriText;
  }
  if (entry.annotation) {
    preedit += ';' + entry.annotation;
  }
  skk.setComposition(preedit, 1, {selectionStart:preedit.length,
                                  selectionEnd:preedit.length});
}

function initConversion(skk) {
  skk.lookup(skk.preedit + skk.okuriPrefix, function(entries) {
    if (entries) {
      skk.entries = {index:0, entries:entries};
      updateComposition(skk);
    } else {
      skk.createInnerSKK();
    }
  });
  // SandS状態の初期化
  skk.isSandSActive = false;
  skk.keyPressedDuringSandS = false;
}

function conversionMode(skk, keyevent) {
  // keyupイベント処理: Spaceキーのみ特別扱い
  if (keyevent.type === 'keyup') {
    if (keyevent.key === ' ' && skk.isSandSActive) {
      // SandS状態でSpaceキーが離された場合
      if (!skk.keyPressedDuringSandS) {
        // 他のキーが押されていなければ変換候補を次に進める
        if (skk.entries.index > 2) {
          skk.entries.index += 7;
        } else {
          skk.entries.index++;
        }

        if (skk.entries.index >= skk.entries.entries.length) {
          skk.createInnerSKK();
        }
        updateComposition(skk);
      }
      skk.isSandSActive = false;
      skk.keyPressedDuringSandS = false;
      return true;
    }
    return false;
  }

  // keydownイベント処理
  // ============================================

  // SandS状態リセット: Space以外のキーが押されたらフラグ設定
  if (keyevent.key !== ' ' && skk.isSandSActive) {
    skk.keyPressedDuringSandS = true;
  }

  // Ctrl+Spaceの処理
  if (keyevent.key === ' ' && keyevent.ctrlKey) {
    skk.isSandSActive = false;
    return false;
  }

  // Spaceキー処理 (SandS対応)
  if (keyevent.key === ' ') {
    if (skk.enableSandS && !keyevent.shiftKey) {
      skk.isSandSActive = true; // 仮想シフト状態をON
      skk.keyPressedDuringSandS = false; // リセット
      return true;
    }
    // SandS無効時は通常の変換処理
    if (skk.entries.index > 2) {
      skk.entries.index += 7;
    } else {
      skk.entries.index++;
    }

    if (skk.entries.index >= skk.entries.entries.length) {
      skk.createInnerSKK();
    }
    return true;
  }

  // 物理シフト + Spaceの競合処理
  if (keyevent.key === ' ' && keyevent.shiftKey) {
    skk.isSandSActive = false;
  }

  // SandS仮想シフト処理: キーをシフト変換
  let processedKey = keyevent.key;
  let isVirtualShift = false;
  if (skk.isSandSActive && !keyevent.shiftKey) {
    processedKey = skk.getShiftedKey(keyevent.key);
    isVirtualShift = true;
    skk.keyPressedDuringSandS = true;
  }

  // シフト状態を考慮したキー処理
  const shiftApplied = isVirtualShift || keyevent.shiftKey;

  // 既存の変換モード処理 ============================================
  if (processedKey == 'x' || processedKey == 'X') {
    if (processedKey == 'x') {
      if (skk.entries.index > 9) {
        skk.entries.index -= 7;
      } else {
        skk.entries.index--;
      }
      if (skk.entries.index < 0) {
        skk.entries = null;
        skk.preedit += skk.okuriText;
        skk.okuriText = '';
        skk.okuriPrefix = '';
        skk.switchMode('preedit');
      }
    } else if (processedKey == 'X') {
      var entry = skk.entries.entries[skk.entries.index];
      skk.dictionary.removeUserEntry(skk.preedit + skk.okuriPrefix, entry.word);
      skk.entries = null;
      skk.preedit += skk.okuriText;
      skk.okuriText = '';
      skk.okuriPrefix = '';
      skk.switchMode('preedit');
    }
    return true;
  }

  if (processedKey == 'Esc' ||
      (processedKey == 'g' && keyevent.ctrlKey)) {
    skk.entries = null;
    skk.preedit += skk.okuriText;
    skk.okuriText = '';
    skk.okuriPrefix = '';
    skk.switchMode('preedit');
    return true;
  }

  if (processedKey == 'Shift') {
    // do nothing
    return true;
  }

  // 変換確定処理
  var is_commit_key = (
    processedKey == 'Enter' || (processedKey == 'j' && keyevent.ctrlKey));
  if (skk.entries.index > 2 &&
      (!keyevent.ctrlKey && !keyevent.shiftKey && !keyevent.altKey &&
        'asdfjkl'.indexOf(processedKey) >= 0)) {
    skk.entries.index += 'asdfjkl'.indexOf(processedKey);
    is_commit_key = true;
  }

  // SandS状態では確定しない
  if (!skk.isSandSActive) {
    var entry = skk.entries.entries[skk.entries.index];
    skk.commitText(entry.word + skk.okuriText);
    skk.recordNewResult(entry);
    skk.clearComposition();
    skk.entries = null;
    skk.okuriText = '';
    skk.okuriPrefix = '';
    if (processedKey == '>') {
      skk.preedit = '>';
      skk.switchMode('preedit');
    } else {
      skk.preedit = '';
      skk.switchMode('hiragana');
      if (!is_commit_key) {
        return skk.handleKeyEvent(keyevent);
      }
    }
  }

  return true;
}

SKK.registerImplicitMode('conversion', {
    keyHandler: conversionMode,
    initHandler: initConversion,
    compositionHandler: updateComposition
});
})();
// (function() {
//
// function updateComposition(skk) {
//   var entry = skk.entries.entries[skk.entries.index];
//   if (!entry) {
//     skk.clearComposition();
//   }
//
//   var preedit = '\u25bc' + entry.word;
//   if (skk.okuriText.length > 0) {
//     preedit += skk.okuriText;
//   }
//   if (entry.annotation) {
//     preedit += ';' + entry.annotation;
//   }
//   skk.setComposition(preedit, 1, {selectionStart:preedit.length,
//                                   selectionEnd:preedit.length});
// }
//
// function initConversion(skk) {
//   skk.lookup(skk.preedit + skk.okuriPrefix, function(entries) {
//     if (entries) {
//       skk.entries = {index:0, entries:entries};
//       updateComposition(skk);
//     } else {
//       skk.createInnerSKK();
//     }
//   });
// }
//
// function conversionMode(skk, keyevent) {
//   if (keyevent.key == ' ') {
//     if (skk.entries.index > 2) {
//       skk.entries.index += 7;
//     } else {
//       skk.entries.index++;
//     }
//
//     if (skk.entries.index >= skk.entries.entries.length) {
//       skk.createInnerSKK();
//     }
//   } else if (keyevent.key == 'x') {
//     if (skk.entries.index > 9) {
//       skk.entries.index -= 7;
//     } else {
//       skk.entries.index--;
//     }
//     if (skk.entries.index < 0) {
//       skk.entries = null;
//       skk.preedit += skk.okuriText;
//       skk.okuriText = '';
//       skk.okuriPrefix = '';
//       skk.switchMode('preedit');
//     }
//   } else if (keyevent.key == 'Esc' ||
//              (keyevent.key == 'g' && keyevent.ctrlKey)) {
//     skk.entries = null;
//     skk.preedit += skk.okuriText;
//     skk.okuriText = '';
//     skk.okuriPrefix = '';
//     skk.switchMode('preedit');
//   } else if (keyevent.key == 'Shift') {
//     // do nothing
//   } else if (keyevent.key == 'X') {
//     var entry = skk.entries.entries[skk.entries.index];
//     skk.dictionary.removeUserEntry(skk.preedit + skk.okuriPrefix, entry.word);
//     skk.entries = null;
//     skk.preedit += skk.okuriText;
//     skk.okuriText = '';
//     skk.okuriPrefix = '';
//     skk.switchMode('preedit');
//   } else {
//     var is_commit_key = (
//       keyevent.key == 'Enter' || (keyevent.key == 'j' && keyevent.ctrlKey));
//     if (skk.entries.index > 2 &&
//         (!keyevent.ctrlKey && !keyevent.shiftKey && !keyevent.altKey &&
//          'asdfjkl'.indexOf(keyevent.key) >= 0)) {
//       skk.entries.index += 'asdfjkl'.indexOf(keyevent.key);
//       is_commit_key = true;
//     }
//     var entry = skk.entries.entries[skk.entries.index];
//     skk.commitText(entry.word + skk.okuriText);
//     skk.recordNewResult(entry);
//     skk.clearComposition();
//     skk.entries = null;
//     skk.okuriText = '';
//     skk.okuriPrefix = '';
//     if (keyevent.key == '>') {
//       skk.preedit = '>';
//       skk.switchMode('preedit');
//     } else {
//       skk.preedit = '';
//       skk.switchMode('hiragana');
//       if (!is_commit_key) {
//         return skk.handleKeyEvent(keyevent);
//       }
//     }
//   }
//
//   return true;
// }
//
// SKK.registerImplicitMode('conversion', {
//     keyHandler: conversionMode,
//     initHandler: initConversion,
//     compositionHandler: updateComposition
// });
// })();
