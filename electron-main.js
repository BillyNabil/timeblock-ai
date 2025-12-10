const { app, BrowserWindow, screen, protocol } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "TimeBlock.ai",
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, 'public', 'icon.png')
    });

    if (app.isPackaged) {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'out', 'index.html'),
            protocol: 'file:',
            slashes: true
        })).catch(err => {
            console.error('Failed to load local file:', err);
        });
    } else {
        mainWindow.loadURL('http://localhost:3000').catch(err => {
            console.error('Failed to load URL:', err);
        });
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    }

    // Handle console messages from renderer
    mainWindow.webContents.on('console-message', (event, level, message) => {
        console.log('Renderer:', message);
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
