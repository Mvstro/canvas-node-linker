import { App, PluginSettingTab, Setting } from "obsidian";

// Types

/**
 * Which heading level to use as the link title.
 * "first" means the first heading of any level found in the node text.
 */
export type HeadingLevel = "first" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface CanvasNodeLinkerSettings {
  /** Whether to include the heading title in the generated link. */
  includeTitle: boolean;
  /** Which heading level to extract as the title (only used when includeTitle is true). */
  headingLevel: HeadingLevel;
  /** Whether to show notices (success, error) during copy operations. */
  showNotices: boolean;
}

export const DEFAULT_SETTINGS: CanvasNodeLinkerSettings = {
  includeTitle: true,
  headingLevel: "first",
  showNotices: true,
};

// Settings Tab

interface PluginWithSettings {
  settings: CanvasNodeLinkerSettings;
  saveSettings(): Promise<void>;
}

export class CanvasNodeLinkerSettingTab extends PluginSettingTab {
  plugin: PluginWithSettings;
  constructor(app: App, plugin: PluginWithSettings) {
    super(app, plugin as any);
    this.plugin = plugin;
    
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", {text: "provola"});

    // Section: Link format

    let dropdownRef: any;

    const includeHeading = new Setting(containerEl)
      .setName("Include title in link")
      .setDesc(
        "When enabled, the copied link will use the node's heading as display text: [[file.canvas#id|Title]].\n" +
        "When disabled, only the bare link is copied: [[file.canvas#id]]."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeTitle)
          .onChange(async (value) => {
            this.plugin.settings.includeTitle = value;
            headingSettings.settingEl.style.opacity = value ? "1" : "0.5";
            dropdownRef.selectEl.disabled = !value;
            await this.plugin.saveSettings();
          })
      );
    
      const headingSettings = new Setting(containerEl)
        .setName("Heading level")
        .setDesc(
          "Which heading level to use as the link title. " +
          '"Any" picks the first heading of any level (H1–H6).'
        )
        .addDropdown((dropdown) => {
          dropdownRef = dropdown;
          const options: Record<HeadingLevel, string> = {
            first: "Any",
            h1: "H1",
            h2: "H2",
            h3: "H3",
            h4: "H4",
            h5: "H5",
            h6: "H6",
          };

          for (const [value, label] of Object.entries(options)) {
            dropdown.addOption(value, label);
          }

          dropdown
            .setValue(this.plugin.settings.headingLevel)
            .onChange(async (value) => {
              this.plugin.settings.headingLevel = value as HeadingLevel;
              await this.plugin.saveSettings();
            });
        });
    headingSettings.settingEl.style.opacity = this.plugin.settings.includeTitle ? "1" : "0.5";
    dropdownRef.selectEl.disabled = !this.plugin.settings.includeTitle;    

    // Section: Notifications

    new Setting(containerEl)
      .setName("Show notifications")
      .setDesc(
        "Show pop-up notices for successful copies and errors.\n" +
        "Disable for a quieter experience."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotices)
          .onChange(async (value) => {
            this.plugin.settings.showNotices = value;
            await this.plugin.saveSettings();
          })
      );

    
  }

}
