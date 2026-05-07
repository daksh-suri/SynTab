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

export function createSession(name,windows){
    const tabs = windows
            .flatMap(window=>window.tabs)
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