const callbacks = new Map();

export function registerCallback(fn) {
    const key = `cb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    callbacks.set(key, fn);
    return key;
}

export function getCallback(key) {
    return callbacks.get(key);
}

export function removeCallback(key) {
    callbacks.delete(key);
}

export default { registerCallback, getCallback, removeCallback };
