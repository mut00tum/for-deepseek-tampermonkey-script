// ==UserScript==
// @name         DeepSeek Chat Prevent Enter Submit (No DeepThink Trigger)
// @namespace    http://yournamespace.com
// @version      1.6
// @description  Prevent IME Enter submit, Prevent DeepThink (R1) button trigger on Enter for DeepSeek Chat
// @author       You
// @match        https://chat.deepseek.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const inputSelector = '#chat-input.c92459f0';
    const sendButtonSelector = '.ds-button[role="button"]:has(.ds-icon > svg[width="20"][height="20"])';
    const deepThinkButtonSelector = '.ds-button[role="button"]:has(.ds-icon > svg[width="20"][height="20"]):has(span.ad0c98fd:contains("DeepThink (R1)"))';

    let isComposing = false;

    function isIMECompositionActive(event) {
        return isComposing || event.isComposing || event.keyCode === 229;
    }

    function handleCompositionStart(event) {
        isComposing = true;
    }

    function handleCompositionEnd(event) {
        isComposing = false;
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            // IMEの状態をより厳密にチェック
            if (isIMECompositionActive(event)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            // 通常のEnter処理
            const sendButton = document.querySelector(sendButtonSelector);
            const deepThinkButton = document.querySelector(deepThinkButtonSelector);

            if (sendButton && !event.isComposing) {
                if (deepThinkButton) {
                    deepThinkButton.disabled = true;
                }

                // 少し遅延を入れて送信
                setTimeout(() => {
                    sendButton.click();
                    if (deepThinkButton) {
                        setTimeout(() => {
                            deepThinkButton.disabled = false;
                        }, 100);
                    }
                }, 50);

                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    function setupEnterKeyPreventer(inputElement) {
        if (!inputElement || inputElement.hasAttribute('data-enter-handler')) {
            return;
        }

        // 既存のイベントリスナーを削除（安全のため）
        removeEnterKeyPreventer(inputElement);

        // 新しいイベントリスナーを追加
        inputElement.addEventListener('keydown', handleKeyDown, true);
        inputElement.addEventListener('compositionstart', handleCompositionStart, false);
        inputElement.addEventListener('compositionend', handleCompositionEnd, false);

        // ハンドラーが設定されたことをマーク
        inputElement.setAttribute('data-enter-handler', 'true');
    }

    function removeEnterKeyPreventer(inputElement) {
        if (!inputElement) {
            return;
        }

        inputElement.removeEventListener('keydown', handleKeyDown, true);
        inputElement.removeEventListener('compositionstart', handleCompositionStart, false);
        inputElement.removeEventListener('compositionend', handleCompositionEnd, false);
        inputElement.removeAttribute('data-enter-handler');
    }

    function initializeScript() {
        const inputElement = document.querySelector(inputSelector);
        if (inputElement) {
            setupEnterKeyPreventer(inputElement);

            const observer = new MutationObserver(mutations => {
                const inputElement = document.querySelector(inputSelector);
                if (inputElement && !inputElement.hasAttribute('data-enter-handler')) {
                    setupEnterKeyPreventer(inputElement);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // ページ読み込み完了時に初期化
    if (document.readyState === 'loading') {
        window.addEventListener('load', () => setTimeout(initializeScript, 1000));
    } else {
        setTimeout(initializeScript, 1000);
    }
})();