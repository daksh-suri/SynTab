export function isChromeExtension() {
    return typeof chrome !== 'undefined' && Boolean(chrome.tabs);
}

// Returns an array of objects 
// Each object is a window and has tabs inside it 
export async function getAllWindowsWithTabs() {
    // if not running inside a chrome extension then return an array of dummy windows  
    if (!isChromeExtension()) {
        return [
            {
                id: 1,
                focused: true,
                tabs: [
                    {
                        id: 101,
                        windowId: 1,
                        title: "React Documentation",
                        url: "https://react.dev",
                        favIconUrl: "https://react.dev/favicon.ico"
                    },
                    {
                        id: 102,
                        windowId: 1,
                        title: "Vite Guide",
                        url: "https://vite.dev",
                        favIconUrl: "https://vite.dev/logo.svg"
                    },
                    {
                        id: 103,
                        windowId: 1,
                        title: "MDN Web Docs",
                        url: "https://developer.mozilla.org",
                        favIconUrl: "https://developer.mozilla.org/favicon.ico"
                    },
                    {
                        id: 104,
                        windowId: 1,
                        title: "A Very Long Page Title That Should Ellipsize In The Tab Row Because It Keeps Going And Going",
                        url: "https://example.com/long-title"
                    },
                    {
                        id: 105,
                        windowId: 1,
                        title: "",
                        url: "https://untitled.example.com"
                    },
                    {
                        id: 106,
                        windowId: 1,
                        title: "Chrome Settings",
                        url: "chrome://settings"
                    }
                ]
            },
            {
                id: 2,
                focused: false,
                tabs: [
                    {
                        id: 201,
                        windowId: 2,
                        title: "GitHub",
                        url: "https://github.com",
                        favIconUrl: "https://github.com/favicon.ico"
                    },
                    {
                        id: 202,
                        windowId: 2,
                        title: "React Documentation (duplicate)",
                        url: "https://react.dev",
                        favIconUrl: "https://react.dev/favicon.ico"
                    },
                    {
                        id: 203,
                        windowId: 2,
                        title: "Vite Guide (duplicate)",
                        url: "https://vite.dev",
                        favIconUrl: "https://vite.dev/logo.svg"
                    }
                ]
            },
            {
                id: 3,
                focused: false,
                tabs: [
                    {
                        id: 301,
                        windowId: 3,
                        title: "Figma",
                        url: "https://figma.com",
                        favIconUrl: "https://www.figma.com/favicon.ico"
                    },
                    {
                        id: 302,
                        windowId: 3,
                        title: "Notion",
                        url: "https://notion.so",
                        favIconUrl: "https://www.notion.so/images/favicon.ico"
                    },
                    {
                        id: 303,
                        windowId: 3,
                        title: "Local File",
                        url: "file:///C:/index.html"
                    }
                ]
            }
        ]
    }

    return await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal'],
    })
}

export async function switchToTab(tab) {
    if (!isChromeExtension()) {
        console.log('Switch to tab:', tab);
        return;
    }
    // Making the tab active , Equivalent to clicking the tab
    await chrome.tabs.update(tab.id, { active: true });
    // Focussing the window , bringing it in the front
    await chrome.tabs.update(tab.windowId, { focused: true });
}

export async function closeTab(tabId) {
    if (!isChromeExtension()) {
        console.log('Close tab:', tabId);
        return;
    }
    await chrome.tabs.remove(tabId);
}

export async function closeTabs(tabIds) {
    if (!isChromeExtension()) {
        console.log('Close tab:', tabIds);
        return;
    }
    await chrome.tabs.remove(tabIds);
}

export async function openTab(url) {
    if (!isChromeExtension()) {
        console.log('Open tab:', url);
        return;
    }
    await chrome.tabs.create({ url });
}

//session is an array of tabs
export async function restoreSessionInNewWindow(session) {
    const urls = session.tabs.map(tab => tab.url);
    if (!isChromeExtension()) {
        console.log('Restore Session :', urls);
        return;
    }
    await chrome.windows.create({ url: urls });
}
