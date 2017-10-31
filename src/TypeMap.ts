'use strict';
import * as vscode from 'vscode';
import {ｼﾓﾅｲｻﾞー} from './lib/Shimonizer';
import {Mapper} from './lib/Mapper';

export class TypeMap {
    activate(context: vscode.ExtensionContext, map:Mapper) {
        const mappper = map;
        let previewUri = vscode.Uri.parse('typemap-preview://authority/typemap-preview');
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
                let buffer = "";
                let lineno = 0;
                for (const s of properties.split(/\n/)) {
                    lineno++;
                    buffer += " " + s.trim();
                    if (buffer.endsWith(";")) {
                        buffer = buffer.trim();
                        const tok = buffer.split(/[\s\t]+/);
                        let err = false;
                        if (tok.length < 2) {
                            vscode.window.showErrorMessage(`なんかおかしくね: ${lineno}: ${buffer}`);
                            buffer = "";
                            continue;
                        }
                        let type = tok[0];
                        let value = tok[1];
                        if (tok.length > 2) {
                            value = tok[tok.length-1];
                            type = tok.slice(0, tok.length-1).join(' ');
                        }
                        if (value.startsWith('*')) {
                            const li = value.lastIndexOf('*') +1;
                            type = type + value.substr(0, li);
                            value = value.substr(li);
                        }
                        try {
                            const m = mappper.Map(type);
                            props += `public ${m.ret} ${value}    // ${type}\n`;
                        }
                        catch(e) {
                            vscode.window.showErrorMessage(`${lineno}: ${e.toString()}`);
                            props += `*ERR* ${buffer}\n`;
                            err = true;
                        }
                        if (err) {
                            text += '*ERR* ';
                        }
                        text += `${buffer}\n`;
                        buffer = "";
                    }
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
        let registration = vscode.workspace.registerTextDocumentContentProvider('typemap-preview', provider);
        let disposable = vscode.commands.registerCommand('extension.tnk.TypeMap', () => {
            return vscode.commands.executeCommand('vscode.previewHtml',
                previewUri, vscode.ViewColumn.Two, '型').then((success) =>
            {
                provider.update(previewUri);
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
        });
        context.subscriptions.push(disposable, registration);
    }
}

