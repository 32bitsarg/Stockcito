const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        // Canales permitidos
        const validChannels = ['restart-app']
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    on: (channel, func) => {
        const validChannels = ['update-available', 'update-ready', 'download-progress']
        if (validChannels.includes(channel)) {
            // Delibery subscripción
            const subscription = (event, ...args) => func(...args)
            ipcRenderer.on(channel, subscription)
            return () => ipcRenderer.removeListener(channel, subscription)
        }
    }
})
