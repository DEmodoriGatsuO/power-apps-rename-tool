/**
 * Power Apps Control Naming Tool - ユーティリティ関数
 * アプリケーション全体で使用される汎用関数を定義
 */

const Utils = {
    /**
     * 現在のUI言語を取得
     */
    getCurrentLanguage: function() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return CONFIG.DEFAULT_LANGUAGE;
        return languageSelect.value;
    },
    
    /**
     * データフィールド式から名前を抽出
     * @param {string} dataField データフィールド式
     * @returns {string} クリーンな名前
     */
    getNameFromDataField: function(dataField) {
        if (!dataField) return '';
        // "=", "'", and """ 文字を削除
        return dataField.replace(/[="']/g, '');
    },
    
    /**
     * 文字列をキャメルケースに変換
     * @param {string} str 変換する文字列
     * @returns {string} キャメルケース形式の文字列
     */
    toCamelCase: function(str) {
        if (typeof str !== 'string') {
            this.logDebug('警告: toCamelCaseに文字列以外の値が渡されました:', str);
            str = String(str || '');
        }
        
        // 非ASCII文字を削除
        str = str.replace(/[^\x00-\x7F]/g, '');
        
        // アンダースコアまたは空白で分割
        const words = str.split(/[\s_]+/);
        
        // キャメルケースに変換（最初の単語は小文字、以降の単語は先頭大文字）
        return words.map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
    },
    
    /**
     * 文字列をパスカルケースに変換
     * @param {string} str 変換する文字列
     * @returns {string} パスカルケース形式の文字列
     */
    toPascalCase: function(str) {
        if (typeof str !== 'string') {
            this.logDebug('警告: toPascalCaseに文字列以外の値が渡されました:', str);
            str = String(str || '');
        }
        
        // 非ASCII文字を削除
        str = str.replace(/[^\x00-\x7F]/g, '');
        
        // アンダースコアまたは空白で分割
        return str.split(/[\s_]+/)
            // 各単語の先頭を大文字に
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            // 結合
            .join('');
    },
    
    /**
     * ローカルストレージにデータを安全に保存
     * @param {string} key キー
     * @param {*} value 保存する値
     */
    saveToStorage: function(key, value) {
        try {
            if (value === undefined) return;
            
            if (typeof value === 'object') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            this.logError('ローカルストレージへの保存に失敗しました:', e);
        }
    },
    
    /**
     * ローカルストレージからデータを安全に取得
     * @param {string} key キー
     * @param {*} defaultValue デフォルト値
     * @returns {*} 取得した値またはデフォルト値
     */
    getFromStorage: function(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;
            
            try {
                // JSONとして解析を試みる
                return JSON.parse(value);
            } catch (e) {
                // 通常の文字列として返す
                return value;
            }
        } catch (e) {
            this.logError('ローカルストレージからの取得に失敗しました:', e);
            return defaultValue;
        }
    },
    
    /**
     * クリップボードにテキストをコピー
     * @param {string} text コピーするテキスト
     * @returns {Promise<boolean>} 成功したかどうか
     */
    copyToClipboard: function(text) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(err => {
                this.logError('クリップボードへのコピーに失敗しました:', err);
                return false;
            });
    },
    
    /**
     * エラーメッセージを表示
     * @param {string} message メッセージ
     * @param {number} duration 表示時間（ミリ秒）
     */
    showError: function(message, duration = CONFIG.SNACKBAR_TIMEOUT) {
        const snackbar = document.getElementById('errorSnackbar');
        if (!snackbar) return;
        
        snackbar.textContent = message;
        snackbar.classList.remove('hidden');
        
        // 一定時間後に非表示
        setTimeout(() => {
            snackbar.classList.add('hidden');
        }, duration);
    },
    
    /**
     * ローディング表示の切り替え
     * @param {boolean} show 表示するかどうか
     */
    toggleLoading: function(show) {
        const loader = document.getElementById('loadingOverlay');
        if (!loader) return;
        
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },
    
    /**
     * デバッグログ出力
     * @param {...*} args ログ引数
     */
    logDebug: function(...args) {
        if (!CONFIG.DEBUG) return;
        
        console.log(...args);
        
        // デバッグパネルに出力
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            const logEl = document.createElement('div');
            logEl.className = 'log';
            logEl.textContent = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            debugOutput.appendChild(logEl);
            debugOutput.scrollTop = debugOutput.scrollHeight;
        }
    },
    
    /**
     * エラーログ出力
     * @param {...*} args ログ引数
     */
    logError: function(...args) {
        console.error(...args);
        
        // デバッグパネルに出力
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            const logEl = document.createElement('div');
            logEl.className = 'log error';
            logEl.textContent = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            debugOutput.appendChild(logEl);
            debugOutput.scrollTop = debugOutput.scrollHeight;
        }
    },
    
    /**
     * 警告ログ出力
     * @param {...*} args ログ引数
     */
    logWarn: function(...args) {
        console.warn(...args);
        
        // デバッグパネルに出力
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            const logEl = document.createElement('div');
            logEl.className = 'log warn';
            logEl.textContent = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            debugOutput.appendChild(logEl);
            debugOutput.scrollTop = debugOutput.scrollHeight;
        }
    },
    
    /**
     * テーマを設定
     * @param {string} theme テーマ名 ('light' または 'dark')
     */
    setTheme: function(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            const lightIcon = document.getElementById('lightIcon');
            const darkIcon = document.getElementById('darkIcon');
            if (lightIcon) lightIcon.classList.add('hidden');
            if (darkIcon) darkIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            const lightIcon = document.getElementById('lightIcon');
            const darkIcon = document.getElementById('darkIcon');
            if (lightIcon) lightIcon.classList.remove('hidden');
            if (darkIcon) darkIcon.classList.add('hidden');
        }
        
        // ローカルストレージに保存
        this.saveToStorage(CONFIG.STORAGE_KEYS.THEME, theme);
    },
    
    /**
     * フォールバックUIを表示
     * @param {string} errorMessage エラーメッセージ
     */
    showFallbackUI: function(errorMessage = '') {
        const mainContent = document.getElementById('mainContent');
        const fallbackUI = document.getElementById('fallbackUI');
        const appLoader = document.getElementById('appLoader');
        
        if (mainContent) mainContent.style.display = 'none';
        if (appLoader) appLoader.style.display = 'none';
        if (fallbackUI) {
            const errorEl = fallbackUI.querySelector('p');
            if (errorEl && errorMessage) {
                errorEl.textContent = errorMessage;
            }
            fallbackUI.classList.remove('hidden');
        }
        
        this.logError('フォールバックUIを表示しました:', errorMessage);
    },
    
    /**
     * UIの言語を更新
     * @param {string} lang 言語コード
     */
    updateLanguage: function(lang) {
        if (!CONFIG.SUPPORTED_LANGUAGES.includes(lang)) {
            lang = CONFIG.DEFAULT_LANGUAGE;
        }
        
        // すべての言語要素を非表示
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.add('hidden');
        });
        
        // 選択された言語の要素のみ表示
        document.querySelectorAll(`[data-lang="${lang}"]`).forEach(el => {
            el.classList.remove('hidden');
        });
        
        // プレースホルダーテキストを更新
        const inputYaml = document.getElementById('inputYaml');
        if (inputYaml) {
            inputYaml.placeholder = inputYaml.getAttribute(`data-placeholder-${lang}`) || 
                (lang === 'en' ? 'Paste your Power Apps YAML code here...' : 'Power AppsのYAMLコードを貼り付けてください...');
        }
        
        // セレクトボックスの値を更新
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = lang;
        }
        
        // ローカルストレージに保存
        this.saveToStorage(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
    },
    
    /**
     * 保存された設定を適用
     */
    applyStoredPreferences: function() {
        // 言語設定を適用
        const savedLang = this.getFromStorage(CONFIG.STORAGE_KEYS.LANGUAGE);
        if (savedLang) {
            this.updateLanguage(savedLang);
        } else {
            // デフォルト言語を適用
            this.updateLanguage(CONFIG.DEFAULT_LANGUAGE);
        }
        
        // テーマ設定を適用
        const savedTheme = this.getFromStorage(CONFIG.STORAGE_KEYS.THEME);
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // システム設定に基づいてテーマを適用
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
        
        // 最後の入力を復元
        const lastInput = this.getFromStorage(CONFIG.STORAGE_KEYS.LAST_INPUT);
        if (lastInput) {
            const inputYaml = document.getElementById('inputYaml');
            if (inputYaml) {
                inputYaml.value = lastInput;
            }
        }
    },
    
    /**
     * テーマを切り替え
     */
    toggleTheme: function() {
        const isDark = document.documentElement.classList.contains('dark');
        this.setTheme(isDark ? 'light' : 'dark');
    }
};
