/**
 * Power Apps Control Naming Tool - デバッグツール
 * 開発とトラブルシューティングに役立つデバッグ機能
 */

const DebugTools = (function() {
    // デバッグ状態
    let debugEnabled = CONFIG.DEBUG;
    
    /**
     * デバッグパネルを初期化
     */
    function init() {
        if (!debugEnabled) return;
        
        const debugPanel = document.getElementById('debugPanel');
        const closeDebugBtn = document.getElementById('closeDebugBtn');
        
        if (debugPanel && closeDebugBtn) {
            // クローズボタンのイベントハンドラー
            closeDebugBtn.addEventListener('click', function() {
                debugPanel.classList.add('hidden');
            });
            
            // 初期メッセージを表示
            logToPanel('info', 'デバッグパネルが初期化されました');
            logToPanel('info', `アプリケーションバージョン: ${CONFIG.VERSION}`);
            logToPanel('info', `User Agent: ${navigator.userAgent}`);
            
            // コマンドボタンを追加
            addDebugCommands();
            
            // Escキーでパネルを閉じる
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && !debugPanel.classList.contains('hidden')) {
                    debugPanel.classList.add('hidden');
                }
            });
            
            // Alt+D でパネルを表示
            document.addEventListener('keydown', function(e) {
                if (e.altKey && e.key === 'd') {
                    debugPanel.classList.toggle('hidden');
                }
            });
        }
        
        // デバッグトグルボタンを追加
        addDebugToggle();
    }
    
    /**
     * デバッグパネルにログを追加
     * @param {string} type ログの種類 (log, error, warn, info)
     * @param {string} message メッセージ
     */
    function logToPanel(type, message) {
        if (!debugEnabled) return;
        
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
            const logEl = document.createElement('div');
            logEl.className = `log ${type}`;
            logEl.textContent = `[${timestamp}] ${message}`;
            debugOutput.appendChild(logEl);
            
            // 自動スクロール
            debugOutput.scrollTop = debugOutput.scrollHeight;
            
            // 過去のログを制限（最大100件）
            if (debugOutput.children.length > 100) {
                debugOutput.removeChild(debugOutput.children[0]);
            }
        }
    }
    
    /**
     * デバッグコマンドボタンをパネルに追加
     */
    function addDebugCommands() {
        const debugOutput = document.getElementById('debugOutput');
        if (!debugOutput) return;
        
        // コマンドコンテナを作成
        const commandsContainer = document.createElement('div');
        commandsContainer.className = 'mt-2 mb-4 flex flex-wrap gap-2';
        
        // 環境チェックボタン
        const checkEnvBtn = document.createElement('button');
        checkEnvBtn.textContent = '環境チェック';
        checkEnvBtn.className = 'px-2 py-1 bg-gray-700 text-white text-xs rounded';
        checkEnvBtn.addEventListener('click', checkEnvironment);
        commandsContainer.appendChild(checkEnvBtn);
        
        // DOM検証ボタン
        const checkDomBtn = document.createElement('button');
        checkDomBtn.textContent = 'DOM検証';
        checkDomBtn.className = 'px-2 py-1 bg-gray-700 text-white text-xs rounded';
        checkDomBtn.addEventListener('click', validateDOM);
        commandsContainer.appendChild(checkDomBtn);
        
        // クリアログボタン
        const clearLogBtn = document.createElement('button');
        clearLogBtn.textContent = 'ログクリア';
        clearLogBtn.className = 'px-2 py-1 bg-gray-700 text-white text-xs rounded';
        clearLogBtn.addEventListener('click', function() {
            debugOutput.innerHTML = '';
            logToPanel('info', 'ログをクリアしました');
        });
        commandsContainer.appendChild(clearLogBtn);
        
        // テストYAMLボタン
        const testYamlBtn = document.createElement('button');
        testYamlBtn.textContent = '親DataFieldテスト';
        testYamlBtn.className = 'px-2 py-1 bg-purple-700 text-white text-xs rounded';
        testYamlBtn.addEventListener('click', function() {
            const testDataFieldBtn = document.getElementById('testDataFieldBtn');
            if (testDataFieldBtn) {
                testDataFieldBtn.click();
                logToPanel('info', '親DataFieldテストを実行しました');
            } else {
                logToPanel('error', 'テストボタンが見つかりません');
            }
        });
        commandsContainer.appendChild(testYamlBtn);
        
        // スタイル診断ボタン
        const checkStylesBtn = document.createElement('button');
        checkStylesBtn.textContent = 'スタイル診断';
        checkStylesBtn.className = 'px-2 py-1 bg-gray-700 text-white text-xs rounded';
        checkStylesBtn.addEventListener('click', diagnoseStyles);
        commandsContainer.appendChild(checkStylesBtn);
        
        // フォールバックUIテストボタン
        const testFallbackBtn = document.createElement('button');
        testFallbackBtn.textContent = 'フォールバックUI';
        testFallbackBtn.className = 'px-2 py-1 bg-red-700 text-white text-xs rounded';
        testFallbackBtn.addEventListener('click', function() {
            Utils.showFallbackUI('デバッグモードからフォールバックUIをテストしています');
            logToPanel('info', 'フォールバックUIを表示しました');
        });
        commandsContainer.appendChild(testFallbackBtn);
        
        // コンテナを挿入
        debugOutput.parentNode.insertBefore(commandsContainer, debugOutput);
    }
    
    /**
     * デバッグモードトグルボタンを追加
     */
    function addDebugToggle() {
        const toggleContainer = document.querySelector('.fixed.bottom-4.right-4.z-50');
        if (!toggleContainer) return;
        
        toggleContainer.classList.remove('hidden');
        
        toggleContainer.addEventListener('click', function() {
            const debugPanel = document.getElementById('debugPanel');
            if (debugPanel) {
                debugPanel.classList.toggle('hidden');
            }
        });
    }
    
    /**
     * 環境情報をチェックして表示
     */
    function checkEnvironment() {
        logToPanel('info', '=== 環境チェック ===');
        logToPanel('info', `ブラウザ: ${navigator.userAgent}`);
        logToPanel('info', `画面サイズ: ${window.innerWidth}x${window.innerHeight}`);
        logToPanel('info', `言語: ${navigator.language}`);
        logToPanel('info', `カラースキーム: ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`);
        
        // YAMLライブラリ
        if (typeof jsyaml !== 'undefined') {
            logToPanel('info', `js-yaml: 利用可能 (バージョン: ${jsyaml.version || '不明'})`);
        } else {
            logToPanel('error', 'js-yaml: 利用不可');
        }
        
        // ローカルストレージ
        try {
            localStorage.setItem('debug_test', 'test');
            localStorage.removeItem('debug_test');
            logToPanel('info', 'localStorage: 利用可能');
        } catch (e) {
            logToPanel('error', `localStorage: 利用不可 (${e.message})`);
        }
        
        // スタイルシート
        const styleSheets = Array.from(document.styleSheets);
        logToPanel('info', `スタイルシート: ${styleSheets.length}個読み込み済み`);
        
        // テーマ状態
        const isDarkMode = document.documentElement.classList.contains('dark');
        logToPanel('info', `現在のテーマ: ${isDarkMode ? 'dark' : 'light'}`);
        
        // 現在の言語
        logToPanel('info', `現在のUI言語: ${Utils.getCurrentLanguage()}`);
    }
    
    /**
     * DOM要素の検証
     */
    function validateDOM() {
        logToPanel('info', '=== DOM要素検証 ===');
        
        // 重要なDOM要素の検証
        const criticalElements = [
            'inputYaml', 'outputYaml', 'convertBtn', 'copyBtn', 'clearBtn', 
            'loadSampleBtn', 'changelogContainer', 'languageSelect', 'themeToggle'
        ];
        
        let missingElements = 0;
        
        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const display = window.getComputedStyle(element).display;
                logToPanel('info', `#${id}: 存在します (display: ${display})`);
            } else {
                logToPanel('error', `#${id}: 見つかりません ⚠️`);
                missingElements++;
            }
        });
        
        // 言語関連要素の検証
        const langElements = document.querySelectorAll('[data-lang]');
        const currentLang = Utils.getCurrentLanguage();
        const visibleLangElements = Array.from(langElements).filter(el => 
            el.getAttribute('data-lang') === currentLang && !el.classList.contains('hidden')
        );
        
        logToPanel('info', `言語要素: ${langElements.length}個 (${currentLang}用表示中: ${visibleLangElements.length}個)`);
        
        // 設定カードの検証
        const settingCards = document.querySelectorAll('.setting-card');
        logToPanel('info', `設定カード: ${settingCards.length}個`);
        
        if (missingElements > 0) {
            logToPanel('warn', `⚠️ ${missingElements}個の重要な要素が見つかりません`);
        } else {
            logToPanel('info', '✅ すべての重要な要素が見つかりました');
        }
    }
    
    /**
     * スタイルの診断
     */
    function diagnoseStyles() {
        logToPanel('info', '=== スタイル診断 ===');
        
        // スタイルシートの検証
        const styleSheets = Array.from(document.styleSheets);
        logToPanel('info', `スタイルシート数: ${styleSheets.length}`);
        
        let tailwindLoaded = false;
        
        styleSheets.forEach((sheet, index) => {
            try {
                const href = sheet.href || '(インラインスタイル)';
                logToPanel('info', `[${index}] ${href}`);
                
                if (href.includes('tailwindcss')) {
                    tailwindLoaded = true;
                }
            } catch (e) {
                logToPanel('error', `[${index}] アクセスできません (CORS制限)`);
            }
        });
        
        if (!tailwindLoaded) {
            logToPanel('warn', '⚠️ Tailwind CSSが読み込まれていない可能性があります');
        }
        
        // クリティカルなスタイル適用確認
        const criticalStyles = [
            { selector: '.hidden', property: 'display', expectedValue: 'none' },
            { selector: '.code-area', property: 'height', expectedValue: '400px' },
            { selector: '.bg-white', property: 'background-color', expectedValueRegex: /rgb\(255, 255, 255\)|rgba\(255, 255, 255, 1\)/ }
        ];
        
        criticalStyles.forEach(style => {
            try {
                const element = document.querySelector(style.selector);
                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    const actualValue = computedStyle.getPropertyValue(style.property);
                    
                    let isCorrect = false;
                    if (style.expectedValueRegex) {
                        isCorrect = style.expectedValueRegex.test(actualValue);
                    } else {
                        isCorrect = actualValue === style.expectedValue;
                    }
                    
                    if (isCorrect) {
                        logToPanel('info', `${style.selector} ${style.property}: OK (${actualValue})`);
                    } else {
                        logToPanel('warn', `${style.selector} ${style.property}: 期待値と一致しません (${actualValue} != ${style.expectedValue || style.expectedValueRegex})`);
                    }
                } else {
                    logToPanel('warn', `${style.selector}: 要素が見つかりません`);
                }
            } catch (e) {
                logToPanel('error', `${style.selector}の検証中にエラー: ${e.message}`);
            }
        });
        
        // ダークモードの検証
        const isDarkMode = document.documentElement.classList.contains('dark');
        logToPanel('info', `ダークモード: ${isDarkMode ? '有効' : '無効'}`);
        
        if (isDarkMode) {
            const darkModeStyles = [
                { selector: 'body', property: 'background-color' },
                { selector: '.dark\\:bg-gray-800', property: 'background-color' }
            ];
            
            darkModeStyles.forEach(style => {
                try {
                    const element = document.querySelector(style.selector);
                    if (element) {
                        const computedStyle = window.getComputedStyle(element);
                        const actualValue = computedStyle.getPropertyValue(style.property);
                        logToPanel('info', `${style.selector} ${style.property}: ${actualValue}`);
                    }
                } catch (e) {
                    logToPanel('error', `${style.selector}の検証中にエラー: ${e.message}`);
                }
            });
        }
    }
    
    // 公開API
    return {
        init: init,
        logToPanel: logToPanel,
        checkEnvironment: checkEnvironment,
        validateDOM: validateDOM,
        diagnoseStyles: diagnoseStyles
    };
})();

// アプリケーションの初期化時にデバッグツールを初期化
document.addEventListener('DOMContentLoaded', function() {
    if (CONFIG.DEBUG) {
        DebugTools.init();
    }
    
    // Alt+Shift+D でデバッグモードを有効化
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.shiftKey && e.key === 'D') {
            CONFIG.DEBUG = true;
            
            // デバッグパネルを表示
            const debugPanel = document.getElementById('debugPanel');
            if (debugPanel) {
                debugPanel.classList.remove('hidden');
                // デバッグパネルが初期化されていない場合は初期化
                DebugTools.init();
                DebugTools.logToPanel('info', 'デバッグモードが有効化されました (ホットキー Alt+Shift+D)');
            }
        }
    });
});
