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
        console.log("必須リソースのチェック中...");
        
        // YAML ライブラリが読み込まれているか確認
        if (typeof jsyaml === 'undefined') {
            console.error('YAMLライブラリ (js-yaml) が見つかりません');
            app.errors.push('YAMLライブラリ (js-yaml) の読み込みに失敗しました。');
            app.yamlLibAvailable = false;
            return false;
        } else {
            console.log('YAMLライブラリ (js-yaml) が正常に読み込まれました');
            app.yamlLibAvailable = true;
        }
        
        // スタイルシートが適用されているか確認
        const styleSheets = Array.from(document.styleSheets);
        if (styleSheets.length === 0) {
            console.warn('スタイルシートが読み込まれていない可能性があります。');
        }
        
        return true;
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
            console.error('グローバルエラー:', event.message, 'at', event.filename, 'line', event.lineno);
            
            // 深刻なエラーの場合はユーザーに通知
            if (event.error && (event.error.name === 'ReferenceError' || event.error.name === 'TypeError')) {
                // スネークバーでエラーを表示
                const errorSnackbar = document.getElementById('errorSnackbar');
                if (errorSnackbar) {
                    errorSnackbar.textContent = 'アプリケーションエラー: ' + event.message;
                    errorSnackbar.classList.remove('hidden');
                    setTimeout(() => {
                        errorSnackbar.classList.add('hidden');
                    }, 5000);
                }
            }
            
            // AppLoaderが表示されたままになるのを防ぐ
            const appLoader = document.getElementById('appLoader');
            if (appLoader && !appLoader.classList.contains('hidden')) {
                appLoader.classList.add('hidden');
            }
        });
        
        // 未処理のPromiseエラー
        window.addEventListener('unhandledrejection', function(event) {
            console.error('未処理のPromiseエラー:', event.reason);
        });
    }
    
    /**
     * ユーザーにエラーを通知し、フォールバックUIをアクティブ化
     */
    function handleInitializationErrors() {
        if (app.errors.length === 0) return;
        
        const errorMessage = app.errors.join(' ');
        console.error('初期化エラー:', errorMessage);
        
        // スネークバーでエラーを表示
        const errorSnackbar = document.getElementById('errorSnackbar');
        if (errorSnackbar) {
            errorSnackbar.textContent = errorMessage;
            errorSnackbar.classList.remove('hidden');
            setTimeout(() => {
                errorSnackbar.classList.add('hidden');
            }, 5000);
        }
        
        // YAML処理が必要なものだけフォールバックUIに切り替え
        if (!app.yamlLibAvailable) {
            // フォールバックUI表示
            const fallbackUI = document.getElementById('fallbackUI');
            const mainContent = document.getElementById('mainContent');
            
            if (fallbackUI) {
                fallbackUI.classList.remove('hidden');
                
                // メインコンテンツを非表示
                if (mainContent) {
                    mainContent.style.display = 'none';
                }
                
                console.log('フォールバックUIを表示しました');
                
                // フォールバックのボタンにイベントを追加
                const fallbackReloadBtn = document.getElementById('fallbackReloadBtn');
                if (fallbackReloadBtn) {
                    fallbackReloadBtn.addEventListener('click', function() {
                        window.location.reload();
                    });
                }
            } else {
                // フォールバックUIも表示できない場合はアラート表示
                alert('アプリケーションの初期化中にエラーが発生しました: ' + errorMessage + '\nページを再読み込みしてください。');
            }
        }
    }
    
    /**
     * アプリケーションを初期化
     */
    function initializeApp() {
        try {
            // ブラウザの互換性チェック
            if (!checkBrowserCompatibility()) {
                throw new Error('ブラウザの互換性がありません');
            }
            
            // エラーハンドラーを設定
            setupErrorHandlers();
            
            // 必須リソースのチェック
            checkRequiredResources();
            
            // 保存された設定を適用
            if (typeof Utils !== 'undefined') {
                Utils.applyStoredPreferences();
            } else {
                console.warn('Utilsが見つかりません。設定の適用をスキップします。');
            }
            
            // UIコントローラーを初期化
            if (typeof UIController !== 'undefined') {
                if (!UIController.init()) {
                    console.warn('UIコントローラーの初期化に失敗しました');
                }
            } else {
                console.warn('UIControllerが見つかりません');
            }
            
            // アプリケーションが正常に初期化されたことを記録
            app.initialized = true;
            console.log(`アプリケーションが初期化されました (バージョン: ${CONFIG ? CONFIG.VERSION : 'unknown'})`);
            
            // ローダーを非表示
            const appLoader = document.getElementById('appLoader');
            if (appLoader) {
                setTimeout(() => {
                    appLoader.style.opacity = '0';
                    setTimeout(() => {
                        appLoader.classList.add('hidden');
                    }, 500);
                }, 500);
            }
            
            // エラーがあれば処理
            if (app.errors.length > 0) {
                handleInitializationErrors();
            }
            
        } catch (error) {
            app.errors.push(error.message);
            console.error('アプリケーションの初期化中にエラーが発生しました:', error);
            handleInitializationErrors();
        }
    }
    
    // DOMContentLoaded時にアプリケーションを初期化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM読み込み完了、アプリケーション初期化中...');
        // 非同期でアプリケーションを初期化
        setTimeout(initializeApp, 100);
    });
    
    // ページ完全読み込み時のフォールバック
    window.addEventListener('load', function() {
        console.log('ページ完全読み込み完了');
        
        // DOMContentLoadedで初期化されなかった場合のフォールバック
        if (!app.initialized) {
            console.warn('DOMContentLoadedでの初期化に失敗したため、ページロード時に再試行します');
            initializeApp();
        }
        
        // AppLoaderが長時間表示されたままになるのを防ぐ
        setTimeout(function() {
            const appLoader = document.getElementById('appLoader');
            if (appLoader && !appLoader.classList.contains('hidden')) {
                console.warn('AppLoaderが長時間表示されたままのため、強制的に非表示にします');
                appLoader.classList.add('hidden');
            }
        }, 5000);
    });
})();