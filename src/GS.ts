'use strict';
import * as vscode from 'vscode';
import {ｼﾓﾅｲｻﾞー} from './Shimonizer';

export class GS {
    activate(context: vscode.ExtensionContext) {
        let previewUri = vscode.Uri.parse('gs-preview://authority/gs-preview');
        var ﾅｲｻﾞー = new ｼﾓﾅｲｻﾞー();
        class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
            private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

            public provideTextDocumentContent(uri: vscode.Uri): string {
                return this.creategsSnippet();
            }

            get onDidChange(): vscode.Event<vscode.Uri> {
                return this._onDidChange.event;
            }

            public update(uri: vscode.Uri) {
                this._onDidChange.fire(uri);
            }

            private creategsSnippet() {
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
                    let t = part[0];
                    let n = part[1];
                    let la = part.length;
                    if(la > 2) {
                        t=part.slice(0, la-1).join(' ');
                        n=part[la-1]
                    }

                    if(n.startsWith('*')) {
                        const li = n.lastIndexOf('*') +1;
                        t = t + n.substr(0, li);
                        n = n.substr(li);
                    }
                    if (n.endsWith(';')) {
                        n = n.substr(0, n.length-1);
                    }
                    const pcz = ﾅｲｻﾞー.ﾊﾟｽｶﾗｲｽﾞ(n);
                    text += `${t} Get[Hoge]${pcz}([HOGE*] ptr) { return ptr->${n}; }\n`
                    text += `void Set[Hoge]${pcz}([HOGE*] ptr, ${t} value) { ptr->${n} = value; }\n`

                    //props += `public ${part[i-1]} ${pcz} {\n    get => Record.${uriz};\n    set => Record.${uriz} = value;\n}\n`;
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
        let registration = vscode.workspace.registerTextDocumentContentProvider('gs-preview', provider);

        let disposable = vscode.commands.registerCommand('extension.tnk.GS', () => {
            return vscode.commands.executeCommand('vscode.previewHtml',
                previewUri, vscode.ViewColumn.Two, 'GS').then((success) =>
            {
                provider.update(previewUri);
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
        });
        context.subscriptions.push(disposable, registration);
    }
}

