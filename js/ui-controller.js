/**
 * Power Apps Control Naming Tool - UIコントローラー
 * ユーザーインターフェース要素のイベント処理と状態管理
 */

const UIController = (function() {
    // UIのDOM要素参照を保持
    let elements = {};
    
    /**
     * 変換ボタンのクリックイベントハンドラー
     */
    function handleConvertClick() {
        if (!elements.inputYaml || !elements.outputYaml) {
            Utils.showError('UI要素が見つかりません。ページを再読み込みしてください。');
            return;
        }
        
        const inputText = elements.inputYaml.value.trim();
        if (!inputText) {
            Utils.showError(Utils.getCurrentLanguage() === 'en' 
                ? 'Please enter YAML code.' 
                : 'YAMLコードを入力してください。');
            return;
        }
        
        // 処理状態を表示
        if (elements.convertBtn) {
            elements.convertBtn.disabled = true;
            elements.convertBtn.classList.add('opacity-50');
            elements.convertBtn.textContent = Utils.getCurrentLanguage() === 'en' 
                ? 'Processing...' 
                : '処理中...';
        }
        
        elements.outputYaml.textContent = Utils.getCurrentLanguage() === 'en' 
            ? 'Processing, please wait...' 
            : '処理中です、しばらくお待ちください...';
        
        // ローディングオーバーレイを表示
        Utils.toggleLoading(true);
        
        // 入力をローカルストレージに保存
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.LAST_INPUT, inputText);
        
        // 非同期で処理（UI凍結を防止）
        setTimeout(() => {
            try {
                const result = YAMLProcessor.processYaml(inputText);
                elements.outputYaml.textContent = result.yaml;
                
                // 変更ログを表示
                updateChangeLog(result.changeLog, result.updatedReferenceMap);
                
                // 処理成功メッセージをログに記録
                Utils.logDebug('YAMLの処理が完了しました。変換された項目数:', result.changeLog.length);
            } catch (error) {
                Utils.logError('処理エラー:', error);
                elements.outputYaml.textContent = Utils.getCurrentLanguage() === 'en'
                    ? `An error occurred during processing: ${error.message}`
                    : `処理中にエラーが発生しました: ${error.message}`;
                    
                Utils.showError(error.message);
            } finally {
                // ボタンの状態を復元
                if (elements.convertBtn) {
                    elements.convertBtn.disabled = false;
                    elements.convertBtn.classList.remove('opacity-50');
                    elements.convertBtn.textContent = Utils.getCurrentLanguage() === 'en' 
                        ? 'Fix Control Names and Properties' 
                        : 'コントロール名とプロパティを修正する';
                }
                
                // ローディングオーバーレイを非表示
                Utils.toggleLoading(false);
            }
        }, 100);
    }
    
    /**
     * コピーボタンのクリックイベントハンドラー
     */
    function handleCopyClick() {
        if (!elements.outputYaml) {
            Utils.showError('出力要素が見つかりません。');
            return;
        }
        
        if (!elements.outputYaml.textContent) {
            Utils.showError(Utils.getCurrentLanguage() === 'en' 
                ? 'Please fix control names first.' 
                : 'まずコントロール名を修正してください。');
            return;
        }
        
        Utils.copyToClipboard(elements.outputYaml.textContent)
            .then(success => {
                if (!success || !elements.copyBtn) return;
                
                const originalText = elements.copyBtn.textContent;
                elements.copyBtn.textContent = Utils.getCurrentLanguage() === 'en' ? 'Copied!' : 'コピー完了!';
                elements.copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'dark:bg-green-700', 'dark:hover:bg-green-600');
                elements.copyBtn.classList.add('bg-green-500', 'dark:bg-green-600');
                
                setTimeout(() => {
                    elements.copyBtn.textContent = originalText;
                    elements.copyBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'dark:bg-green-700', 'dark:hover:bg-green-600');
                    elements.copyBtn.classList.remove('bg-green-500', 'dark:bg-green-600');
                }, 2000);
            })
            .catch(err => {
                Utils.logError('クリップボードへのコピーに失敗しました:', err);
                Utils.showError(Utils.getCurrentLanguage() === 'en' ? 'Copy failed.' : 'コピーに失敗しました。');
            });
    }
    
    /**
     * クリアボタンのクリックイベントハンドラー
     */
    function handleClearClick() {
        if (elements.inputYaml) elements.inputYaml.value = '';
        if (elements.outputYaml) elements.outputYaml.textContent = '';
        if (elements.changelogContainer) elements.changelogContainer.classList.add('hidden');
        
        // ローカルストレージから最後の入力を削除
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.LAST_INPUT, '');
    }
    
    /**
     * サンプル読み込みボタンのクリックイベントハンドラー
     */
    function handleLoadSampleClick() {
        if (elements.inputYaml) {
            elements.inputYaml.value = CONFIG.SAMPLE_YAML;
        }
    }
    
    /**
     * 親DataFieldテストボタンのクリックイベントハンドラー
     */
    function handleTestDataFieldClick() {
        if (elements.inputYaml) {
            elements.inputYaml.value = CONFIG.PARENT_DATAFIELD_TEST_YAML;
            
            // 変換ボタンのクリックをシミュレート
            if (elements.convertBtn) {
                setTimeout(() => elements.convertBtn.click(), 100);
            }
        }
    }
    
    /**
     * 言語選択変更イベントハンドラー
     */
    function handleLanguageChange() {
        if (elements.languageSelect) {
            Utils.updateLanguage(elements.languageSelect.value);
        }
    }
    
    /**
     * テーマ切り替えボタンのクリックイベントハンドラー
     */
    function handleThemeToggleClick() {
        Utils.toggleTheme();
    }
    
    /**
     * 設定カードのクリックイベントハンドラー
     * @param {string} id カードのID
     */
    function setupSettingCardHandler(id) {
        const card = document.getElementById(id);
        if (card) {
            card.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            });
        }
    }
    
    /**
     * 変更ログを更新
     * @param {Array} changeLog 変更ログ
     * @param {Object} updatedReferenceMap 更新された参照マップ
     */
    function updateChangeLog(changeLog, updatedReferenceMap) {
        if (!elements.changelogBody || !elements.changelogContainer) {
            Utils.logError('変更ログDOM要素が見つかりません');
            return;
        }
        
        elements.changelogBody.innerHTML = '';
        
        if (changeLog.length === 0) {
            elements.changelogContainer.classList.add('hidden');
            return;
        }
        
        elements.changelogContainer.classList.remove('hidden');
        
        // 参照更新サマリーを作成
        const referenceUpdates = {};
        const enableRefUpdate = document.getElementById('enableReferenceUpdate');
        const enableRefUpdateVal = enableRefUpdate ? enableRefUpdate.checked : false;
        
        if (enableRefUpdateVal) {
            for (const [oldName, newName] of Object.entries(YAMLProcessor._internals.nameMapping)) {
                // このコントロールを参照しているプロパティを探す
                const referencingProps = [];
                Object.entries(updatedReferenceMap).forEach(([propExpr, updates]) => {
                    if (updates.includes(oldName)) {
                        referencingProps.push(propExpr);
                    }
                });
                
                if (referencingProps.length > 0) {
                    referenceUpdates[oldName] = {
                        newName: newName,
                        references: referencingProps
                    };
                }
            }
        }
        
        // 変更ログテーブルに入力
        changeLog.forEach(change => {
            const row = document.createElement('tr');
            
            // 元の名前
            const originalCell = document.createElement('td');
            originalCell.className = 'py-2 px-4 border-b border-gray-200 dark:border-gray-700';
            originalCell.textContent = change.original;
            row.appendChild(originalCell);
            
            // 新しい名前
            const fixedCell = document.createElement('td');
            fixedCell.className = 'py-2 px-4 border-b border-gray-200 dark:border-gray-700 font-mono text-green-600 dark:text-green-400';
            fixedCell.textContent = change.fixed;
            row.appendChild(fixedCell);
            
            // コントロールタイプ
            const typeCell = document.createElement('td');
            typeCell.className = 'py-2 px-4 border-b border-gray-200 dark:border-gray-700';
            typeCell.textContent = change.type;
            row.appendChild(typeCell);
            
            // 親DataField
            const parentDataFieldCell = document.createElement('td');
            parentDataFieldCell.className = 'py-2 px-4 border-b border-gray-200 dark:border-gray-700';
            if (change.parentDataField) {
                parentDataFieldCell.textContent = change.parentDataField;
                parentDataFieldCell.classList.add('parent-datafield');
            } else {
                parentDataFieldCell.textContent = '—';
            }
            row.appendChild(parentDataFieldCell);
            
            // 更新された参照
            const refCell = document.createElement('td');
            refCell.className = 'py-2 px-4 border-b border-gray-200 dark:border-gray-700';
            
            // 参照更新が無効の場合は警告を表示
            if (!enableRefUpdateVal) {
                if (Object.keys(YAMLProcessor._internals.nameMapping).length > 0) {
                    const warningText = document.createElement('span');
                    warningText.textContent = Utils.getCurrentLanguage() === 'en' 
                        ? "Reference update disabled" 
                        : "参照更新が無効です";
                    warningText.className = 'text-yellow-600 dark:text-yellow-400';
                    refCell.appendChild(warningText);
                } else {
                    refCell.textContent = '—';
                }
            }
            // 参照更新情報を表示
            else if (referenceUpdates[change.original]) {
                const refInfo = referenceUpdates[change.original];
                const refCount = refInfo.references.length;
                
                if (refCount > 0) {
                    refCell.className += ' text-blue-600 dark:text-blue-400';
                    
                    // ツールチップを作成
                    const tooltip = document.createElement('div');
                    tooltip.className = 'relative group cursor-pointer tooltip-trigger';
                    
                    // 参照数
                    const refText = document.createElement('span');
                    refText.textContent = Utils.getCurrentLanguage() === 'en' 
                        ? `${refCount} references updated` 
                        : `${refCount}箇所の参照を更新`;
                    refText.className = 'underline';
                    tooltip.appendChild(refText);
                    
                    // ツールチップの内容
                    const tooltipContent = document.createElement('div');
                    tooltipContent.className = 'tooltip-content';
                    
                    // 最大3つまでの参照を表示
                    const samplesToShow = Math.min(3, refCount);
                    const samples = refInfo.references.slice(0, samplesToShow);
                    
                    samples.forEach((ref, idx) => {
                        const refItem = document.createElement('div');
                        refItem.className = 'mb-1 text-xs';
                        refItem.textContent = ref;
                        tooltipContent.appendChild(refItem);
                        
                        // 最後のサンプル以外の場合は区切り線を追加
                        if (idx < samplesToShow - 1) {
                            const divider = document.createElement('hr');
                            divider.className = 'border-gray-600 my-1';
                            tooltipContent.appendChild(divider);
                        }
                    });
                    
                    // 残りの参照数を表示
                    if (refCount > samplesToShow) {
                        const moreInfo = document.createElement('div');
                        moreInfo.className = 'mt-1 text-gray-300 italic text-xs';
                        moreInfo.textContent = Utils.getCurrentLanguage() === 'en' 
                            ? `${refCount - samplesToShow} more...` 
                            : `他 ${refCount - samplesToShow} 箇所...`;
                        tooltipContent.appendChild(moreInfo);
                    }
                    
                    tooltip.appendChild(tooltipContent);
                    refCell.appendChild(tooltip);
                } else {
                    refCell.textContent = '—';
                }
            } else {
                refCell.textContent = '—';
            }
            
            row.appendChild(refCell);
            elements.changelogBody.appendChild(row);
        });
        
        // 変更ログを表示するアニメーション
        elements.changelogContainer.classList.add('fade-in');
    }
    
    /**
     * フォールバックUIのイベントハンドラーを設定
     */
    function setupFallbackHandlers() {
        const fallbackInput = document.getElementById('fallbackInput');
        const fallbackOutput = document.getElementById('fallbackOutput');
        const fallbackConvertBtn = document.getElementById('fallbackConvertBtn');
        const fallbackCopyBtn = document.getElementById('fallbackCopyBtn');
        const fallbackReloadBtn = document.getElementById('fallbackReloadBtn');
        
        if (fallbackConvertBtn && fallbackInput && fallbackOutput) {
            fallbackConvertBtn.addEventListener('click', function() {
                try {
                    const inputText = fallbackInput.value.trim();
                    if (!inputText) {
                        alert('YAMLコードを入力してください。');
                        return;
                    }
                    
                    // YAMLを処理
                    if (typeof YAMLProcessor !== 'undefined' && YAMLProcessor.processYaml) {
                        const result = YAMLProcessor.processYaml(inputText);
                        fallbackOutput.value = result.yaml;
                    } else {
                        // YAMLProcessorが利用できない場合のフォールバック
                        fallbackOutput.value = "YAMLプロセッサーを読み込めませんでした。\n原文をそのまま表示します:\n\n" + inputText;
                    }
                } catch (e) {
                    alert('エラーが発生しました: ' + e.message);
                    console.error(e);
                }
            });
        }
        
        if (fallbackCopyBtn && fallbackOutput) {
            fallbackCopyBtn.addEventListener('click', function() {
                if (!fallbackOutput.value.trim()) {
                    alert('コピーする内容がありません。');
                    return;
                }
                
                try {
                    fallbackOutput.select();
                    document.execCommand('copy');
                    
                    const originalText = fallbackCopyBtn.textContent;
                    fallbackCopyBtn.textContent = 'コピー完了!';
                    
                    setTimeout(() => {
                        fallbackCopyBtn.textContent = originalText;
                    }, 2000);
                } catch (e) {
                    alert('コピーに失敗しました: ' + e.message);
                    console.error(e);
                }
            });
        }
        
        if (fallbackReloadBtn) {
            fallbackReloadBtn.addEventListener('click', function() {
                window.location.reload();
            });
        }
    }
    
    /**
     * UI要素の参照を初期化し、イベントリスナーを設定
     */
    function init() {
        try {
            // DOM要素の参照を取得
            elements = {
                inputYaml: document.getElementById('inputYaml'),
                outputYaml: document.getElementById('outputYaml'),
                convertBtn: document.getElementById('convertBtn'),
                copyBtn: document.getElementById('copyBtn'),
                clearBtn: document.getElementById('clearBtn'),
                loadSampleBtn: document.getElementById('loadSampleBtn'),
                testDataFieldBtn: document.getElementById('testDataFieldBtn'),
                changelogContainer: document.getElementById('changelogContainer'),
                changelogBody: document.getElementById('changelogBody'),
                languageSelect: document.getElementById('languageSelect'),
                themeToggle: document.getElementById('themeToggle'),
                appLoader: document.getElementById('appLoader')
            };
            
            // 必須要素のチェック
            const missingElements = [];
            for (const [key, element] of Object.entries(elements)) {
                if (!element) {
                    missingElements.push(key);
                }
            }
            
            if (missingElements.length > 0) {
                Utils.logError('必須UI要素が見つかりません:', missingElements);
                // 致命的ではないエラーの場合は警告のみ
                if (!elements.inputYaml || !elements.outputYaml || !elements.convertBtn) {
                    throw new Error('アプリケーションに必要な重要なUI要素が見つかりません。');
                }
            }
            
            // イベントリスナーを設定
            if (elements.convertBtn) {
                elements.convertBtn.addEventListener('click', handleConvertClick);
            }
            
            if (elements.copyBtn) {
                elements.copyBtn.addEventListener('click', handleCopyClick);
            }
            
            if (elements.clearBtn) {
                elements.clearBtn.addEventListener('click', handleClearClick);
            }
            
            if (elements.loadSampleBtn) {
                elements.loadSampleBtn.addEventListener('click', handleLoadSampleClick);
            }
            
            if (elements.testDataFieldBtn) {
                elements.testDataFieldBtn.addEventListener('click', handleTestDataFieldClick);
            }
            
            if (elements.languageSelect) {
                elements.languageSelect.addEventListener('change', handleLanguageChange);
            }
            
            if (elements.themeToggle) {
                elements.themeToggle.addEventListener('click', handleThemeToggleClick);
            }
            
            // 設定カードのイベントハンドラーを設定
            setupSettingCardHandler('settingDisplayMode');
            setupSettingCardHandler('settingContentLanguage');
            setupSettingCardHandler('settingParentDisplay');
            setupSettingCardHandler('settingReferenceUpdate');
            setupSettingCardHandler('settingEnhancedCardProps');
            setupSettingCardHandler('settingDataSource');
            
            // フォールバックUIのイベントハンドラーを設定
            setupFallbackHandlers();
            
            Utils.logDebug('UIコントローラーが初期化されました');
            
            // ローディング画面を非表示
            if (elements.appLoader) {
                setTimeout(() => {
                    elements.appLoader.style.opacity = '0';
                    setTimeout(() => {
                        elements.appLoader.classList.add('hidden');
                    }, 500);
                }, 500);
            }
            
            return true;
        } catch (error) {
            Utils.logError('UIコントローラーの初期化中にエラーが発生しました:', error);
            Utils.showFallbackUI('UIの初期化に失敗しました: ' + error.message);
            return false;
        }
    }
    
    // パブリックAPI
    return {
        init: init,
        elements: elements,
        updateChangeLog: updateChangeLog
    };
})();
