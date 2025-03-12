/**
 * Power Apps Control Naming Tool - アプリケーション初期化
 * アプリケーションのエントリーポイントとなるメインスクリプト
 */

// アプリケーションの初期化を行う自己実行関数
(function() {
    // アプリケーションの状態
    const app = {
        initialized: false,
        yamlLibAvailable: false,
        errors: []
    };
    
    /**
     * 必須リソースが読み込まれているか確認
     */
    function checkRequiredResources() {
        // YAML ライブラリが読み込まれているか確認
        if (typeof jsyaml === 'undefined') {
            app.errors.push('YAMLライブラリ (js-yaml) の読み込みに失敗しました。');
            app.yamlLibAvailable = false;
            return false;
        } else {
            app.yamlLibAvailable = true;
        }
        
        // スタイルシートが適用されているか確認
        const styleSheets = Array.from(document.styleSheets);
        if (styleSheets.length === 0) {
            Utils.logWarn('スタイルシートが読み込まれていない可能性があります。');
        }
        
        return true;
    }
    
    /**
     * YAMLライブラリが利用できない場合のフォールバック
     */
    function loadYamlLibrary() {
        return new Promise((resolve, reject) => {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
                script.integrity = 'sha512-CSBhVREyzHAjAFfBlIBakwHYSuULfUHwx5sGzOOXZmujE/2Ne11BBYpuGCqlVoKiVXbH8VBkLlqY85iQk3mhiw==';
                script.crossOrigin = 'anonymous';
                script.referrerPolicy = 'no-referrer';
                
                script.onload = function() {
                    Utils.logDebug('YAMLライブラリを動的に読み込みました');
                    app.yamlLibAvailable = true;
                    resolve(true);
                };
                
                script.onerror = function(e) {
                    Utils.logError('YAMLライブラリの動的読み込みに失敗しました:', e);
                    reject(new Error('YAMLライブラリの読み込みに失敗しました'));
                };
                
                document.body.appendChild(script);
            } catch (e) {
                Utils.logError('動的スクリプト読み込み中にエラーが発生しました:', e);
                reject(e);
            }
        });
    }
    
    /**
     * ブラウザ環境が互換性があるか確認
     */
    function checkBrowserCompatibility() {
        // 最低限必要なAPIをチェック
        const requiredApis = [
            'Promise' in window,
            'querySelector' in document,
            'addEventListener' in window,
            'localStorage' in window,
            'Array.prototype.map',
            'Array.prototype.filter',
            'Array.prototype.forEach'
        ];
        
        const allApisAvailable = requiredApis.every(Boolean);
        
        if (!allApisAvailable) {
            app.errors.push('お使いのブラウザはこのアプリケーションをサポートしていません。最新のブラウザにアップデートしてください。');
            return false;
        }
        
        return true;
    }
    
    /**
     * グローバルエラーハンドラーを設定
     */
    function setupErrorHandlers() {
        // 未キャッチエラー
        window.addEventListener('error', function(event) {
            Utils.logError('グローバルエラー:', event.message, 'at', event.filename, 'line', event.lineno);
            
            // 深刻なエラーの場合はユーザーに通知
            if (event.error && (event.error.name === 'ReferenceError' || event.error.name === 'TypeError')) {
                Utils.showError('アプリケーションエラー: ' + event.message);
            }
            
            // AppLoaderが表示されたままになるのを防ぐ
            const appLoader = document.getElementById('appLoader');
            if (appLoader && !appLoader.classList.contains('hidden')) {
                appLoader.classList.add('hidden');
            }
        });
        
        // 未処理のPromiseエラー
        window.addEventListener('unhandledrejection', function(event) {
            Utils.logError('未処理のPromiseエラー:', event.reason);
        });
    }
    
    /**
     * ユーザーにエラーを通知し、フォールバックUIをアクティブ化
     */
    function handleInitializationErrors() {
        if (app.errors.length === 0) return;
        
        const errorMessage = app.errors.join(' ');
        Utils.logError('初期化エラー:', errorMessage);
        
        // フォールバックUI表示
        Utils.showFallbackUI(errorMessage);
        
        // フォールバックUIが表示されなかった場合はアラート表示
        const fallbackUI = document.getElementById('fallbackUI');
        if (!fallbackUI || fallbackUI.classList.contains('hidden')) {
            alert('アプリケーションの初期化中にエラーが発生しました: ' + errorMessage);
        }
    }
    
    /**
     * アプリケーションを初期化
     */
    async function initializeApp() {
        try {
            // ブラウザの互換性チェック
            if (!checkBrowserCompatibility()) {
                throw new Error('ブラウザの互換性がありません');
            }
            
            // エラーハンドラーを設定
            setupErrorHandlers();
            
            // 必須リソースのチェック
            if (!checkRequiredResources()) {
                // YAMLライブラリが読み込まれていない場合は再度読み込みを試みる
                if (!app.yamlLibAvailable) {
                    try {
                        await loadYamlLibrary();
                    } catch (e) {
                        throw new Error('YAMLライブラリの読み込みに失敗しました。ネットワーク接続を確認してください。');
                    }
                }
            }
            
            // 保存された設定を適用
            Utils.applyStoredPreferences();
            
            // UIコントローラーを初期化
            if (!UIController.init()) {
                throw new Error('UIコントローラーの初期化に失敗しました');
            }
            
            // アプリケーションが正常に初期化されたことを記録
            app.initialized = true;
            Utils.logDebug(`アプリケーションが正常に初期化されました (バージョン: ${CONFIG.VERSION})`);
            
            // URLパラメータを処理（将来の拡張用）
            processUrlParameters();
            
        } catch (error) {
            app.errors.push(error.message);
            Utils.logError('アプリケーションの初期化中にエラーが発生しました:', error);
            handleInitializationErrors();
        }
    }
    
    /**
     * URLパラメータを処理（将来の拡張用）
     */
    function processUrlParameters() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            
            // デバッグモードパラメータ
            if (urlParams.has('debug') && urlParams.get('debug') === 'true') {
                CONFIG.DEBUG = true;
                Utils.logDebug('デバッグモードが有効化されました');
                
                // デバッグパネルを表示
                const debugPanel = document.getElementById('debugPanel');
                if (debugPanel) {
                    debugPanel.classList.remove('hidden');
                }
            }
            
            // 言語パラメータ
            if (urlParams.has('lang')) {
                const lang = urlParams.get('lang');
                if (CONFIG.SUPPORTED_LANGUAGES.includes(lang)) {
                    Utils.updateLanguage(lang);
                    Utils.logDebug(`言語がパラメータから設定されました: ${lang}`);
                }
            }
            
            // テーマパラメータ
            if (urlParams.has('theme')) {
                const theme = urlParams.get('theme');
                if (theme === 'dark' || theme === 'light') {
                    Utils.setTheme(theme);
                    Utils.logDebug(`テーマがパラメータから設定されました: ${theme}`);
                }
            }
            
            // サンプルYAMLを自動読み込み
            if (urlParams.has('sample') && urlParams.get('sample') === 'true') {
                const loadSampleBtn = document.getElementById('loadSampleBtn');
                if (loadSampleBtn) {
                    setTimeout(() => loadSampleBtn.click(), 500);
                }
            }
            
            // 親DataFieldテストを自動実行
            if (urlParams.has('test-parent-datafield') && urlParams.get('test-parent-datafield') === 'true') {
                const testDataFieldBtn = document.getElementById('testDataFieldBtn');
                if (testDataFieldBtn) {
                    setTimeout(() => testDataFieldBtn.click(), 500);
                }
            }
            
        } catch (e) {
            Utils.logError('URLパラメータの処理中にエラーが発生しました:', e);
        }
    }
    
    // DOMContentLoaded時にアプリケーションを初期化
    document.addEventListener('DOMContentLoaded', function() {
        // 非同期でアプリケーションを初期化
        setTimeout(initializeApp, 100);
    });
    
    // ページ完全読み込み時のフォールバック
    window.addEventListener('load', function() {
        // DOMContentLoadedで初期化されなかった場合のフォールバック
        if (!app.initialized) {
            Utils.logWarn('DOMContentLoadedでの初期化に失敗したため、ページロード時に再試行します');
            initializeApp();
        }
        
        // AppLoaderが長時間表示されたままになるのを防ぐ
        setTimeout(function() {
            const appLoader = document.getElementById('appLoader');
            if (appLoader && !appLoader.classList.contains('hidden')) {
                Utils.logWarn('AppLoaderが長時間表示されたままのため、強制的に非表示にします');
                appLoader.classList.add('hidden');
            }
        }, 5000);
    });
})();
