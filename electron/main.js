const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

// Deshabilitar aceleración por hardware para evitar crashes en algunos sistemas Linux
app.disableHardwareAcceleration()

// Deshabilitar sandbox para evitar problemas de permisos con AppImage en Linux
app.commandLine.appendSwitch('no-sandbox')

let mainWindow
let serverProcess

// Detectar si estamos en desarrollo (si hay un servidor en localhost:3000)
const isDev = !app.isPackaged
const port = process.env.PORT || 3000
const appRoot = path.join(__dirname, '..')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Stockcito - POS & Inventario',
    icon: path.join(appRoot, 'public', 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false,
  })

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Cargar la app - ir directo al dashboard, no a la landing
  const baseUrl = `http://localhost:${port}`
  const appUrl = `${baseUrl}/dashboard`
  
  // Esperar a que el servidor esté listo
  const checkServer = () => {
    const http = require('http')
    const req = http.get(baseUrl, (res) => {
      mainWindow.loadURL(appUrl)
    })
    req.on('error', () => {
      setTimeout(checkServer, 500)
    })
  }
  
  checkServer()

  // Abrir links externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') && !url.includes('localhost')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // Interceptar navegación para bloquear rutas públicas (landing, docs)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const urlObj = new URL(url)
    const blockedPaths = ['/', '/docs']
    
    // Si intenta ir a una ruta bloqueada, redirigir al dashboard
    if (blockedPaths.includes(urlObj.pathname)) {
      event.preventDefault()
      mainWindow.loadURL(`http://localhost:${port}/dashboard`)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startServer() {
  if (isDev) {
    // En desarrollo, el servidor ya está corriendo via concurrently
    console.log('Modo desarrollo: conectando a servidor existente...')
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    // En producción, el servidor está en extraResources
    const resourcesPath = process.resourcesPath
    const serverPath = path.join(resourcesPath, 'standalone', 'server.js')
    const serverCwd = path.join(resourcesPath, 'standalone')
    
    console.log('Resources path:', resourcesPath)
    console.log('Iniciando servidor desde:', serverPath)
    console.log('CWD del servidor:', serverCwd)
    
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: 'localhost',
      },
      cwd: serverCwd,
    })

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`)
      if (data.toString().includes('Ready') || data.toString().includes('started')) {
        resolve()
      }
    })

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`)
    })

    // Timeout para resolver si el servidor no emite "Ready"
    setTimeout(resolve, 3000)
  })
}

app.whenReady().then(async () => {
  await startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})
