export function createId(){
    // checking if uuid is suppported or not 
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return String(Date.now());
}

export function isRestorableUrl(url){
    return url && (url.startsWith('http://') || url.startsWith('https://'));
}

export function resolveUniqueSessionName(name,sessions){
    const base = name.trim();
    const taken = new Set(sessions.map(session=>session.name.toLowerCase()));
    if (!taken.has(base.toLowerCase())) return base;
    let counter = 1;
    while (taken.has(`${base} (${counter})`.toLowerCase())) counter++;
    return `${base} (${counter})`;
}

export function normalizeSession(session){
    const tabs = Array.isArray(session.tabs) ? session.tabs : [];
    return {
        ...session,
        updatedAt : session.updatedAt || session.createdAt || new Date().toISOString(),
        tabs : tabs.map(tab=>({
            ...tab,
            id : tab.id || createId()
        }))
    }
}

export function createSession(name,windows,selectedTabIds = null){
    const allTabs = windows.flatMap(window=>window.tabs);
    const scopedTabs = selectedTabIds?.size
        ? allTabs.filter(tab=>selectedTabIds.has(tab.id))
        : allTabs;
    const tabs = scopedTabs
            .filter(tab=>isRestorableUrl(tab.url))
            .map(tab=>({
                id : createId(),
                title : tab.title,
                url : tab.url,
                favIconUrl : isRestorableUrl(tab.favIconUrl) ? tab.favIconUrl : undefined
            }))
    const now = new Date().toISOString();
    return {
        id : createId(),
        name : name.trim(),
        createdAt : now,
        updatedAt : now,
        tabs
    }
}