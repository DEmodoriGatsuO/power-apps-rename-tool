/**
 * Power Apps Control Naming Tool - YAMLプロセッサ
 * YAML処理の中心機能を提供
 */

const YAMLProcessor = (function() {
    // プライベート変数
    const generatedNames = new Set();
    const nameMapping = {};
    const updatedReferenceMap = {};
    
    /**
     * 文字列が有効なPower FX式かどうかを確認
     * @param {string} value 検証する値
     * @returns {boolean} Power FX式かどうか
     */
    function isPowerFxExpression(value) {
        if (typeof value !== 'string') return false;
        return value.trim().startsWith('=');
    }
    
    /**
     * 値がPower FX式であることを確認し、必要ならば '=' を先頭に追加
     * @param {string} value 検証する値
     * @param {boolean} isExpression 式として扱うべきかどうか
     * @returns {string} 正規化された値
     */
    function normalizePowerFxExpression(value, isExpression) {
        if (typeof value !== 'string') return value;
        
        value = value.trim();
        if (isExpression) {
            // 式として扱うべき値が '=' で始まっていない場合、追加する
            if (!value.startsWith('=')) {
                return '=' + value;
            }
        } else {
            // 式でない値が '=' で始まっている場合、必要に応じて文字列としてエスケープ
            if (value.startsWith('=') && value !== '=true' && value !== '=false') {
                // Power Apps では文字列として扱いたい場合は ="文字列" という形式にする
                if (!value.startsWith('="') && !value.startsWith("='")) {
                    return '="' + value.substring(1) + '"';
                }
            }
        }
        return value;
    }

    /**
     * 制御名を修正（親のDataFieldを参照）
     * @param {string} originalName 元の名前
     * @param {string} controlType コントロールタイプ
     * @param {string} dataField データフィールド
     * @param {string} parentType 親コントロールのタイプ
     * @param {string} screenName 画面名
     * @param {Object} parentDataFieldInfo 親データフィールド情報
     * @returns {string} 修正された名前
     */
    function fixControlName(originalName, controlType, dataField, parentType, screenName = '', parentDataFieldInfo = null) {
        // 末尾の数字を削除
        let baseName = originalName.replace(/\d+$/, '');
        
        // データフィールドから名前を取得
        let fieldName = '';
        if (dataField) {
            fieldName = getNameFromDataField(dataField);
        }

        // コントロールタイプのプレフィックスを取得
        const prefix = CONFIG.CONTROL_TYPE_PREFIXES[controlType] || 'ctl';

        // 新しい名前を生成
        let newName = '';
        
        // ===== ここが親DataField参照の重要な部分 =====
        // 親のTypedDataCardのデータフィールド情報を活用
        if (parentDataFieldInfo && parentDataFieldInfo.dataField) {
            const parentFieldName = getNameFromDataField(parentDataFieldInfo.dataField);
            Utils.logDebug('親のDataField検出:', parentFieldName, 'for', originalName);
            
            // 特定の子コントロール専用の命名規則
            if (parentType && parentType.includes('TypedDataCard')) {
                if (controlType === 'Text' && baseName.includes('DataCardKey')) {
                    newName = `lbl${parentFieldName}Key`;
                } else if (controlType === 'TextInput' && baseName.includes('DataCardValue')) {
                    newName = `txt${parentFieldName}`;
                } else if (controlType === 'Text' && baseName.includes('ErrorMessage')) {
                    newName = `lbl${parentFieldName}Error`;
                } else if (controlType === 'Text' && baseName.includes('StarVisible')) {
                    newName = `lbl${parentFieldName}Required`;
                } else if (controlType === 'DatePicker' && baseName.includes('DataCardValue')) {
                    newName = `dte${parentFieldName}`;
                } else if (controlType === 'ComboBox' && baseName.includes('DataCardValue')) {
                    newName = `cmb${parentFieldName}`;
                } else if (controlType === 'CheckBox' && baseName.includes('DataCardValue')) {
                    newName = `chk${parentFieldName}`;
                } else {
                    // その他のコントロール
                    newName = `${prefix}${parentFieldName}`;
                }
            }
        }
        // ============================================
        
        // まだ名前が生成されていない場合（親DataField参照が適用されなかった場合）
        if (!newName) {
            // TypedDataCard
            if (controlType === 'TypedDataCard' && fieldName) {
                newName = `crd${fieldName}`;
            }
            // Form
            else if (controlType === 'Form' && originalName.includes('Form')) {
                newName = `frmMain`;
            }
            // 一般的な場合: プレフィックス + 意味のある名前
            else if (fieldName) {
                newName = `${prefix}${fieldName}`;
            }
            // デフォルトのフォールバック
            else {
                newName = `${prefix}${Utils.toPascalCase(baseName)}`;
            }
        }
        
        // 提供されている場合は画面名のサフィックスを追加
        if (screenName && controlType !== 'Form') {
            const screenSuffix = screenName.replace(/Screen$/, '').replace(/[^a-zA-Z0-9]/g, '');
            newName = `${newName}${screenSuffix}`;
        }
        
        // 名前の一意性を確保
        let uniqueName = newName;
        let counter = 1;
        
        while (generatedNames.has(uniqueName.toLowerCase())) {
            uniqueName = `${newName}${counter}`;
            counter++;
        }
        
        // 追跡セットに追加
        generatedNames.add(uniqueName.toLowerCase());
        
        // 参照更新のために名前マッピングを記録
        if (originalName !== uniqueName) {
            nameMapping[originalName] = uniqueName;
        }
        
        return uniqueName;
    }

    /**
     * データフィールド式から名前を抽出
     * @param {string} dataField データフィールド式
     * @returns {string} クリーンな名前
     */
    function getNameFromDataField(dataField) {
        if (!dataField) return '';
        
        // "=", "'", and """ 文字を削除
        let cleanField = dataField.replace(/[="']/g, '');
        
        // 先頭の空白を削除
        return cleanField.trim();
    }

    /**
     * コントロールプロパティのエンハンス
     * @param {Object} properties プロパティオブジェクト
     * @param {string} controlType コントロールタイプ
     * @param {string} parentType 親コントロールのタイプ
     * @param {Object} dataFieldInfo データフィールド情報
     * @param {string} originalName 元の名前
     * @returns {Object} 修正されたプロパティと変更リスト
     */
    function enhanceProperties(properties, controlType, parentType, dataFieldInfo = null, originalName = '') {
        // 元のプロパティを変更せず、新しいオブジェクトにコピー
        const modifiedProperties = { ...properties };
        const changes = [];
        
        // DOM要素の参照を取得
        const enableDisplayMode = document.getElementById('enableDisplayMode');
        const enableContentLanguage = document.getElementById('enableContentLanguage');
        const enableParentDisplay = document.getElementById('enableParentDisplay');
        const contentLanguageValue = document.getElementById('contentLanguageValue');
        const enableCardEnhancement = document.getElementById('enableCardEnhancement');
        const enableDataSourceFix = document.getElementById('enableDataSourceFix');
        const dataSourceName = document.getElementById('dataSourceName');
        
        // 値を安全に取得
        const enableDisplayModeVal = enableDisplayMode ? enableDisplayMode.checked : false;
        const enableContentLanguageVal = enableContentLanguage ? enableContentLanguage.checked : false;
        const enableParentDisplayVal = enableParentDisplay ? enableParentDisplay.checked : false;
        const contentLanguageVal = contentLanguageValue ? contentLanguageValue.value : 'en';
        const useCardEnhancements = enableCardEnhancement ? enableCardEnhancement.checked : false;
        const useDataSourceFix = enableDataSourceFix ? enableDataSourceFix.checked : false;
        const dataSourceVal = dataSourceName ? dataSourceName.value : 'Employee_Info';

        // 既存のプロパティのみを修正するためのフラグ
        const modifyExistingOnly = true;  // 将来的にUIで切り替え可能にする場合はここを変更

        // DisplayModeを設定 (既存のプロパティのみ修正)
        if (enableDisplayModeVal && modifiedProperties.hasOwnProperty('DisplayMode') && controlType !== 'Form') {
            if (controlType === 'Button' || controlType === 'ComboBox' || controlType === 'TextInput' || controlType === 'DatePicker') {
                modifiedProperties.DisplayMode = '=If(frmMain.Mode=FormMode.View, DisplayMode.Disabled, DisplayMode.Edit)';
                changes.push('DisplayMode');
            } else if (controlType === 'Text') {
                modifiedProperties.DisplayMode = '=DisplayMode.View';
                changes.push('DisplayMode');
            }
        }

        // ContentLanguageを設定 (既存のプロパティのみ修正)
        if (enableContentLanguageVal && modifiedProperties.hasOwnProperty('ContentLanguage')) {
            if (controlType === 'Text' || controlType === 'TextInput') {
                modifiedProperties.ContentLanguage = `="${contentLanguageVal}"`;
                changes.push('ContentLanguage');
            }
        }

        // Parent.DisplayName参照を設定 (既存のプロパティのみ修正)
        if (enableParentDisplayVal && parentType && parentType.includes('TypedDataCard')) {
            if (controlType === 'Text' && modifiedProperties.hasOwnProperty('Text')) {
                modifiedProperties.Text = '=Parent.DisplayName';
                changes.push('Text (Parent.DisplayName)');
            } else if ((controlType === 'TextInput' || controlType === 'DatePicker' || controlType === 'ComboBox') && 
                        modifiedProperties.hasOwnProperty('AccessibleLabel')) {
                modifiedProperties.AccessibleLabel = '=Parent.DisplayName';
                changes.push('AccessibleLabel');
            }
        }
        
        // DataSource参照を修正（有効な場合）
        if (useDataSourceFix && dataSourceVal) {
            // DataSource参照を含む可能性のあるプロパティを探す
            const dataSourceProps = ['DataSource', 'Default', 'DisplayName', 'Items', 'MaxLength'];
            for (const prop of dataSourceProps) {
                if (modifiedProperties[prop] && typeof modifiedProperties[prop] === 'string') {
                    const original = modifiedProperties[prop];
                    const updated = original.replace(/\[@([a-zA-Z0-9_]+)\]/g, `[@${dataSourceVal}]`);
                    if (original !== updated) {
                        modifiedProperties[prop] = updated;
                        changes.push(`${prop} (DataSource)`);
                    }
                }
            }
        }
        
        // カードコントロール強化 (既存のプロパティのみを修正)
        if (useCardEnhancements && !modifyExistingOnly && dataFieldInfo && dataFieldInfo.dataField) {
            const fieldName = getNameFromDataField(dataFieldInfo.dataField);
            
            // TypedDataCardコントロールの場合、データカード専用のプロパティを強化
            if (controlType === 'TypedDataCard') {
                // DisplayNameが存在する場合のみ修正
                if (modifiedProperties.hasOwnProperty('DisplayName')) {
                    modifiedProperties.DisplayName = `=DataSourceInfo([@${dataSourceVal || 'Employee_Info'}],DataSourceInfo.DisplayName,'${fieldName}')`;
                    changes.push('DisplayName');
                }
                
                // プロパティの追加は行わない（既存のプロパティだけを修正）
            }
            
            // TypedDataCard内のコントロール
            if (parentType && parentType.includes('TypedDataCard')) {
                // 既存のプロパティのみを修正
                for (const prop in modifiedProperties) {
                    if (prop === 'HintText' && controlType === 'TextInput') {
                        modifiedProperties[prop] = `="Enter ${fieldName} here..."`;
                        changes.push('HintText');
                    } else if (prop === 'PlaceholderText' && controlType === 'ComboBox') {
                        modifiedProperties[prop] = `="Select ${fieldName}..."`;
                        changes.push('PlaceholderText');
                    } else if (prop === 'SearchHintText' && controlType === 'ComboBox') {
                        modifiedProperties[prop] = `="Search ${fieldName}..."`;
                        changes.push('SearchHintText');
                    } else if (prop === 'DateTimeFormat' && controlType === 'DatePicker') {
                        modifiedProperties[prop] = '=DateTimeFormat.ShortDate';
                        changes.push('DateTimeFormat');
                    } else if (prop === 'Format' && controlType === 'DatePicker') {
                        modifiedProperties[prop] = '=DateTimeFormat.ShortDate';
                        changes.push('Format');
                    }
                }
            }
        }

        return { properties: modifiedProperties, changes };
    }

    /**
     * プロパティ参照を名前の変更に対応するよう更新
     */
    function updateReferences(propertyValue, nameMapping) {
        if (typeof propertyValue !== 'string') return propertyValue;
        
        // プロパティが式かどうかをチェック（=で始まる）
        if (!propertyValue.startsWith('=')) return propertyValue;
        
        let updatedValue = propertyValue;
        let wasUpdated = false;
        let updatedParts = [];
        
        // 名前マッピングの各エントリに対して参照を更新
        for (const [oldName, newName] of Object.entries(nameMapping)) {
            // ControlName.Property パターン
            const dotRegex = new RegExp(`([^a-zA-Z0-9_]|^)${oldName}\\.`, 'g');
            if (dotRegex.test(updatedValue)) {
                wasUpdated = true;
                updatedParts.push(`${oldName}.* → ${newName}.*`);
            }
            updatedValue = updatedValue.replace(dotRegex, `$1${newName}.`);
            
            // スタンドアロンのコントロール名パターン
            const wordRegex = new RegExp(`([^a-zA-Z0-9_]|^)${oldName}([^a-zA-Z0-9_]|$)`, 'g');
            if (wordRegex.test(updatedValue)) {
                wasUpdated = true;
                updatedParts.push(`${oldName} → ${newName}`);
            }
            updatedValue = updatedValue.replace(wordRegex, `$1${newName}$2`);
        }
        
        // DataSource参照の更新（有効な場合）
        const enableDataSourceFix = document.getElementById('enableDataSourceFix');
        const dataSourceName = document.getElementById('dataSourceName');
        
        if (enableDataSourceFix && enableDataSourceFix.checked && dataSourceName && dataSourceName.value) {
            const standardizedDataSource = dataSourceName.value;
            // [@SomeName]のようなDataSource参照を探す
            const dataSourceRegex = /\[@([a-zA-Z0-9_]+)\]/g;
            const matches = updatedValue.match(dataSourceRegex);
            
            if (matches) {
                for (const match of matches) {
                    if (match !== `[@${standardizedDataSource}]`) {
                        wasUpdated = true;
                        updatedParts.push(`${match} → [@${standardizedDataSource}]`);
                        updatedValue = updatedValue.replace(match, `[@${standardizedDataSource}]`);
                    }
                }
            }
        }
        
        // 更新があった場合は記録
        if (wasUpdated) {
            // 長いプロパティ用の短縮表示バージョン
            const shortPropertyValue = propertyValue.length > 30 
                ? propertyValue.substring(0, 27) + '...' 
                : propertyValue;
            updatedReferenceMap[shortPropertyValue] = updatedParts.join(', ');
        }
        
        return updatedValue;
    }

    /**
     * YAMLオブジェクトのノードを再帰的に処理
     */
    function processNode(node, parentType, changeLog, screenName = '', parentDataFieldInfo = null) {
        if (Array.isArray(node)) {
            return node.map(item => processNode(item, parentType, changeLog, screenName, parentDataFieldInfo));
        } else if (typeof node === 'object' && node !== null) {
            const result = {};
            
            // まず画面名を検出
            let currentScreenName = screenName;
            for (const [key, value] of Object.entries(node)) {
                if (typeof value === 'object' && value !== null && key.toLowerCase().includes('screen')) {
                    currentScreenName = key;
                    break;
                }
            }
            
            // 各プロパティを処理
            for (const [key, value] of Object.entries(node)) {
                // コントロール定義
                if (typeof value === 'object' && value !== null && value.Control) {
                    const controlType = value.Control.split('@')[0];
                    const dataField = value.Properties && value.Properties.DataField;
                    
                    // データフィールド情報を作成して子に渡す
                    let dataFieldInfo = null;
                    if (controlType === 'TypedDataCard' && dataField) {
                        dataFieldInfo = {
                            dataField: dataField,
                            displayName: value.Properties && value.Properties.DisplayName,
                            required: value.Properties && (
                                value.Properties.Required === true || 
                                value.Properties.Required === 'true' || 
                                value.Properties.Required === '=true'
                            ),
                            default: value.Properties && value.Properties.Default,
                            maxLength: value.Properties && value.Properties.MaxLength,
                            // 子コントロールが必要とする可能性のあるフィールドに関する追加メタデータ
                            controlType: controlType,
                            originalName: key // 元の名前も保存
                        };
                        
                        Utils.logDebug('データカード情報作成:', key, dataFieldInfo.dataField);
                    } else {
                        // 親のデータフィールド情報を継承
                        dataFieldInfo = parentDataFieldInfo;
                    }
                    
                    // 新しいコントロール名を生成
                    const newKey = fixControlName(
                        key, 
                        controlType, 
                        dataField, 
                        parentType, 
                        currentScreenName, 
                        dataFieldInfo
                    );
                    
                    // プロパティを処理
                    const processedValue = { ...value };
                    const propertyChanges = [];
                    
                    if (processedValue.Properties) {
                        const enhancedProps = enhanceProperties(
                            processedValue.Properties, 
                            controlType, 
                            parentType, 
                            dataFieldInfo,
                            key // コンテキスト用の元の名前
                        );
                        processedValue.Properties = enhancedProps.properties;
                        propertyChanges.push(...enhancedProps.changes);
                    }
                    
                    // 変更を記録
                    if (key !== newKey || propertyChanges.length > 0) {
                        changeLog.push({
                            original: key,
                            fixed: newKey,
                            type: controlType,
                            propertyChanges: propertyChanges.join(', '),
                            parentDataField: dataFieldInfo && dataFieldInfo.dataField 
                                ? getNameFromDataField(dataFieldInfo.dataField) 
                                : ''
                        });
                    }
                    
                    // 子を再帰的に処理（データフィールド情報を子に渡す）
                    if (processedValue.Children) {
                        processedValue.Children = processNode(
                            processedValue.Children, 
                            controlType, 
                            changeLog, 
                            currentScreenName, 
                            dataFieldInfo
                        );
                    }
                    
                    result[newKey] = processedValue;
                } else {
                    // その他のプロパティはそのまま
                    result[key] = processNode(value, parentType, changeLog, currentScreenName, parentDataFieldInfo);
                }
            }
            
            return result;
        }
        
        return node;
    }

    /**
     * 処理されたYAMLのプロパティ参照を更新
     */
    function updatePropertyReferences(node) {
        if (Array.isArray(node)) {
            return node.map(item => updatePropertyReferences(item));
        } else if (typeof node === 'object' && node !== null) {
            const result = {};
            
            for (const [key, value] of Object.entries(node)) {
                if (key === 'Properties' && typeof value === 'object' && value !== null) {
                    // プロパティ参照を更新
                    const updatedProperties = {};
                    for (const [propKey, propValue] of Object.entries(value)) {
                        updatedProperties[propKey] = updateReferences(propValue, nameMapping);
                    }
                    result[key] = updatedProperties;
                } else if (typeof value === 'object' && value !== null) {
                    // ネストされたオブジェクトを処理
                    result[key] = updatePropertyReferences(value);
                } else {
                    result[key] = value;
                }
            }
            
            return result;
        }
        
        return node;
    }

    /**
     * Power FX式内のシングルクオーテーションを正しく処理する
     * @param {string} yamlString YAML文字列
     * @returns {string} 修正されたYAML文字列
     */
    function fixPowerFxQuotes(yamlString) {
        if (typeof yamlString !== 'string') return yamlString;

        // 行単位で処理
        const lines = yamlString.split('\n');
        const fixedLines = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Power FX式を含む行を検出（=で始まるプロパティ値）
            if (line.match(/:\s*(['"]?)=(.*?)(\1)$/)) {
                // 最初に、Power FX式の引用符を削除（例: '=expr' → =expr）
                line = line.replace(/:\s*(['"]?)=(.*?)\1$/, ': =$2');
                
                // 次に、式内の特殊な引用符パターンを処理
                // 例: ='TextCanvas.Weight'.Semibold や =DataSourceInfo(...,'Name')
                
                // パターン1: 'Namespace.Member' アクセス
                // 例: ='TextCanvas.Weight'.Semibold
                if (line.includes("='") && line.includes("'.")) {
                    // 引用符が既に適切な形式になっているので、そのまま維持
                }
                
                // パターン2: 関数呼び出し内の文字列パラメータ
                // 例: =DataSourceInfo([@Employee_Info],DataSourceInfo.DisplayName,'Name')
                else if (line.includes("='") || line.includes("',")) {
                    // 引用符が既に適切な形式になっているので、そのまま維持
                }
                
                // その他のPower FX式
                else {
                    // 必要に応じて他のパターンも処理
                }
                
                fixedLines.push(line);
            } else {
                // Power FX式でない行はそのまま維持
                fixedLines.push(line);
            }
        }

        return fixedLines.join('\n');
    }

    /**
     * YAMLのダンプオプションをカスタマイズ
     */
    function customYamlDump(obj) {
        try {
            // jsyaml.dumpのカスタムオプション
            const options = {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
                noCompatMode: true,
                condenseFlow: false,
                flowLevel: -1,
                styles: {},
                schema: jsyaml.DEFAULT_FULL_SCHEMA
            };
            
            // YAMLを文字列に変換（元のオブジェクトをクローン）
            const objCopy = JSON.parse(JSON.stringify(obj));
            
            // Power FX式を事前に処理（シングルクオーテーションを保護）
            preprocessPowerFxExpressions(objCopy);
            
            // 処理済みオブジェクトをYAMLにダンプ
            let yamlStr = jsyaml.dump(objCopy, options);
            
            // 通常の修正処理
            yamlStr = yamlStr.replace(/'(=.*?)'/g, '$1');
            yamlStr = yamlStr.replace(/'(true|false)'/g, '$1');
            
            // YAMLの構造を保持しながら、Power FX式の周りの不要な引用符を削除
            const lines = yamlStr.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // '=' で始まる値から引用符を削除
                if (line.includes(': \'=')) {
                    lines[i] = line.replace(/: '(=.*?)'$/, ': $1');
                    
                    // __QUOTE__ プレースホルダーを元のシングルクォーテーションに戻す
                    lines[i] = lines[i].replace(/__QUOTE__/g, "'");
                }
            }
            
            // 最終的な修正（残りのプレースホルダーを置換）
            yamlStr = lines.join('\n').replace(/__QUOTE__/g, "'");
            
            // Power FX式内のシングルクォーテーションを修正
            yamlStr = fixPowerFxQuotes(yamlStr);
            
            return yamlStr;
        } catch (error) {
            console.error('YAML変換中にエラーが発生しました:', error);
            // エラーが発生した場合は元のYAMLダンプを使用
            return jsyaml.dump(obj);
        }
    }

    /**
     * オブジェクト内のPower FX式をダンプ前に事前処理する
     * @param {Object} obj 処理するオブジェクト
     */
    function preprocessPowerFxExpressions(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        
        if (Array.isArray(obj)) {
            // 配列の各要素を処理
            for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'string' && obj[i].startsWith('=')) {
                    // Power FX式内のシングルクォーテーションを一時的にエスケープ
                    obj[i] = obj[i].replace(/'/g, '__QUOTE__');
                } else if (typeof obj[i] === 'object' && obj[i] !== null) {
                    preprocessPowerFxExpressions(obj[i]);
                }
            }
        } else {
            // オブジェクトの各プロパティを処理
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].startsWith('=')) {
                    // Power FX式内のシングルクォーテーションを一時的にエスケープ
                    obj[key] = obj[key].replace(/'/g, '__QUOTE__');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    preprocessPowerFxExpressions(obj[key]);
                }
            }
        }
    }

    /**
     * YAMLを処理して制御名とプロパティを修正
     */
    function processYaml(yamlStr) {
        try {
            // トラッキングデータをクリア
            generatedNames.clear();
            Object.keys(nameMapping).forEach(key => delete nameMapping[key]);
            Object.keys(updatedReferenceMap).forEach(key => delete updatedReferenceMap[key]);
            
            // js-yamlライブラリが利用可能かチェック
            if (typeof jsyaml === 'undefined') {
                throw new Error('YAMLライブラリ（js-yaml）が利用できません。インターネット接続を確認し、ページを再読み込みしてください。');
            }
            
            // YAMLをパース
            const yamlObj = jsyaml.load(yamlStr);
            
            if (!yamlObj) {
                throw new Error('YAMLを解析できませんでした。入力の形式を確認してください。');
            }
            
            const changeLog = [];
            
            // 制御名を修正
            const processedObj = processNode(yamlObj, null, changeLog);
            
            // 参照の更新（有効な場合）
            let finalObj = processedObj;
            const enableRefUpdate = document.getElementById('enableReferenceUpdate');
            
            if (enableRefUpdate && enableRefUpdate.checked) {
                finalObj = updatePropertyReferences(processedObj);
            }
            
            // カスタムYAMLダンプを使用して出力
            const outputYaml = customYamlDump(finalObj);
            
            // 変換済みYAMLを返す
            return {
                yaml: outputYaml,
                changeLog: changeLog,
                nameMapping: nameMapping,
                updatedReferenceMap: updatedReferenceMap
            };
        } catch (e) {
            Utils.logError('YAML処理エラー:', e);
            throw e;
        }
    }

    // パブリックAPI
    return {
        processYaml: processYaml,
        
        // デバッグやテスト用に内部関数を公開
        _internals: {
            fixControlName: fixControlName,
            enhanceProperties: enhanceProperties,
            updateReferences: updateReferences,
            isPowerFxExpression: isPowerFxExpression,
            normalizePowerFxExpression: normalizePowerFxExpression,
            getNameFromDataField: getNameFromDataField,
            fixPowerFxQuotes: fixPowerFxQuotes,
            generatedNames: generatedNames,
            nameMapping: nameMapping,
            updatedReferenceMap: updatedReferenceMap
        }
    };
})();