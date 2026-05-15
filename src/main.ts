import { Plugin, TFile, Menu } from "obsidian";
import { showNotice } from "./NoticeBuilder";
import { CanvasNodeLinkerSettings, CanvasNodeLinkerSettingTab, DEFAULT_SETTINGS, HeadingLevel, } from "./settings";

export default class CanvasNodeLinker extends Plugin {
  settings!: CanvasNodeLinkerSettings;

  // Lifecycle

  async onload(): Promise<void> {

    await this.loadSettings();
    this.addSettingTab(new CanvasNodeLinkerSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on(
        "canvas:node-menu" as any,
        (menu: Menu, node: any) => {
          menu.addItem((item) =>
            item
              .setTitle("Copy Node Link")
              .setIcon("link")
              .onClick(() => this.handleLink(node))
          );
        }
      )
    );
  }

  // Settings persistence 

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  // Core logic 

  private async handleLink(node: any): Promise<void> {
    const canvas = node?.canvas;
    const file: TFile | null = canvas?.view?.file ?? canvas?.file ?? null;

    if (!(file instanceof TFile)) {
      this.notify("error", "Error: unable to find canvas file.");
      return;
    }

    const id: string | undefined = node.id;
    if (!id) {
      this.notify("error", "Error: unable to read the node id.");
      return;
    }

    const title = this.settings.includeTitle ? await this.resolveTitle(node, file, id) : null;

    const canvasPath = file.path;
    const link = title
      ? `[[${canvasPath}#${id}|${title}]]`
      : `[[${canvasPath}#${id}]]`;

    try {
      await navigator.clipboard.writeText(link);
      this.notify("success", `Copied${title ? `: ${title}` : ": no title found"}`);
    } catch {
      this.notify("error", "Error: unable to access notes.");
    }
  }

  /**
   * Returns the node's label if it's a group, text content otherwise
   * falling back to a JSON parse of the
   * canvas file if the live node object doesn't expose it.
   */
  private async resolveTitle(node: any, file: TFile, id: string): Promise<string  |  null> {
    let nodeType: string = node.type ?? "";
    let nodeText: string = node.text ?? "";
    let nodeLabel: string = node.label ?? "";

    if(!nodeType || (!nodeText && !nodeLabel)){
      try{
        const raw = await this.app.vault.read(file);
        const json = JSON.parse(raw);
        const found = (json.nodes ?? [] ).find( (n : any) => n.id === id);
        if(found){
          nodeType = found.type ?? nodeType;
          nodeText = found.text ?? nodeText;
          nodeLabel = found.label ?? nodeLabel;
        }
      }catch{
        this.notify("error", "Error: unable to read json");
      }
    }

    if(nodeType === "group"){
      return nodeLabel ? this.escapeHTML(nodeLabel.trim()) : null;
    }
    
    return this.extractHeading(nodeText, this.settings.headingLevel);
  }

  // Helpers

  /**
   * Shows a notice only if the user has enabled them in settings.
   */
  private notify(icon: "success" | "error", message: string): void {
    if (!this.settings.showNotices) return;
    showNotice({ icon, message });
  }

  private escapeHTML(input: string): string {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;",
    } as const;
    return input.replace(/[&<>"'`]/g, (char) => map[char as keyof typeof map]);
  }

  /**
   * Extracts a heading from raw markdown text according to the configured
   * heading level preference.
   *
   * - "first": returns the first heading of any level (H1–H6)
   * - "h1"–"h6": returns the first heading of exactly that level
   */
  extractHeading(text: string, level: HeadingLevel = "first"): string | null {
    const targetDepth = level === "first" ? null : parseInt(level[1], 10);

    for (const line of text.split("\n")) {
      const m = line.match(/^(#{1,6})\s+(.+)/);
      if (!m) continue;

      const depth = m[1].length;
      if (targetDepth === null || depth === targetDepth) {
        return this.escapeHTML(m[2].trim());
      }
    }
    return null;
  }
}
