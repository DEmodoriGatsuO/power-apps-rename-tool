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
            fieldName = Utils.getNameFromDataField(dataField);
        }

        // コントロールタイプのプレフィックスを取得
        const prefix = CONFIG.CONTROL_TYPE_PREFIXES[controlType] || 'ctl';

        // 新しい名前を生成
        let newName = '';
        
        // ===== ここが親DataField参照の重要な部分 =====
        // 親のTypedDataCardのデータフィールド情報を活用
        if (parentDataFieldInfo && parentDataFieldInfo.dataField) {
            const parentFieldName = Utils.getNameFromDataField(parentDataFieldInfo.dataField);
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
     * コントロールプロパティのエンハンス
     * @param {Object} properties プロパティオブジェクト
     * @param {string} controlType コントロールタイプ
     * @param {string} parentType 親コントロールのタイプ
     * @param {Object} dataFieldInfo データフィールド情報
     * @param {string} originalName 元の名前
     * @returns {Object} 修正されたプロパティと変更リスト
     */
    function enhanceProperties(properties, controlType, parentType, dataFieldInfo = null, originalName = '') {
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

        // DisplayModeを設定
        if (enableDisplayModeVal && !modifiedProperties.DisplayMode && controlType !== 'Form') {
            if (controlType === 'Button' || controlType === 'ComboBox' || controlType === 'TextInput' || controlType === 'DatePicker') {
                modifiedProperties.DisplayMode = '=If(frmMain.Mode=FormMode.View, DisplayMode.Disabled, DisplayMode.Edit)';
                changes.push('DisplayMode');
            } else if (controlType === 'Text') {
                modifiedProperties.DisplayMode = '=DisplayMode.View';
                changes.push('DisplayMode');
            }
        }

        // ContentLanguageを設定
        if (enableContentLanguageVal && !modifiedProperties.ContentLanguage) {
            if (controlType === 'Text' || controlType === 'TextInput') {
                modifiedProperties.ContentLanguage = `="${contentLanguageVal}"`;
                changes.push('ContentLanguage');
            }
        }

        // Parent.DisplayName参照を設定
        if (enableParentDisplayVal && parentType && parentType.includes('TypedDataCard')) {
            if (controlType === 'Text' && !modifiedProperties.Text) {
                modifiedProperties.Text = '=Parent.DisplayName';
                changes.push('Text (Parent.DisplayName)');
            } else if ((controlType === 'TextInput' || controlType === 'DatePicker' || controlType === 'ComboBox') && !modifiedProperties.AccessibleLabel) {
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
        
        // dataFieldInfoを使用したカードコントロールの強化
        if (useCardEnhancements && dataFieldInfo && dataFieldInfo.dataField) {
            const fieldName = Utils.getNameFromDataField(dataFieldInfo.dataField);
            
            // TypedDataCardコントロールの場合、データカード専用のプロパティを強化
            if (controlType === 'TypedDataCard') {
                // DisplayNameが存在しない場合は適切に設定
                if (!modifiedProperties.DisplayName) {
                    modifiedProperties.DisplayName = `=DataSourceInfo([@${dataSourceVal || 'Employee_Info'}],DataSourceInfo.DisplayName,'${fieldName}')`;
                    changes.push('DisplayName');
                }
                
                // フィールド名に基づいてツールチップを設定
                if (!modifiedProperties.Tooltip) {
                    modifiedProperties.Tooltip = `="Enter ${fieldName} information"`;
                    changes.push('Tooltip');
                }
                
                // 必須フィールドの場合は情報アイコンを表示
                if (!modifiedProperties.ShowInfo && dataFieldInfo.required) {
                    modifiedProperties.ShowInfo = true;
                    changes.push('ShowInfo');
                }
            }
            
            // TypedDataCard内のコントロール
            if (parentType && parentType.includes('TypedDataCard')) {
                // TextInput特有の強化
                if (controlType === 'TextInput') {
                    // ヒントテキストを設定
                    if (!modifiedProperties.HintText) {
                        modifiedProperties.HintText = `="Enter ${fieldName} here..."`;
                        changes.push('HintText');
                    }
                    
                    // 検証モードとメッセージを設定
                    if (dataFieldInfo.required && !modifiedProperties.Reset) {
                        modifiedProperties.Reset = '=true';
                        changes.push('Reset');
                        
                        if (!modifiedProperties.OnReset) {
                            modifiedProperties.OnReset = `=If(Self.Value = "", Notify("Please enter a value for ${fieldName}", NotificationType.Error))`;
                            changes.push('OnReset');
                        }
                    }
                    
                    // 検証に基づいてボーダーカラーを追加
                    if (!modifiedProperties.BorderColor) {
                        modifiedProperties.BorderColor = '=If(Parent.Error, RGBA(209, 49, 53, 1), RGBA(0, 18, 107, 1))';
                        changes.push('BorderColor');
                    }
                }
                
                // ComboBox特有の強化
                if (controlType === 'ComboBox') {
                    // プレースホルダーテキストを設定
                    if (!modifiedProperties.PlaceholderText) {
                        modifiedProperties.PlaceholderText = `="Select ${fieldName}..."`;
                        changes.push('PlaceholderText');
                    }
                    
                    // 検索ヒントテキストを設定
                    if (!modifiedProperties.SearchHintText) {
                        modifiedProperties.SearchHintText = `="Search ${fieldName}..."`;
                        changes.push('SearchHintText');
                    }
                }
                
                // DatePicker特有の強化
                if (controlType === 'DatePicker') {
                    // デフォルトの日付フォーマット
                    if (!modifiedProperties.DateTimeFormat) {
                        modifiedProperties.DateTimeFormat = '=DateTimeFormat.ShortDate';
                        changes.push('DateTimeFormat');
                    }
                    
                    // フォーマット文字列を設定
                    if (!modifiedProperties.Format) {
                        modifiedProperties.Format = '=DateTimeFormat.ShortDate';
                        changes.push('Format');
                    }
                }
                
                // バリデーションエラー用のText（Label）強化
                if (controlType === 'Text' && originalName.toLowerCase().includes('errormessage')) {
                    // エラーテキストスタイル
                    if (!modifiedProperties.Color) {
                        modifiedProperties.Color = '=RGBA(209, 49, 53, 1)';
                        changes.push('Color');
                    }
                    
                    if (!modifiedProperties.FontWeight) {
                        modifiedProperties.FontWeight = '=FontWeight.Semibold';
                        changes.push('FontWeight');
                    }
                }
                
                // 必須インディケーターのスタイリング
                if (controlType === 'Text' && originalName.toLowerCase().includes('starvisible')) {
                    // 必須星印スタイル
                    if (!modifiedProperties.Color) {
                        modifiedProperties.Color = '=RGBA(209, 49, 53, 1)';
                        changes.push('Color');
                    }
                    
                    if (!modifiedProperties.Visible && dataFieldInfo.required) {
                        modifiedProperties.Visible = '=true';
                        changes.push('Visible');
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
                                ? Utils.getNameFromDataField(dataFieldInfo.dataField) 
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
            
            // 変換済みYAMLを返す
            return {
                yaml: jsyaml.dump(finalObj),
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
            generatedNames: generatedNames,
            nameMapping: nameMapping,
            updatedReferenceMap: updatedReferenceMap
        }
    };
})();
