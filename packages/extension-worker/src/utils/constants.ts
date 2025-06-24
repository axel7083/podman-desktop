export enum ProgressLocation {
  /**
   * Show progress bar under app icon in launcher bar.
   */
  APP_ICON = 1,

  /**
   * Show progress in the task manager widget
   */
  TASK_WIDGET = 2,
}

/**
 * Impacts the behavior and appearance of the validation message.
 */
export enum InputBoxValidationSeverity {
  Info = 1,
  Warning = 2,
  Error = 3,
}

/**
 * The kind of {@link QuickPickItem quick pick item}.
 */
export enum QuickPickItemKind {
  /**
   * When a {@link QuickPickItem} has a kind of {@link Separator}, the item is just a visual separator and does not represent a real item.
   * The only property that applies is {@link QuickPickItem.label label }. All other properties on {@link QuickPickItem} will be ignored and have no effect.
   */
  Separator = -1,
  /**
   * The default {@link QuickPickItem.kind} is an item that can be selected in the quick pick.
   */
  Default = 0,
}

export const StatusBarAlignLeft = 'LEFT';
export const StatusBarAlignRight = 'RIGHT';
export const StatusBarItemDefaultPriority = 0;
