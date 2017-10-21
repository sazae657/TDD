'use strict';
import * as vscode from 'vscode';
import {ｼﾓﾅｲｻﾞー} from './Shimonizer';

export class Struct {
    activate(context: vscode.ExtensionContext) {
        let previewUri = vscode.Uri.parse('struct-preview://authority/struct-preview');
        var ﾅｲｻﾞー = new ｼﾓﾅｲｻﾞー();
        class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
            private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

            public provideTextDocumentContent(uri: vscode.Uri): string {
                return this.createStructSnippet();
            }

            get onDidChange(): vscode.Event<vscode.Uri> {
                return this._onDidChange.event;
            }

            public update(uri: vscode.Uri) {
                this._onDidChange.fire(uri);
            }

            private createStructSnippet() {
                let editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return this.errorSnippet("開いてるｴｼﾞﾀがないよう");
                }
                return this.extractSnippet();
            }

            private extractSnippet(): string {
                let editor = vscode.window.activeTextEditor;
                let text = editor.document.getText();
                if(editor.selection.isEmpty) {
                    return "";
                }
                let selStart = editor.document.offsetAt(editor.selection.anchor);
                const range = new vscode.Range(editor.selection.start, editor.selection.end);

                return this.snippet(editor.document, range);
            }

            private errorSnippet(error: string): string {
                return `<body>${error}</body>`;
            }

            private snippet(document: vscode.TextDocument, range: vscode.Range): string {
                const properties = document.getText(range)//.slice(propStart, propEnd);
                let text = "";
                let props = "";
                for (const s of properties.split(/\n/)) {
                    const part = s.trim().split(/[\s\t]+/);
                    if (part.length == 0) {
                        break;
                    }
                    if (part.length == 1) {
                        text += s + "\n";
                        continue;
                    }
                    let i = 0;
                    for (i = 0; i < part.length-1; i++) {
                        text += part[i] + " ";
                    }
                    let uriz = part[i];
                    let em = 0;
                    if ((em = uriz.indexOf(';')) > 0) {
                        uriz = uriz.substr(0, em);
                    }

                    let umz = part[i];
                    if ((em = umz.indexOf(';')) > 0) {
                        umz = umz.substr(0, em);
                    }
                    const pcz = ﾅｲｻﾞー.ﾊﾟｽｶﾗｲｽﾞ(umz);
                    text += ﾅｲｻﾞー.ﾊﾟｽｶﾗｲｽﾞ(umz) + ";\n";

                    props += `public ${part[i-1]} ${pcz} {\n    get => Record.${uriz};\n    set => Record.${uriz} = value;\n}\n`;
                }

                return `
                    <body>
                        <div>でぶ</div>
                        <hr>
                        <pre>${text}</pre>
                        <hr>
                        <pre>${props}</pre>
                    </body>`;
            }
        }
        let provider = new TextDocumentContentProvider();
        let registration = vscode.workspace.registerTextDocumentContentProvider('struct-preview', provider);
        /*vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
            if (e.document === vscode.window.activeTextEditor.document) {
                provider.update(previewUri);
            }
        });
        vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
            if (e.textEditor === vscode.window.activeTextEditor) {
                provider.update(previewUri);
            }
        });*/
        let disposable = vscode.commands.registerCommand('extension.Struct', () => {
            return vscode.commands.executeCommand('vscode.previewHtml',
                previewUri, vscode.ViewColumn.Two, 'かうぞうたい').then((success) =>
            {
                provider.update(previewUri);
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
        });
        context.subscriptions.push(disposable, registration);
    }
}

