# Power Apps Control Converter

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A modern web application that converts Power Apps classic controls to modern controls, preserving functionality while embracing the latest Power Apps features.

## Overview

Power Apps Control Converter is a specialized tool designed to help Power Apps developers easily migrate their classic controls to modern equivalents. The tool processes YAML source code from classic controls and transforms it into the corresponding modern control format, handling all the necessary property mappings and adding required modern properties.

## Key Features

- **Intuitive Interface**: A clean, modern UI with light and dark themes
- **YAML Conversion**: Accurately converts Power Apps-specific YAML format
- **Control Type Support**: Handles multiple control types including Label, Button, TextInput, and more
- **Property Mapping**: Intelligently maps properties between classic and modern controls
- **Detailed Logging**: Provides transparent conversion steps with detailed logs
- **Customizable Mappings**: Export and import mapping configurations
- **Responsive Design**: Works on desktop and mobile devices

## Supported Control Conversions

| Classic Control | Modern Control |
|-----------------|----------------|
| Label@2.5.1 | Text@0.0.50 |
| Classic/TextInput@2.3.2 | TextInput@0.0.53 |
| Classic/Button@2.2.0 | Button@0.0.44 |
| Classic/DropDown@2.3.1 | DropDown@0.0.44 |
| Classic/ComboBox@2.4.0 | ComboBox@0.0.49 |
| Classic/DatePicker@2.6.0 | DatePicker@0.0.42 |
| Classic/CheckBox@2.1.0 | CheckBox@0.0.27 |
| Classic/Radio@2.3.0 | Radio@0.0.24 |
| Classic/Toggle@2.1.0 | Toggle@1.1.4 |
| Classic/Slider@2.1.0 | Slider@1.0.31 |

## How to Use

1. Open the application in your web browser
2. Paste your Power Apps classic control YAML in the left input area
3. Click the "Convert" button to transform it to the modern control format
4. Review the conversion output and log details
5. Use "Copy" to copy the result to your clipboard or "Download" to save as a file

## Conversion Process

The converter handles several important aspects of the migration process:

1. **Control Type Mapping**: Maps classic control types to their modern equivalents
2. **Property Mapping**: Transforms properties from classic format to modern format
3. **Default Property Addition**: Adds required properties for modern controls that don't exist in classic controls
4. **Formula Expression Preservation**: Carefully maintains Power Apps formula expressions
5. **Reference Updates**: Updates all property references when control names change

## Technical Implementation

The converter consists of three main components:

1. **YAML Parser**: Specialized to handle Power Apps' unique YAML format, including formula expressions and control references
2. **Control Converter**: Implements the mapping logic between classic and modern controls
3. **User Interface**: Provides an intuitive interface for performing conversions

## Extending the Tool

You can extend the tool to support additional control types or customize property mappings:

1. Access the settings section
2. Export current mappings
3. Modify the JSON file to add or change mappings
4. Import your custom mappings

Custom mappings are saved in your browser's local storage for future use.

## Installation

### Method 1: GitHub Pages

Access the tool directly at [Tool](https://demodorigatsuo.github.io/power-apps-rename-tool/)

### Method 2: Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/powerapps-control-converter.git
   ```

2. Navigate to the project folder:
   ```bash
   cd powerapps-control-converter
   ```

3. Open index.html in your browser or start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

## Project Structure

- `index.html` - Main HTML file
- `css/styles.css` - Stylesheet with light/dark theme support
- `js/app.js` - Main application logic
- `js/parser.js` - YAML parsing functionality
- `js/converter.js` - Conversion logic for control types and properties

## License

MIT

## Disclaimer

=======
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