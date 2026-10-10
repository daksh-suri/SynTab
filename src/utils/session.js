function createId(){
    // checking if uuid is suppported or not 
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return String(Date.now());
}

function isRestorableUrl(url){
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

export function createSession(name,windows,selectedTabIds = null){
    const allTabs = windows.flatMap(window=>window.tabs);
    const scopedTabs = selectedTabIds?.size
        ? allTabs.filter(tab=>selectedTabIds.has(tab.id))
        : allTabs;
    const tabs = scopedTabs
            .filter(tab=>isRestorableUrl(tab.url))
            .map(tab=>({
                title : tab.title,
                url : tab.url,
            }))
    return {
        id : createId(),
        name : name.trim(),
        createdAt : new Date().toISOString(),
        tabs
    }
}