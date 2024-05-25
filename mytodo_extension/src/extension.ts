// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HelloWorldPanel } from './HelloWorldPanel';
import { SidebarProvider } from './SidebarProvider';
import { authenticate } from './authenticate';
import { TokenManager } from './TokenManager';

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, extension "mytodo" is now active!');
	TokenManager.globalState = context.globalState;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('mytodo.refresh', async () => {

			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand(
				"workbench.view.extension.mytodo-sidebar-view"
			);
		}));
		
		//adding a status bar item
		const item = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right
		);
		item.text = "$(beaker) Add Todo";
		item.command = "mytodo.addTodo";
		
		item.show();
		
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("mytodo-sidebar", sidebarProvider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("mytodo.authenticate", () => {
		  try {
			authenticate(() => console.log("Auth completed"));
		  } catch (err) {
			console.log(err);
		  }
		})
	  );

	  context.subscriptions.push(
	    vscode.commands.registerCommand("mytodo.addTodo", () => {
	      const { activeTextEditor } = vscode.window;

	      if (!activeTextEditor) {
	        vscode.window.showInformationMessage("No active text editor");
	        return;
	      }

	      const text = activeTextEditor.document.getText(
	        activeTextEditor.selection
	      );

		  if(text === ""){
			  vscode.window.showInformationMessage("No text selected");
			  return;
		  }

	      sidebarProvider._view?.webview.postMessage({
	        type: "new-todo",
	        value: text,
	      });
	    })
	  );
}

// This method is called when your extension is deactivated
export function deactivate() { }
