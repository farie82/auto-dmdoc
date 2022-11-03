import * as vs from "vscode";

export class AutoDmDoc {
	private editor?: vs.TextEditor;

	constructor(editor?: vs.TextEditor) {
		this.editor = editor;
	}

	public generateDmDoc() {
		if (this.editor === undefined) {
			throw new Error(
				"Cannot process this document. It is either too large or is not yet supported.",
			);
		}

		const position = this.editor.selection.active;


		const parameterRegex: RegExp = /\((.*)\)/;

		const procLine = this.getFullProc(position.line + 1, this.editor.document);

		if (!procLine) {
			// TODO add better detection
			vs.window.showWarningMessage("Malformed proc found");
			return;
		}

		const paramBody = procLine.match(parameterRegex)!;

		const argNames = this.getArgs(paramBody);

		const snippetText = this.createSnippetText(argNames);
		const insertPosition = position.with(undefined, 0);

		const success = this.editor.insertSnippet(snippetText, insertPosition);

		return success;
	}

	private createSnippetText(args?: string[]) {
		let snippet = "/**\n" +
			" * ${1:Proc description}\n";
		if (args?.length) {
			snippet += " *\n";
			args.forEach((arg, index) => snippet += " * " + arg + " - ${" + (index + 2) + ":Description of argument}\n");
		}
		snippet += " */";
		return new vs.SnippetString(snippet);
	}

	private getFullProc(linePosition: number, document: vs.TextDocument) {
		let currentLine = linePosition;
		let currentText;
		const lines = [];
		do {
			if (currentLine >= document.lineCount) {
				return undefined;
			}
			currentText = document.lineAt(currentLine++).text;
			lines.push(currentText.trim());
		} while (!currentText.includes(')')); // TODO: Some ass putting a comment with a ) will break this

		return lines.join("");
	}

	private getArgs(paramBody: string | RegExpMatchArray) {
		const argumentsRegex: RegExp = /[^\s,]+/g;
		const argNameRegex: RegExp = /[^\/]+$/
		const argValues = paramBody[1].match(argumentsRegex);
		let argNames: string[] = [];
		if (argValues) {
			argNames = argValues.flatMap(arg => arg.match(argNameRegex)!);
		}
		return argNames;
	}
}
