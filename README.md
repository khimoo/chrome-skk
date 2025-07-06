# chrome-skk
An SKK implementation for ChromeOS IME API.

Chrome OS用SKK IME

# Fork元
このレポジトリは [hkurokawa/chrome-skk](https://github.com/hkurokawa/chrome-skk) をフォークしたものです。

# 変更点
SandSモードを実装しました。現在はhiraganaモードでのみ正常に動作します。

# インストール方法
1. Releaseページから`chrome-skk-vx.xx.xx.zip`をダウンロードして解凍する
1. Chromeで`chrome://extensions`を開き、**Load Unpacked**をクリックして先程解凍したフォルダを指定する

# 設定方法
1. インストールされた拡張機能を右クリックして**options**をクリック
1. 辞書ファイルのURLを入力し、適宜圧縮形式や文字エンコードも選択する（例：`https://skk-dev.github.io/dict/SKK-JISYO.S.gz`）
1. **reload**ボタンをクリック
1. IMEをクリックして設定アイコンをクリック
1. **Add input methods**をクリックして、使っているキーボードレイアウトに合わせてSKKを選択する(例: `SKK(for Japanese keyboard)`)
1. IMEをSKKに切り替える
1. Happy SKK!
