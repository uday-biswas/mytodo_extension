// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const e1 = document.getElementById('e1');
    const button = document.getElementById('test');

    button.addEventListener('click', () => {
        e1.innerHTML = 'button clicked';
    });
}());