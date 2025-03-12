# Power Apps Control Naming Tool

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**English** | [日本語](#power-apps-コントロール命名ツール)

## Overview

Power Apps Control Naming Tool is a web application that automatically fixes control naming and enhances properties according to Microsoft Power Apps best practices. This tool streamlines the development process by ensuring consistency in your app's naming conventions and properties.

### 🌟 Developed by Claude AI

This tool was designed and developed by Claude AI (Anthropic) to solve common Power Apps development challenges. It demonstrates how AI can be used to create practical, specialized developer tools.

## Key Features

- **Automatic Control Naming**: Renames controls following Power Apps best practices
- **Parent DataField Reference**: Uses parent card's DataField value to name child controls consistently
- **Property Enhancement**: Automatically sets DisplayMode, ContentLanguage, and other properties
- **Reference Auto-Update**: Updates all property references when control names change
- **Multilingual Support**: Supports English and Japanese interfaces
- **Dark Mode**: Includes eye-friendly dark mode

## 🔍 Parent DataField Reference Feature

The standout feature of this tool is its ability to use a parent card's DataField value to name child controls. This creates a logical naming structure that dramatically improves code readability.

For example, if a DataCard has a DataField of `"Name"`:
- `DataCardKey1` → `lblNameKey`
- `DataCardValue1` → `txtName`
- `ErrorMessage1` → `lblNameError`

This naming convention makes it much easier to understand the relationship between controls and their purpose.

## How to Use

1. **Input YAML**: Paste your Power Apps exported YAML code
2. **Adjust Settings**: Configure naming and property settings as needed
3. **Click "Fix Control Names and Properties"**: The tool processes your YAML
4. **Review Changes**: Check the change log to see what was modified
5. **Copy Modified Code**: Use the "Copy" button to get your improved code

You can also click "Test Parent DataField" to load a sample YAML with parent DataField references.

### Control Type Prefixes

The tool uses these standard 3-letter prefixes:

| Control Type | Prefix | Example |
|--------------|--------|---------|
| Label | lbl | lblUserName |
| Text Input | txt | txtEmail |
| Button | btn | btnSubmit |
| Gallery | gal | galProducts |
| Form | frm | frmMain |
| ComboBox | cmb | cmbCategory |
| CheckBox | chk | chkAccept |
| DatePicker | dte | dteStart |
| Container | con | conHeader |

## Installation

### Method 1: GitHub Pages

Access the tool directly at [Tool](https://demodorigatsuo.github.io/power-apps-rename-tool/)

### Method 2: Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/powerapps-control-naming-tool.git
   ```

2. Navigate to the project folder:
   ```bash
   cd powerapps-control-naming-tool
   ```

3. Start a local server:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Or using Node.js:
     ```bash
     npx http-server
     ```

4. Open your browser and go to:
   - http://localhost:8000 (Python) or
   - http://localhost:8080 (Node.js)

## Technical Details

- Built with HTML5, CSS3, and JavaScript (ES6+)
- Uses Tailwind CSS for styling
- Includes js-yaml library for YAML processing
- No server-side components required - runs entirely in your browser
- Maintains Power Apps-compatible YAML format

## Compatibility

- **Browsers**: Chrome (recommended), Firefox, Edge, Safari
- **Power Apps**: Compatible with Power Apps YAML export format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Naming conventions based on [Microsoft's Official Documentation](https://learn.microsoft.com/en-us/power-apps/guidance/coding-guidelines/code-readability)
- Developed by Claude AI (Anthropic) - 2025

---

# Power Apps コントロール命名ツール

![バージョン](https://img.shields.io/badge/version-1.2.0-blue)
![ライセンス](https://img.shields.io/badge/license-MIT-green)

[English](#power-apps-control-naming-tool) | **日本語**

## 概要

Power Apps コントロール命名ツールは、Microsoft Power Appsのベストプラクティスに従ってコントロールの命名を自動的に修正し、プロパティを強化するWebアプリケーションです。このツールにより、アプリのネーミング規則とプロパティの一貫性が確保され、開発プロセスが効率化されます。

### 🌟 Claude AIにより開発

このツールはAnthropicのClaude AIによって設計・開発されました。一般的なPower Apps開発の課題を解決するために作られており、AIが実用的な専門開発者ツールを作成できることを示しています。

## 主な機能

- **コントロール名の自動修正**: Power Appsのベストプラクティスに従った命名規則に修正
- **親DataField参照**: 親カードのDataField値を使用して子コントロールの名前を一貫性を持って命名
- **プロパティの自動強化**: DisplayMode、ContentLanguage、その他のプロパティを自動設定
- **参照の自動更新**: コントロール名変更時にすべての参照を自動的に更新
- **多言語対応**: 英語と日本語のインターフェースをサポート
- **ダークモード**: 目に優しいダークモードを搭載

## 🔍 親DataField参照機能

このツールの特徴的な機能は、親カードのDataField値を子コントロールの命名に活用する機能です。これにより、論理的な命名構造が作成され、コードの可読性が大幅に向上します。

例えば、DataCardのDataFieldが`"Name"`の場合：
- `DataCardKey1` → `lblNameKey`
- `DataCardValue1` → `txtName`
- `ErrorMessage1` → `lblNameError`

この命名規則により、コントロール間の関係とその目的が非常に分かりやすくなります。

## 使い方

1. **YAMLコードを入力**: Power AppsからエクスポートしたYAMLコードを貼り付けます
2. **設定を調整**: 必要に応じて命名とプロパティの設定を構成します
3. **「コントロール名とプロパティを修正する」をクリック**: ツールがYAMLを処理します
4. **変更を確認**: 変更ログで何が修正されたかを確認します
5. **修正コードをコピー**: 「コピー」ボタンを使用して改善されたコードを取得します

「親DataFieldテスト」ボタンをクリックすると、親DataField参照のサンプルYAMLを読み込むこともできます。

### コントロールタイプのプレフィックス

このツールは以下の標準的な3文字のプレフィックスを使用します：

| コントロールタイプ | プレフィックス | 例 |
|--------------|--------|---------|
| ラベル | lbl | lblUserName |
| テキスト入力 | txt | txtEmail |
| ボタン | btn | btnSubmit |
| ギャラリー | gal | galProducts |
| フォーム | frm | frmMain |
| コンボボックス | cmb | cmbCategory |
| チェックボックス | chk | chkAccept |
| 日付選択 | dte | dteStart |
| コンテナ | con | conHeader |

## インストール方法

### 方法1: GitHub Pages

以下のURLからツールに直接アクセスできます：[Tool](https://demodorigatsuo.github.io/power-apps-rename-tool/)

### 方法2: ローカルインストール

1. リポジトリをクローンします：
   ```bash
   git clone https://github.com/yourusername/powerapps-control-naming-tool.git
   ```

2. プロジェクトフォルダに移動します：
   ```bash
   cd powerapps-control-naming-tool
   ```

3. ローカルサーバーを起動します：
   - Pythonを使用する場合：
     ```bash
     python -m http.server 8000
     ```
   - Node.jsを使用する場合：
     ```bash
     npx http-server
     ```

4. ブラウザを開き、以下にアクセスします：
   - http://localhost:8000 (Python) または
   - http://localhost:8080 (Node.js)

## 技術詳細

- HTML5、CSS3、JavaScript（ES6+）で構築
- スタイリングにTailwind CSSを使用
- YAML処理にjs-yamlライブラリを使用
- サーバーサイドコンポーネントは不要 - ブラウザ内ですべて実行
- Power Apps互換のYAML形式を維持

## 互換性

- **ブラウザ**: Chrome（推奨）、Firefox、Edge、Safari
- **Power Apps**: Power Apps YAML形式と互換性あり

## ライセンス

このプロジェクトはMITライセンスのもとで公開されています - 詳細はLICENSEファイルを参照してください。

## 謝辞

- 命名規則は[Microsoft公式ドキュメント](https://learn.microsoft.com/ja-jp/power-apps/guidance/coding-guidelines/code-readability)に基づいています
- Claude AI（Anthropic）により開発 - 2025年
