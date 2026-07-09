// Castaway — a Johnny Castaway-style island survivor for VS Code.
// Extension host wiring modeled on tonybaloney/vscode-pets (MIT).

import * as vscode from 'vscode';

// Scene ids must match the keys in media/scenes.js.
const SCENES: { id: string; label: string; detail: string }[] = [
    { id: 'idle', label: 'Idle', detail: 'Standing around, contemplating coconuts' },
    { id: 'fishing', label: 'Fishing', detail: 'The old-fashioned food delivery' },
    { id: 'building', label: 'Building Raft', detail: 'Escape plan #47' },
    { id: 'sleeping', label: 'Sleeping', detail: 'Zzz' },
    { id: 'running', label: 'Jogging', detail: 'Cardio is important, even here' },
    { id: 'coconutGathering', label: 'Getting Coconut', detail: 'Gravity-assisted harvest' },
    { id: 'watchingHorizon', label: 'Watching Horizon', detail: 'Is that a ship?' },
    { id: 'fire', label: 'Making Fire', detail: 'Rubbing sticks like it is 1992' },
    { id: 'droneDelivery', label: 'Drone Delivery', detail: 'Prime-ish. Arrives in 1-2 business years' },
    { id: 'phoneSignal', label: 'Searching for Signal', detail: 'One bar... no. Zero bars' },
    { id: 'selfie', label: 'Island Selfie', detail: '#castaway #blessed #nofilter' },
    { id: 'doomscrolling', label: 'Doomscrolling', detail: 'The feed never loads, he scrolls anyway' },
    { id: 'videoCall', label: 'Video Call', detail: 'Buffering...' },
    { id: 'satelliteInternet', label: 'Satellite Internet', detail: 'Downloading rescue map, ETA 14 years' },
    { id: 'foodDelivery', label: 'Food Delivery', detail: 'The jetski does not stop here' },
    { id: 'robotVacuum', label: 'Robot Vacuum', detail: 'It keeps the sand tidy' },
    { id: 'wilson', label: 'Wilson', detail: 'A volleyball is a fine conversationalist' },
    { id: 'stargazing', label: 'Stargazing', detail: 'Shooting stars, satellites, and one very specific wish' },
];

const PHONE_SCENES = ['phoneSignal', 'selfie', 'doomscrolling', 'videoCall'];

type GraphicsMode = 'classic' | 'modern';

function getConfiguredGraphicsMode(): GraphicsMode {
    return vscode.workspace
        .getConfiguration('vscode-castaway')
        .get<GraphicsMode>('graphicsMode', 'classic');
}

function getConfiguredPosition(): string {
    return vscode.workspace
        .getConfiguration('vscode-castaway')
        .get<string>('position', 'panel');
}

function getConfiguredTextSize(): string {
    return vscode.workspace
        .getConfiguration('vscode-castaway')
        .get<string>('textSize', 'medium');
}

function getWebviewOptions(
    extensionUri: vscode.Uri,
): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
    };
}

function getNonce(): string {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

interface WebviewMessage {
    command: string;
    text?: string;
    name?: string;
}

function handleWebviewMessage(message: WebviewMessage) {
    switch (message.command) {
        case 'info':
            void vscode.window.showInformationMessage(message.text ?? '');
            return;
        case 'alert':
            void vscode.window.showErrorMessage(message.text ?? '');
            return;
    }
}

/**
 * Shared behavior for the editor panel and the explorer view — both host the
 * same island webview and receive the same control messages.
 */
abstract class IslandContainer {
    protected _disposables: vscode.Disposable[] = [];
    protected _graphicsMode: GraphicsMode;

    constructor(
        protected readonly _extensionUri: vscode.Uri,
        graphicsMode: GraphicsMode,
    ) {
        this._graphicsMode = graphicsMode;
    }

    protected abstract getWebview(): vscode.Webview;

    public post(message: Record<string, unknown>): void {
        void this.getWebview().postMessage(message);
    }

    public nextScene(): void {
        this.post({ command: 'next-scene' });
    }

    public setScene(scene: string): void {
        this.post({ command: 'set-scene', scene });
    }

    public togglePause(): void {
        this.post({ command: 'toggle-pause' });
    }

    public setGraphicsMode(mode: GraphicsMode): void {
        this._graphicsMode = mode;
        this.post({ command: 'set-graphics', mode });
    }

    public toggleGraphicsMode(): GraphicsMode {
        const next: GraphicsMode =
            this._graphicsMode === 'classic' ? 'modern' : 'classic';
        this.setGraphicsMode(next);
        return next;
    }

    public setTextSize(size: string): void {
        this.post({ command: 'set-text-size', size });
    }

    protected getHtml(webview: vscode.Webview): string {
        const media = (...parts: string[]) =>
            webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'media', ...parts),
            );
        const nonce = getNonce();
        const scripts = ['calendar.js', 'renderer.js', 'scenes.js', 'engine.js']
            .map(
                (f) =>
                    `<script nonce="${nonce}" src="${media(f)}"></script>`,
            )
            .join('\n    ');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${media('castaway.css')}" rel="stylesheet">
    <title>Castaway</title>
</head>
<body>
    <canvas id="islandCanvas"></canvas>
    ${scripts}
    <script nonce="${nonce}">castawayApp.start('islandCanvas', '${this._graphicsMode}', '${getConfiguredTextSize()}');</script>
</body>
</html>`;
    }

    public dispose(): void {
        while (this._disposables.length) {
            this._disposables.pop()?.dispose();
        }
    }
}

class IslandPanel extends IslandContainer {
    public static currentPanel: IslandPanel | undefined;
    public static readonly viewType = 'castawayPanel';

    private constructor(
        private readonly _panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        graphicsMode: GraphicsMode,
    ) {
        super(extensionUri, graphicsMode);
        this._panel.webview.html = this.getHtml(this._panel.webview);
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(
            handleWebviewMessage,
            null,
            this._disposables,
        );
    }

    public static createOrShow(extensionUri: vscode.Uri): IslandPanel {
        if (IslandPanel.currentPanel) {
            IslandPanel.currentPanel._panel.reveal();
            return IslandPanel.currentPanel;
        }
        const panel = vscode.window.createWebviewPanel(
            IslandPanel.viewType,
            '🏝️ Castaway',
            vscode.ViewColumn.Two,
            getWebviewOptions(extensionUri),
        );
        IslandPanel.currentPanel = new IslandPanel(
            panel,
            extensionUri,
            getConfiguredGraphicsMode(),
        );
        return IslandPanel.currentPanel;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        IslandPanel.currentPanel = new IslandPanel(
            panel,
            extensionUri,
            getConfiguredGraphicsMode(),
        );
    }

    protected getWebview(): vscode.Webview {
        return this._panel.webview;
    }

    public dispose(): void {
        IslandPanel.currentPanel = undefined;
        this._panel.dispose();
        super.dispose();
    }
}

class IslandViewProvider
    extends IslandContainer
    implements vscode.WebviewViewProvider
{
    public static readonly viewType = 'castawayView';
    private _view?: vscode.WebviewView;

    public resolveWebviewView(view: vscode.WebviewView): void {
        this._view = view;
        view.webview.options = getWebviewOptions(this._extensionUri);
        view.webview.html = this.getHtml(view.webview);
        view.webview.onDidReceiveMessage(
            handleWebviewMessage,
            null,
            this._disposables,
        );
        view.onDidDispose(() => (this._view = undefined));
    }

    public visible(): boolean {
        return this._view !== undefined;
    }

    protected getWebview(): vscode.Webview {
        if (!this._view) {
            throw new Error(
                'Castaway view is not open — reveal it in the Explorer first.',
            );
        }
        return this._view.webview;
    }
}

let viewProvider: IslandViewProvider;

/** The container the user is currently looking at (panel wins if open). */
function activeContainer(extensionUri: vscode.Uri): IslandContainer {
    if (IslandPanel.currentPanel) {
        return IslandPanel.currentPanel;
    }
    if (getConfiguredPosition() === 'explorer' && viewProvider.visible()) {
        return viewProvider;
    }
    return IslandPanel.createOrShow(extensionUri);
}

function updatePositionContext() {
    void vscode.commands.executeCommand(
        'setContext',
        'vscode-castaway.position',
        getConfiguredPosition(),
    );
}

export function activate(context: vscode.ExtensionContext) {
    updatePositionContext();

    viewProvider = new IslandViewProvider(
        context.extensionUri,
        getConfiguredGraphicsMode(),
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            IslandViewProvider.viewType,
            viewProvider,
        ),
    );

    const register = (id: string, fn: () => void) =>
        context.subscriptions.push(vscode.commands.registerCommand(id, fn));

    register('vscode-castaway.start', () => {
        IslandPanel.createOrShow(context.extensionUri);
    });

    register('vscode-castaway.next-scene', () => {
        activeContainer(context.extensionUri).nextScene();
    });

    register('vscode-castaway.toggle-pause', () => {
        activeContainer(context.extensionUri).togglePause();
    });

    register('vscode-castaway.toggle-graphics', () => {
        const mode = activeContainer(context.extensionUri).toggleGraphicsMode();
        void vscode.window.showInformationMessage(
            `Castaway graphics: ${mode}`,
        );
    });

    register('vscode-castaway.order-package', () => {
        activeContainer(context.extensionUri).setScene('droneDelivery');
    });

    register('vscode-castaway.check-phone', () => {
        const scene =
            PHONE_SCENES[Math.floor(Math.random() * PHONE_SCENES.length)];
        activeContainer(context.extensionUri).setScene(scene);
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-castaway.choose-scene', async () => {
            const pick = await vscode.window.showQuickPick(
                SCENES.map((s) => ({
                    label: s.label,
                    detail: s.detail,
                    id: s.id,
                })),
                { placeHolder: 'What should the castaway do?' },
            );
            if (pick) {
                activeContainer(context.extensionUri).setScene(pick.id);
            }
        }),
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('vscode-castaway.position')) {
                updatePositionContext();
            }
            if (e.affectsConfiguration('vscode-castaway.graphicsMode')) {
                const mode = getConfiguredGraphicsMode();
                IslandPanel.currentPanel?.setGraphicsMode(mode);
                if (viewProvider.visible()) {
                    viewProvider.setGraphicsMode(mode);
                }
            }
            if (e.affectsConfiguration('vscode-castaway.textSize')) {
                const size = getConfiguredTextSize();
                IslandPanel.currentPanel?.setTextSize(size);
                if (viewProvider.visible()) {
                    viewProvider.setTextSize(size);
                }
            }
        }),
    );

    // Restore the panel after a window reload.
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(IslandPanel.viewType, {
            deserializeWebviewPanel(panel: vscode.WebviewPanel) {
                panel.webview.options = getWebviewOptions(context.extensionUri);
                IslandPanel.revive(panel, context.extensionUri);
                return Promise.resolve();
            },
        });
    }
}

export function deactivate() {
    IslandPanel.currentPanel?.dispose();
}
