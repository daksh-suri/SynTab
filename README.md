# SynTab

SynTab is a Manifest V3 browser extension for Chrome and Edge. Its popup lists every open window with its tabs, so you can search, switch, close, and save them. Named sessions capture a set of tabs you can restore later in a new window.

## Features

- **All windows in one list** — every normal window with its tabs, grouped and counted. Collapse windows you do not need; use Collapse all / Expand all.
- **Search across tabs** — filter by title or URL, case-insensitive. Matching tabs stay visible even inside collapsed windows.
- **Multi-select and bulk close** — tick tabs, then Close Selected. The selection count stays visible while you work.
- **Save sessions** — save every tab, or only the selected tabs. Duplicate names get `(1)`, `(2)` suffixes automatically.
- **Editable sessions** — open Edit on a saved session to rename it, add tabs from your open windows, remove or reorder tabs, open a single tab, and filter the session's own list.
- **Restore in a new window** — one click reopens the session's tabs together.
- **Real site icons** — tabs and sessions show the site's favicon, with a letter tile when a site has none and a light plate so dark icons stay visible.
- **Light and dark** — the interface follows your system theme.

## Install

SynTab is installed as an unpacked extension from the latest release:

1. Download **syntab.zip** from the [latest release](https://github.com/daksh-suri/SynTab/releases/latest) and extract it to a folder. The folder must contain `manifest.json`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the extracted folder.
5. Pin SynTab from the puzzle-piece toolbar menu.

Chrome and Edge share the same extension format; the same folder works in both.

## Usage

- Tick a tab's checkbox to add it to the selection. The bulk bar shows how many tabs are selected.
- **Save Selected Tabs** stores only the ticked tabs and clears the selection. **Save All Tabs** stores every tab.
- Pressing Enter in the session-name field saves the selected tabs; if nothing is selected it asks you to select a tab first.
- On a saved session, **Restore** opens its tabs in a new window, **Edit** opens the session editor, and **Delete** removes it.

## Permissions and privacy

SynTab asks for `tabs`, `windows`, `storage`, and `favicon`:

- `tabs` and `windows` list and manage open tabs and windows.
- `storage` keeps your saved sessions in the browser profile.
- `favicon` shows the browser's locally cached site icons.

Sessions are stored only on your device in `chrome.storage.local`. There is no account, no server, and no network request. A saved session stores each tab's title, URL, and (when available) icon URL; pages that are not `http` or `https` are never saved. Restoring a session opens new tabs from the stored URLs.
