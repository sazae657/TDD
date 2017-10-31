'use strict';
import * as vscode from 'vscode';
import {ｼﾓﾅｲｻﾞー} from './lib/Shimonizer';
import * as Mapper from './lib/Mapper';

export class GS {
    activate(context: vscode.ExtensionContext, map:Mapper.Mapper) {
        const mappper = map;
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
                let impo = "";
                let lineno = 0;
                let buffer = "";
                let prefix = "[HOGE]";
                let accessor = "->";
                for (const k of properties.split(/\n/)) {
                    lineno ++;
                    buffer += " " + k.trim();
                    if (k.startsWith('.')) {
                        buffer = buffer.trim();
                        const v = buffer.split(/[\s\t]+/);
                        if(v[0] === '.prefix') {
                            prefix = v[1];
                        }
                        else if(v[0] === '.accessor') {
                            accessor = v[1];
                        }
                        buffer = "";
                        continue
                    }
                    if (! buffer.endsWith(";")) {
                        continue;
                    }
                    const part = buffer.trim().split(/[\s\t]+/);
                    if (part.length < 2) {
                        vscode.window.showErrorMessage(`なんかおかしくね: ${lineno}: ${buffer}`);
                        buffer = "";
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
                    const get_fn = `TNK_Get${prefix}${pcz}`;
                    const set_fn = `TNK_Set${prefix}${pcz}`;

                    let map = new Mapper.Typo('*ERR*', '*ERR*');
                    try {
                        map = mappper.Map(t);
                    }
                    catch(e) {
                        vscode.window.showErrorMessage(`${lineno}: ${e.toString()}`);
                    }

                    text += `\n${t} ${get_fn}(${prefix}* ptr) { return ptr${accessor}${n}; }\n`
                    text += `void ${set_fn}(${prefix}* ptr, ${t} value) { ptr${accessor}${n} = value; }\n`

                    impo += `\n// ${t}\n`;
                    impo += `[DllImport(ExtremeSports.Lib, EntryPoint="${get_fn}", CharSet=CharSet.Auto)]\n`;
                    impo += `internal static extern ${map.ret} ${get_fn}(IntPtr ptr);\n`;

                    impo += `[DllImport(ExtremeSports.Lib, EntryPoint="${set_fn}", CharSet=CharSet.Auto)]\n`;
                    impo += `internal static extern void ${set_fn}(IntPtr ptr, ${map.arg} omg);\n`;

                    props += `\npublic ${map.ret} ${pcz} {\n`;
                    props += `    get => NativeMethods.${get_fn}(this.Pounter);\n`;
                    props += `    set => NativeMethods.${set_fn}(this.Pounter, value);\n`;
                    props += '}\n'

                    buffer = "";
                }

                return `
                    <body>
                        <div>でぶ</div>
                        <hr>
                        <pre>${text}</pre>
                        <hr>
                        <pre>${impo}</pre>
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


