import * as vscode from "vscode";

const KEY = "vstodotoken";

export class TokenManager {
  static globalState: vscode.Memento;

  static setToken(token: string) {
    return this.globalState.update(KEY, token);
  }

  static getToken(): any {
    return this.globalState.get(KEY);
  }
}
