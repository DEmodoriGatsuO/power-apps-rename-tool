# Power Apps Control Naming Tool

Power Apps Control Naming Toolは、Power Appsのコントロール命名規則を自動的に修正し、プロパティを最適化するWebアプリケーションです。

## 主な機能

- **コントロール名の自動修正**: Power Appsのベストプラクティスに従ったコントロール名に修正
- **親DataField参照**: 親カードのDataField値を子コントロールの命名に活用
- **プロパティの自動最適化**: DisplayMode、ContentLanguage、Parent.DisplayNameなどを自動設定
- **参照の自動更新**: コントロール名変更時にすべての参照を自動的に更新
- **多言語対応**: 英語と日本語のインターフェースをサポート
- **ダークモード**: 目に優しいダークモードをサポート

## 使い方

1. **YAMLコードを入力**: Power AppsからエクスポートしたYAMLコードを貼り付けます
2. **設定を調整**: 必要に応じて各種設定を調整します
3. **「Fix Control Names and Properties」ボタンをクリック**: コントロール名とプロパティが修正されます
4. **変更ログを確認**: 変更内容を変更ログで確認できます
5. **修正されたコードをコピー**: 「Copy」ボタンで修正されたコードをコピーできます

## 親DataField参照機能

このツールの特徴的な機能として、親カードコントロールのDataField値を子コントロールの命名に活用する機能があります。この機能により、データカード内の子コントロールが親フィールドの名前を継承し、一貫性のある命名が実現します。

例えば、DataCardのDataFieldが`"Name"`の場合：
- `DataCardKey1` → `lblNameKey`
- `DataCardValue1` → `txtName`
- `ErrorMessage1` → `lblNameError`

この命名規則によって、コードの可読性が大幅に向上します。

## クイックテスト

「Test Parent DataField」ボタンをクリックすると、親DataField参照機能のサンプルYAMLが読み込まれ、すぐにテストできます。

## デバッグモード

開発者向けに、デバッグモードを提供しています：
- URLに`?debug=true`パラメータを追加
- または、キーボードショートカット `Alt+Shift+D` でデバッグパネルを表示

## その他の機能

- **エラーハンドリング**: エラー発生時に適切なエラーメッセージを表示
- **フォールバックUI**: メインUIが読み込めない場合のフォールバックインターフェース
- **ローカルストレージ**: 言語、テーマ、最後の入力を保存

## ベストプラクティス

このツールは、以下のPower Appsのベストプラクティスに基づいています：

1. **命名規則**:
   - コントロール名にはキャメルケースを使用
   - 3文字のタイプ記述子で始め、その後に目的を記述（例: `lblUserName`）
   - 非ASCII文字を避ける

2. **コントロールタイプの略語**:
   - ラベル: `lbl`
   - テキスト入力: `txt`
   - ボタン: `btn`
   - ギャラリー: `gal`
   - フォーム: `frm`
   - コンボボックス: `cmb`
   - チェックボックス: `chk`
   - 日付選択: `dte`

## 技術スタック

- HTML5 / CSS3
- JavaScript (ES6+)
- Tailwind CSS
- js-yaml ライブラリ

## ブラウザ互換性

- Google Chrome (推奨)
- Mozilla Firefox
- Microsoft Edge
- Safari

## 注意事項

- このツールはPower Appsの公式ツールではありません
- 大きなYAMLファイルの処理には時間がかかる場合があります
- 処理前に常にコードのバックアップを取ることをお勧めします

---

© 2025 Power Apps Control Naming Tool
