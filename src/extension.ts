'use strict';
import * as vscode from 'vscode';
import {Struct} from './Struct';
import {FuncMap} from'./FuncMap';
import {Mapper} from './lib/Mapper';
import {TypeMap} from './TypeMap';
import {GS} from './GS';

export function activate(context: vscode.ExtensionContext) {

    (new Struct()).activate(context);

    const mapper = new Mapper();

    (new FuncMap()).activate(context, mapper);
    (new TypeMap()).activate(context, mapper);
    (new GS()).activate(context, mapper);

    const wsf = vscode.workspace.workspaceFolders;
    if (wsf) {
        mapper.SetLocalPath(wsf[0].uri);
        const pattern = mapper.ResolveLocalMapPath();
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        watcher.onDidChange((e: vscode.Uri)=>{
            vscode.window.showInformationMessage(`onDidChange ${e.fsPath}`);
            mapper.MergeLoalMap();
        });
        watcher.onDidCreate((e: vscode.Uri)=>{
            vscode.window.showInformationMessage(`onDidCreate ${e.fsPath}`);
            mapper.MergeLoalMap();
        });
        watcher.onDidDelete((e: vscode.Uri)=>{
            vscode.window.showInformationMessage(`onDidDelete ${e.fsPath}`);
        });
        mapper.SaveTypeMap();
        mapper.MergeLoalMap();
        context.subscriptions.push(watcher);
    }

    let functionize = vscode.commands.registerTextEditorCommand(
        'extension.tnk.Functionize',
        (ｴﾃﾞｨﾀー, ｴﾃﾞｨｯﾄ) =>
        {
            if(ｴﾃﾞｨﾀー.selection.isEmpty) {
                vscode.window.showInformationMessage("（ ◜◡◝ ）");
                return;
            }
            //var ｼﾓﾅｲｽﾞﾃｷｽﾄ = ｴﾃﾞｨﾀー.document.getText(ｴﾃﾞｨﾀー.selection);
            const sel = ｴﾃﾞｨﾀー.document.getText(ｴﾃﾞｨﾀー.selection);
            let txt = "";
            for (const k of sel.split(/[\s\t\n]+/)) {
                txt += k + " ";
                if (k.indexOf(';') > 0) {
                    txt += "\n";
                }
            }
            ｴﾃﾞｨｯﾄ.replace(ｴﾃﾞｨﾀー.selection, txt.trim());
        });
    context.subscriptions.push(functionize);

}

// this method is called when your extension is deactivated
export function deactivate() {
}

