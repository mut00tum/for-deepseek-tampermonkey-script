// ==UserScript==
// @name         DeepSeek Chat Prevent Enter Submit (No DeepThink Trigger)
// @namespace    http://yournamespace.com
// @version      1.5
// @description  Prevent IME Enter submit, Prevent DeepThink (R1) button trigger on Enter for DeepSeek Chat
// @author       You
// @match        https://chat.deepseek.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const inputSelector = '#chat-input.c92459f0';
    const sendButtonSelector = '.ds-button[role="button"]:has(.ds-icon > svg[width="20"][height="20"])';
    const deepThinkButtonSelector = '.ds-button[role="button"]:has(.ds-icon > svg[width="20"][height="20"]):has(span.ad0c98fd:contains("DeepThink (R1)"))'; // DeepThink (R1) ボタンのセレクタ

    function isIMECompositionActive(event) {
        return event.isComposing;
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            if (isIMECompositionActive(event)) {
                // IME変換中の場合：送信をキャンセル
                event.preventDefault();
                event.stopPropagation();
            } else {
                // IME変換中でない場合：送信処理を実行 (DeepThink (R1) ボタン誤作動対策)
                const sendButton = document.querySelector(sendButtonSelector);
                const deepThinkButton = document.querySelector(deepThinkButtonSelector); // DeepThink (R1) ボタン要素を取得

                if (sendButton && deepThinkButton) {
                    deepThinkButton.disabled = true; // **送信前に DeepThink (R1) ボタンを一時的に無効化**
                    sendButton.click(); // 送信ボタンをクリック
                    setTimeout(() => {
                        deepThinkButton.disabled = false; // **送信後に DeepThink (R1) ボタンを有効に戻す (少し遅延させる)**
                    }, 100); // 100ms程度の遅延
                } else if (sendButton) { // DeepThink (R1) ボタンが見つからない場合でも、送信処理は実行
                    sendButton.click();
                }
            }
        }
    }

    function setupEnterKeyPreventer(inputElement) {
        if (!inputElement) {
            return;
        }
        inputElement.addEventListener('keydown', handleKeyDown, true); // キャプチャフェーズ
    }

    function removeEnterKeyPreventer(inputElement) {
        if (!inputElement) {
            return;
        }
        inputElement.removeEventListener('keydown', handleKeyDown, true);
    }

    function initializeScript() {
        const inputElement = document.querySelector(inputSelector);
        if (inputElement) {
            setupEnterKeyPreventer(inputElement);

            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' || mutation.type === 'childList') {
                        removeEnterKeyPreventer(inputElement);
                        setupEnterKeyPreventer(inputElement);
                    }
                });
            });

            const targetNode = document.querySelector('body');
            const config = { attributes: true, childList: true, subtree: true };
            observer.observe(targetNode, config);
        }
    }

    window.addEventListener('load', function() {
        setTimeout(initializeScript, 1000);
    });

})();