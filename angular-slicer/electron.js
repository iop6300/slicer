const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

// Backend server setup
const backendApp = express();
const port = 3000;

backendApp.get('/', (req, res) => {
  res.send('Hello from the backend integrated in Electron!');
});

// Keep a reference to the server
let server;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the built Angular app
  mainWindow.loadFile(path.join(__dirname, 'dist/angular-slicer/browser/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Start the backend server
  server = backendApp.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Quit the backend server when the app closes
app.on('will-quit', () => {
  if (server) {
    server.close();
  }
});
