'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

const open = require('open');
const open_darwin = require('mac-open');

// decide what os should be used
// possible node values 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const platform = process.platform;

// open file in custom browser
function openInSpecificPlatform(e: string, op: any, customBrowser: string) {
    customBrowser ? op(e, customBrowser) : op(e);
}

// common function for file opening
function openFile(e: string, customBrowser: string) {
    // check if it is html file
    const ext = path.extname(e.toString());
    if (/^\.(html|htm|shtml|xhtml)$/.test(ext)) {
        // platform is operational system
        // darwin - mac os, others are good with open npm module
        if (platform === 'darwin') {
            openInSpecificPlatform(e, open_darwin, customBrowser);
        }
        else {
            openInSpecificPlatform(e, open, customBrowser);
        }
    } else {
        vscode.window.showInformationMessage('Supports html file only!');
    }
}

function onViewInBrowser(e: vscode.Uri) {
    let config = vscode.workspace.getConfiguration('view-in-browser');
    let customBrowser = config.get<string>("customBrowser");
    if (e.path) {
        openFile(e.fsPath, customBrowser);
    } else {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor found!');
            return;
        }
        const file = editor.document.fileName;
        openFile(`file:///${file}`, customBrowser);
    }
}

function onViewOnHost(e: vscode.Uri) {
    let config = vscode.workspace.getConfiguration('view-in-browser');
    let customBrowser = config.get<string>("customBrowser");
    let customRoot = config.get<string>("customRoot");
    let customProtocol = config.get<string>("customProtocol");
    let customHost = config.get<string>("customHost");
    let rootPath = vscode.workspace.rootPath;
    customRoot = customRoot || rootPath;
    if (!path.isAbsolute(customRoot)) {
        customRoot = path.resolve(rootPath,customRoot);
    }
    // console.log(customRoot);
    let filePath;
    // if there is Uri it means the file was selected in the explorer.
    if (e.path) {
        filePath = e.fsPath;
    } else {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor found!');
            return;
        }
        filePath = editor.document.fileName;
    }

    let absolutePath = path.relative(customRoot, filePath);
    openFile(`${customProtocol}:///${customHost}/${absolutePath}`, customBrowser);
}

// main code of the extension
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.viewInBrowser', onViewInBrowser);
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('extension.viewOnHost', onViewOnHost);
    context.subscriptions.push(disposable);
}

export function deactivate() {
}