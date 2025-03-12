/**
 * Power Apps Control Naming Tool - 設定ファイル
 * アプリケーション全体で使用される定数や設定値を定義
 */

const CONFIG = {
    // アプリケーションバージョン
    VERSION: '1.2.0',
    
    // デバッグモード (本番環境では無効化されます)
    DEBUG: false,
    
    // デフォルト言語
    DEFAULT_LANGUAGE: 'en',
    
    // コントロールタイプのプレフィックスマッピング (キャメルケース形式)
    CONTROL_TYPE_PREFIXES: {
        'Form': 'frm',
        'TypedDataCard': 'crd',
        'Text': 'lbl',
        'TextInput': 'txt',
        'ComboBox': 'cmb',
        'DatePicker': 'dte',
        'Button': 'btn',
        'Image': 'img',
        'Gallery': 'gal',
        'Canvas': 'can',
        'Icon': 'ico',
        'Rectangle': 'shp',
        'CheckBox': 'chk',
        'RadioButton': 'rad',
        'Slider': 'sld',
        'Toggle': 'tgl',
        'Timer': 'tmr',
        'List': 'lst',
        'HTML': 'htm',
        'PCF': 'pcf',
        'Container': 'con',
        'Card': 'crd'
    },
    
    // サンプルYAML（親DataField参照テスト用）
    SAMPLE_YAML: `- Form1:
    Control: Form@2.4.2
    Layout: Vertical
    Properties:
      BorderColor: =RGBA(0, 18, 107, 1)
      DataSource: =Employee_Info
      X: =40
      Y: =40
    Children:
      - Name_DataCard1:
          Control: TypedDataCard@1.0.6
          Variant: TextualEdit
          IsLocked: true
          Properties:
            BorderColor: =RGBA(0, 18, 107, 1)
            DataField: ="Name"
            Default: =ThisItem.Name
            DisplayName: =DataSourceInfo([@Employee_Info],DataSourceInfo.DisplayName,'Name')
            MaxLength: =DataSourceInfo([@Employee_Info], DataSourceInfo.MaxLength, 'Name')
            Required: =true
            Update: =DataCardValue1.Value
            Width: =266
            Y: =0
          Children:
            - DataCardKey1:
                Control: Text@0.0.50
                Properties:
                  Height: =22
                  Text: =Parent.DisplayName
                  Weight: ='TextCanvas.Weight'.Semibold
                  Width: =Parent.Width - 48
                  Wrap: =false
                  X: =24
                  Y: =10
            - DataCardValue1:
                Control: TextInput@0.0.53
                Properties:
                  AccessibleLabel: =Parent.DisplayName
                  DisplayMode: =Parent.DisplayMode
                  Mode: ="'TextInputCanvas.Mode'.TextInputModeSingleLine"
                  Required: =Parent.Required
                  ValidationState: =If(IsBlank(Parent.Error), "None", "Error")
                  Value: =Parent.Default
                  Width: =Parent.Width - 48
                  X: =24
                  Y: =DataCardKey1.Y + DataCardKey1.Height + 4`,
    
    // 親DataField参照テスト用サンプル
    PARENT_DATAFIELD_TEST_YAML: `- Form1:
    Control: Form@2.4.2
    Properties:
      DataSource: =Employee_Info
    Children:
      - EmployeeData_Card:
          Control: TypedDataCard@1.0.6
          Properties:
            DataField: ="EmployeeData"
            Required: =true
          Children:
            - DataCardKey1:
                Control: Text@0.0.50
                Properties:
                  Text: ="Key"
            - DataCardValue1:
                Control: TextInput@0.0.53
                Properties:
                  Value: =""
      - PhoneNumber_Card:
          Control: TypedDataCard@1.0.6
          Properties:
            DataField: ="PhoneNumber"
            Required: =false
          Children:
            - DataCardKey2:
                Control: Text@0.0.50
                Properties:
                  Text: ="Phone"
            - DataCardValue2:
                Control: TextInput@0.0.53
                Properties:
                  Value: =""`,
    
    // ローカルストレージキー
    STORAGE_KEYS: {
        THEME: 'powerAppsNamingTool_theme',
        LANGUAGE: 'powerAppsNamingTool_language',
        LAST_INPUT: 'powerAppsNamingTool_lastInput',
    },
    
    // UIサポート言語
    SUPPORTED_LANGUAGES: ['en', 'ja'],
    
    // エラースネークバー表示時間(ms)
    SNACKBAR_TIMEOUT: 5000,
};
