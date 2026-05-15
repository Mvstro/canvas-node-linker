"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CanvasNodeLinker
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/NoticeBuilder.ts
var import_obsidian = require("obsidian");
var ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
  <path d="M318-120q-82 0-140-58t-58-140q0-40 15-76t43-64l134-133 56 56-134 134q-17 17-25.5 38.5T200-318q0 49 34.5 83.5T318-200q23
  0 45-8.5t39-25.5l133-134 57 57-134 133q-28 28-64 43t-76 15Zm79-220-57-57 223-223 57 57-223 223Zm251-28-56-57 134-133q17-17 
  25-38t8-44q0-50-34-85t-84-35q-23 0-44.5 8.5T558-726L425-592l-57-56 134-134q28-28 64-43t76-15q82 
  0 139.5 58T839-641q0 39-14.5 75T782-502L648-368Z"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
  <path d="m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56
   56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z"/></svg>`
};
function showNotice({ icon = "success", duration = 2e3, message }) {
  const notice = new import_obsidian.Notice("", duration);
  Object.assign(notice.messageEl.style, {
    display: "flex",
    gap: "10px",
    "align-items": "center"
  });
  const iconEl = notice.messageEl.createSpan({ cls: "notice-icon" });
  iconEl.innerHTML = ICONS[icon];
  const textEl = notice.messageEl.createSpan({ cls: "notice-text" });
  textEl.innerHTML = message;
  return notice;
}

// src/settings.ts
var import_obsidian2 = require("obsidian");
var DEFAULT_SETTINGS = {
  includeTitle: true,
  headingLevel: "first",
  showNotices: true
};
var CanvasNodeLinkerSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "provola" });
    let dropdownRef;
    const includeHeading = new import_obsidian2.Setting(containerEl).setName("Include title in link").setDesc(
      "When enabled, the copied link will use the node's heading as display text: [[file.canvas#id|Title]].\nWhen disabled, only the bare link is copied: [[file.canvas#id]]."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeTitle).onChange(async (value) => {
        this.plugin.settings.includeTitle = value;
        headingSettings.settingEl.style.opacity = value ? "1" : "0.5";
        dropdownRef.selectEl.disabled = !value;
        await this.plugin.saveSettings();
      })
    );
    const headingSettings = new import_obsidian2.Setting(containerEl).setName("Heading level").setDesc(
      'Which heading level to use as the link title. "Any" picks the first heading of any level (H1\u2013H6).'
    ).addDropdown((dropdown) => {
      dropdownRef = dropdown;
      const options = {
        first: "Any",
        h1: "H1",
        h2: "H2",
        h3: "H3",
        h4: "H4",
        h5: "H5",
        h6: "H6"
      };
      for (const [value, label] of Object.entries(options)) {
        dropdown.addOption(value, label);
      }
      dropdown.setValue(this.plugin.settings.headingLevel).onChange(async (value) => {
        this.plugin.settings.headingLevel = value;
        await this.plugin.saveSettings();
      });
    });
    headingSettings.settingEl.style.opacity = this.plugin.settings.includeTitle ? "1" : "0.5";
    dropdownRef.selectEl.disabled = !this.plugin.settings.includeTitle;
    new import_obsidian2.Setting(containerEl).setName("Show notifications").setDesc(
      "Show pop-up notices for successful copies and errors.\nDisable for a quieter experience."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showNotices).onChange(async (value) => {
        this.plugin.settings.showNotices = value;
        await this.plugin.saveSettings();
      })
    );
  }
};

// src/main.ts
var CanvasNodeLinker = class extends import_obsidian3.Plugin {
  // Lifecycle
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CanvasNodeLinkerSettingTab(this.app, this));
    this.registerEvent(
      this.app.workspace.on(
        "canvas:node-menu",
        (menu, node) => {
          menu.addItem(
            (item) => item.setTitle("Copy Node Link").setIcon("link").onClick(() => this.handleLink(node))
          );
        }
      )
    );
  }
  // Settings persistence 
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  // Core logic 
  async handleLink(node) {
    const canvas = node?.canvas;
    const file = canvas?.view?.file ?? canvas?.file ?? null;
    if (!(file instanceof import_obsidian3.TFile)) {
      this.notify("error", "Error: unable to find canvas file.");
      return;
    }
    const id = node.id;
    if (!id) {
      this.notify("error", "Error: unable to read the node id.");
      return;
    }
    const title = this.settings.includeTitle ? await this.resolveTitle(node, file, id) : null;
    const canvasPath = file.path;
    const link = title ? `[[${canvasPath}#${id}|${title}]]` : `[[${canvasPath}#${id}]]`;
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
  async resolveTitle(node, file, id) {
    let nodeType = node.type ?? "";
    let nodeText = node.text ?? "";
    let nodeLabel = node.label ?? "";
    if (!nodeType || !nodeText && !nodeLabel) {
      try {
        const raw = await this.app.vault.read(file);
        const json = JSON.parse(raw);
        const found = (json.nodes ?? []).find((n) => n.id === id);
        if (found) {
          nodeType = found.type ?? nodeType;
          nodeText = found.text ?? nodeText;
          nodeLabel = found.label ?? nodeLabel;
        }
      } catch {
        this.notify("error", "Error: unable to read json");
      }
    }
    if (nodeType === "group") {
      return nodeLabel ? this.escapeHTML(nodeLabel.trim()) : null;
    }
    return this.extractHeading(nodeText, this.settings.headingLevel);
  }
  // Helpers
  /**
   * Shows a notice only if the user has enabled them in settings.
   */
  notify(icon, message) {
    if (!this.settings.showNotices) return;
    showNotice({ icon, message });
  }
  escapeHTML(input) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;"
    };
    return input.replace(/[&<>"'`]/g, (char) => map[char]);
  }
  /**
   * Extracts a heading from raw markdown text according to the configured
   * heading level preference.
   *
   * - "first": returns the first heading of any level (H1–H6)
   * - "h1"–"h6": returns the first heading of exactly that level
   */
  extractHeading(text, level = "first") {
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
};
