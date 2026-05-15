import { Notice } from "obsidian";

// SVG Icons

const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
  <path d="M318-120q-82 0-140-58t-58-140q0-40 15-76t43-64l134-133 56 56-134 134q-17 17-25.5 38.5T200-318q0 49 34.5 83.5T318-200q23
  0 45-8.5t39-25.5l133-134 57 57-134 133q-28 28-64 43t-76 15Zm79-220-57-57 223-223 57 57-223 223Zm251-28-56-57 134-133q17-17 
  25-38t8-44q0-50-34-85t-84-35q-23 0-44.5 8.5T558-726L425-592l-57-56 134-134q28-28 64-43t76-15q82 
  0 139.5 58T839-641q0 39-14.5 75T782-502L648-368Z"/></svg>`,

  error: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
  <path d="m770-302-60-62q40-11 65-42.5t25-73.5q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 57-29.5 105T770-302ZM634-440l-80-80h86v80h-6ZM792-56
   56-792l56-56 736 736-56 56ZM440-280H280q-83 0-141.5-58.5T80-480q0-69 42-123t108-71l74 74h-24q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h65l79 80H320Z"/></svg>`,
} as const;

export type NoticeIcon = keyof typeof ICONS;

export interface NoticeOptions {
  /** SVG icon to show. Defaults to "success". */
  icon?: NoticeIcon;
  /** How long to show the notice in ms. Defaults to 2500. */
  duration?: number;
  /** The message to display. */
  message: string;
}

/**
 * Creates a styled Obsidian Notice with an SVG icon.
 * Returns the Notice instance in case the caller needs to hide it early.
 */
export function showNotice({ icon = "success", duration = 2000, message }: NoticeOptions): Notice {
  const notice = new Notice("", duration);

  Object.assign(notice.messageEl.style, {
    display: "flex",
    gap: "10px",
    "align-items": "center",
  });

  const iconEl = notice.messageEl.createSpan({ cls: "notice-icon" });
  iconEl.innerHTML = ICONS[icon];

  const textEl = notice.messageEl.createSpan({ cls: "notice-text" });
  textEl.innerHTML = message;

  return notice;
}
