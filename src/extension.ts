import * as vs from "vscode";
import { AutoDmDoc } from "./auto_dmdoc";

export function activate(context: vs.ExtensionContext): void {
	context.subscriptions.push(
		vs.commands.registerCommand("autoDmDoc.generateDmDoc", () => {
			const editor = vs.window.activeTextEditor;
			const autoDmDoc = new AutoDmDoc(editor);

			try {
				return autoDmDoc.generateDmDoc();
			} catch (error) {
				const errorString = JSON.stringify(error);
				let stackTrace = "";
				vs.window.showErrorMessage(errorString);
			}
		}),
	);

	context.subscriptions.push(
		vs.languages.registerCompletionItemProvider(
			"dm",
			{
				provideCompletionItems: (document: vs.TextDocument, position: vs.Position) => {
					if (validSnippet(document, position)) {
						return [new DmDocCompletionItem(document, position)];
					}
				},
			},
			'/',
			'*'
		),
	);
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {
	return;
}

// TODO add better detection
const procTest : RegExp = /\/(proc|\S+)\/\S+\(/;

function validSnippet(document: vs.TextDocument, position: vs.Position): boolean {
	const ourLine = document.lineAt(position.line);
	if (ourLine.text.trim() === "/**") {
		const nextLine = document.lineAt(position.line + 1);
		return procTest.test(nextLine.text);
	}
	return false;
}

/**
 * Completion item to trigger generate docstring command on docstring prefix
 */
class DmDocCompletionItem extends vs.CompletionItem {
	constructor(_: vs.TextDocument, position: vs.Position) {
		super("Generate DMDoc", vs.CompletionItemKind.Snippet);
		this.insertText = "";
		this.filterText = "/**";
		this.sortText = "\0";

		this.range = new vs.Range(new vs.Position(position.line, 0), position);
		
				this.command = {
					command: "autoDmDoc.generateDmDoc",
					title: "Generate Docstring",
		};
	}
}
