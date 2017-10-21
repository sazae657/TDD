'use strict';
import * as vscode from 'vscode';
import {Struct} from './Struct';
import {FuncMap} from'./FuncMap';

export function activate(context: vscode.ExtensionContext) {

    (new Struct()).activate(context);
    (new FuncMap()).activate(context);

    let functionize = vscode.commands.registerTextEditorCommand(
        'extension.Functionize',
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

