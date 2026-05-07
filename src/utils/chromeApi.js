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
                        url: "https://react.dev"
                    },
                    {
                        id: 102,
                        windowId: 1,
                        title: "Vite Guide",
                        url: "https://vite.dev"
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

//session is an array of tabs
export async function restoreSessionInNewWindow(session) {
    const urls = session.tabs.map(tab => tab.url);
    if (!isChromeExtension()) {
        console.log('Restore Session :', urls);
        return;
    }
    await chrome.windows.create({ url: urls });
}
