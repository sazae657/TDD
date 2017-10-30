'use strict';
import * as vscode from 'vscode';
import {ｼﾓﾅｲｻﾞー} from './Shimonizer';
import {Mapper} from './Mapper';
import {escape} from 'validator';

class ArgDecl {
    public type:string;
    public name:string;
    constructor(x:string, y:string) {
        this.type = x;
        this.name = y;
    }
}

class FuncDecl {
    public ret: string;
    public func: string;
    public args: ArgDecl[];
    constructor(x:string, y:string) {
        this.ret = x;
        this.func = y;
        this.args = new Array<ArgDecl>();
    }
    public AddArg(arg:ArgDecl) {
        this.args.push(arg);
    }
}

export class FuncMap {
    activate(context: vscode.ExtensionContext, map:Mapper) {
        const mappper = map;
        let previewUri = vscode.Uri.parse('funcmap-preview://authority/funcmap-preview');
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


            private genPrp(lparam:string[], rparam:string[]) : FuncDecl {
                let r = lparam[0];
                let f = lparam[1];
                if (lparam.length > 2) {
                    r = lparam.slice(0, lparam.length-1).join(' ');
                    f = lparam[lparam.length-1];
                }
                if(f.startsWith('*')) {
                    const li = f.lastIndexOf('*') +1;
                    r = r + f.substr(0, li);
                    f = f.substr(li);
                }
                let rpm = new FuncDecl(r, f);
                for(let a of rparam){
                    a = a.trim();
                    if(a.length == 0) {
                        continue;
                    }
                    let ag = a.split(/[\s\t]+/)
                    let t = ag[0];
                    let n = ag[1];
                    let la = ag.length;
                    if(la > 2) {
                        t=ag.slice(0, la-1).join(' ');
                        n=ag[la-1]
                    }
                    if (!n) {
                        throw new SyntaxError(`引数の書式がおかしい: ${ag}`);
                    }

                    if(n.startsWith('*')) {
                        const li = n.lastIndexOf('*') +1;
                        t = t + n.substr(0, li);
                        n = n.substr(li);
                    }
                    rpm.AddArg(new ArgDecl(t, n));
                }
                return rpm;
            }

            private parseFunc(str:string) : FuncDecl
            {
                let rr = str.split(/[\(|\)]/);
                let lp = rr[0].split(/[\s\t]+/)
                let rp = rr[1].split(',')
                return this.genPrp(lp, rp);
            }

            private toDlSym(line:FuncDecl) :string {
                let ret = `TNK_EXPORT ${line.ret} ${line.func}_TNK(`;
                for(const w of line.args) {
                    ret += `${w.type} ${w.name}, `;
                }
                ret = ret.trim();
                if(ret.endsWith(',')) {
                    ret = ret.substr(0, ret.length-1);
                }
                ret += ") {\n    ";

                if (line.ret !== 'void') {
                    ret += "return ";
                }

                ret += `${line.func}(`;
                for(const w of line.args) {
                    ret += `${w.name},`;
                }
                ret = ret.trim();
                if(ret.endsWith(',')) {
                    ret = ret.substr(0, ret.length-1);
                }
                ret += ");\n}";
                return ret;
            }

            private toImport(line: FuncDecl) :string {
                let args = "";
                for(const ar of line.args) {
                    args += `${ar.type}:${ar.name}  `;
                }

                let ret = `// ${line.ret}: ${line.func} ${args}\n`;

                ret += `[DllImport(ExtremeSports.Lib, EntryPoint="${line.func}_TNK", CharSet=CharSet.Auto)]\n`;
                ret += `internal static extern ${mappper.Map(line.ret).ret} ${line.func}(`;
                for(const w of line.args) {
                    ret += `${mappper.Map(w.type).arg} ${w.name}, `;
                }
                ret = ret.trim();
                if (ret.endsWith(',')) {
                    ret = ret.substr(0, ret.length-1);
                }
                ret += ");"
                return ret;
            }

            private toWrapper(line: FuncDecl) :string {
                let argl =[];
                let ret = `\npublic static ${mappper.Map(line.ret).ret} ${line.func}(`;
                for(const w of line.args) {
                    ret += `${mappper.Map(w.type).arg_cs} ${w.name}, `;
                    argl.push(w.name);
                }

                ret = ret.trim();
                if (ret.endsWith(',')) {
                    ret = ret.substr(0, ret.length-1);
                }
                ret += ") {\n";
                ret += "    ";
                if( line.ret !== 'void') {
                    ret += "return ";
                }
                ret += `NativeMethods.${line['func']}(`;
                if (argl.length != 0) {
                    ret +=  argl.join(',');
                }
                ret += ");\n}"
                return ret;
            }

            private snippet(document: vscode.TextDocument, range: vscode.Range): string {
                const properties = document.getText(range)//.slice(propStart, propEnd);
                let text = "";
                let props = "";
                let wrap = "";
                let buffer = "";
                let errors = "";
                let lineno = 0;
                for (const s of properties.split(/\n/)) {
                    lineno++;
                    buffer += " " + s.trim();
                    if (buffer.endsWith(";")) {
                        //text += `P: ${}\n`;
                        try {
                            const f = this.parseFunc(buffer.trim());
                            text += this.toDlSym(f) + "\n";
                            props += this.toImport(f) + "\n\n";
                            wrap += this.toWrapper(f) + "\n\n";
                        }catch(e) {
                            vscode.window.showErrorMessage(e.toString());
                            errors += `${lineno}: ${e.toString()}\n`
                        }
                        buffer = "";
                    }
                }
                errors = escape(errors);
                text = escape(text);
                props = escape(props);
                wrap = escape(wrap);
                return `
                    <body>
                        <div>でぶ</div>
                        <pre>${errors}</pre>
                        <hr>
                        <pre>${text}</pre>
                        <hr>
                        <pre>${props}</pre>
                        <hr>
                        <pre>${wrap}</pre>
                    </body>`;
            }
        }
        let provider = new TextDocumentContentProvider();
        let registration = vscode.workspace.registerTextDocumentContentProvider('funcmap-preview', provider);
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
        let disposable = vscode.commands.registerCommand('extension.tnk.FuncMap', () => {
            return vscode.commands.executeCommand('vscode.previewHtml',
                previewUri, vscode.ViewColumn.Two, '関数').then((success) =>
            {
                provider.update(previewUri);
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
        });
        context.subscriptions.push(disposable, registration);
    }
}

