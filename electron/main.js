const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const { autoUpdater } = require('electron-updater')

// Deshabilitar aceleración por hardware para evitar crashes en algunos sistemas Linux
app.disableHardwareAcceleration()

// Deshabilitar sandbox para evitar problemas de permisos con AppImage en Linux
app.commandLine.appendSwitch('no-sandbox')

let mainWindow
let serverProcess
let currentUpdateStatus = 'none' // 'none', 'available', 'ready'

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
    icon: path.join(isDev ? appRoot : app.getAppPath(), 'public', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
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

  // Esperar a que el servidor esté listo con timeout mejorado
  let attempts = 0
  const checkServer = () => {
    const http = require('http')
    const req = http.get(baseUrl, (res) => {
      console.log('Servidor Next.js detectado, cargando URL...')
      mainWindow.loadURL(appUrl)

      // Si ya detectamos un update mientras el server levantaba, avisarle al UI
      if (currentUpdateStatus !== 'none') {
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send(currentUpdateStatus === 'ready' ? 'update-ready' : 'update-available')
          }
        }, 1000) // Pequeño delay para asegurar que el componente de React se montó
      }
    })

    req.on('error', () => {
      attempts++
      if (attempts > 60) { // ~30 segundos
        console.error('El servidor no arrancó a tiempo.')
        mainWindow.show() // Mostrar ventana aunque cargue error para que el usuario sepa que algo pasó
        return
      }
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

  return new Promise((resolve, reject) => {
    // En producción, el servidor está en extraResources
    const resourcesPath = process.resourcesPath
    const serverPath = path.join(resourcesPath, 'standalone', 'server.js')
    const serverCwd = path.join(resourcesPath, 'standalone')

    // Cargar variables de entorno explícitamente en producción
    const dotenv = require('dotenv')
    const envPath = path.join(serverCwd, '.env')
    const envConfig = dotenv.config({ path: envPath })

    // Setup logging to file for debugging
    const fs = require('fs')
    const logPath = path.join(app.getPath('userData'), 'server.log')
    const log = (msg) => {
      console.log(msg)
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`)
    }

    log('Iniciando servidor Next.js standalone...')
    log(`Server Path: ${serverPath}`)
    log(`Env Path: ${envPath}`)

    if (envConfig.error) {
      log(`Error cargando .env: ${envConfig.error}`)
    } else {
      log('.env cargado correctamente')
    }

    // Usar el propio ejecutable de Electron para correr el script de Node
    // Esto garantiza que funcione aunque no haya Node.js instalado globalmente
    serverProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: 'localhost',
        ELECTRON_RUN_AS_NODE: '1' // Truco clave para que Electron actúe como Node pura
      },
      cwd: serverCwd,
    })

    serverProcess.stdout.on('data', (data) => {
      log(`Server: ${data}`)
      if (data.toString().includes('Ready') || data.toString().includes('started') || data.toString().includes('Listening')) {
        resolve()
      }
    })

    serverProcess.stderr.on('data', (data) => {
      log(`Server Error: ${data}`)
    })

    serverProcess.on('close', (code) => {
      log(`Server process exited with code ${code}`)
    })

    // Timeout para resolver si el servidor no emite "Ready"
    // Aumentado a 10s para dar tiempo en máquinas lentas
    setTimeout(() => {
      log('Timeout esperando al servidor, resolviendo de todas formas...')
      resolve()
    }, 10000)
  })
}

app.whenReady().then(async () => {
  // Configurar autoUpdater ANTES de esperar al servidor (corre en paralelo)
  // Los event listeners se registran primero para no perder ningún evento
  if (!isDev) {
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', () => {
      console.log('Update available, downloading...')
      currentUpdateStatus = 'available'
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-available')
      }
    })

    autoUpdater.on('download-progress', (progress) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-progress', progress.percent)
      }
    })

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, ready to install')
      currentUpdateStatus = 'ready'
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-ready')
      }
    })

    autoUpdater.on('error', (err) => {
      console.error('Error en autoUpdater:', err)
    })

    // Lanzar check en paralelo (no bloqueante)
    // Usa checkForUpdates() en vez de checkForUpdatesAndNotify()
    // porque tenemos nuestro propio UI de notificacion
    autoUpdater.checkForUpdates().catch(err => {
      console.error('Error checking for updates:', err)
    })
  }

  // Mientras el updater ya corre, levantamos el servidor y la ventana
  await startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// IPC para forzar el reinicio e instalación
ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall()
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
