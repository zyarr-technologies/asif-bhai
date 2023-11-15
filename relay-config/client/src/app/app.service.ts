import { Injectable } from "@angular/core";
import { IpcRenderer, IpcRendererEvent } from "electron";

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private ipc: IpcRenderer | undefined = void 0;

    constructor() {
        if (window.require) {
            try {
                this.ipc = window.require('electron').ipcRenderer;
            } catch (e) {
                throw e;
            }
        } else {
            console.warn('Electron IPC was not loaded');
        }
    }

    on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
        if (!this.ipc) {
            return;
        }
        this.ipc.on(channel, listener);
    }

    send(channel: string, ...args: any[]): void {
        if (!this.ipc) {
            return;
        }
        this.ipc.send(channel, ...args);
    }
}