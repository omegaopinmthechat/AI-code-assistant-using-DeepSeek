import * as vscode from 'vscode'; 
import ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('amar-ai.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'Superiro',
            "Amar Ai (deepSeek is Used)",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';

                try {
                    const streamResponse = await ollama.chat({
                        model: 'deepseek-r1:1.5b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                } catch (error: any) {
                    console.error('Error in ollama.chat:', error);
                    panel.webview.postMessage({
                        command: 'chatResponse',
                        text: `Error: ${String(error.message) || error}`
                    });
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #e0f7fa, #007acc);
                color: #333;
            }
            h1 {
                color: #fff;
                background: linear-gradient(135deg, #007acc, #005f99);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }
            #prompt {
                width: 80%;
                max-width: 600px;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 0.5rem;
                margin-top: 1rem;
                font-size: 1rem;
                color: #111;
                background: #f4f4f9;
            }
            #askBtn {
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                font-size: 1rem;
                color: #fff;
                background: linear-gradient(135deg, #007acc, #005f99);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.2s ease;
            }
            #askBtn:hover {
                background: linear-gradient(135deg, #005f99, #004f7a);
                transform: translateY(-2px);
            }
            #response {
                margin-top: 1rem;
                width: 80%;
                max-width: 600px;
                padding: 1rem;
                background: #ffffffdd;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                overflow-y: auto;
                max-height: 300px;
                color: #111;
            }
        </style>
    </head>
    <body>
        <h1>Chat with Amar AI</h1>
        <textarea id="prompt" rows="3" placeholder="State your problem..."></textarea> <br />
        <button id="askBtn">Ask</button>
        <div id="response"></div>
        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('askBtn').addEventListener('click', () => {
                const text = document.getElementById('prompt').value;
                vscode.postMessage({ command: 'chat', text });
            });

            window.addEventListener('message', event => {
                const { command, text } = event.data;
                if (command === 'chatResponse') {
                    document.getElementById('response').innerText = text;
                }
            });
        </script>
    </body>
    </html>
    `;
}

export function deactivate() {}
