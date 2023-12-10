const { app, BrowserWindow, ipcMain, screen, dialog } = require("electron");
const path = require("path");
const url = require("url");
//var net = require('net');
const dgram = require('node:dgram')
const { Buffer } = require('node:buffer');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    let factor = primaryDisplay.scaleFactor;

    // Create the browser window.
    win = new BrowserWindow({
        width,
        height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            //zoomFactor: 1.0 / factor
        },
    });

    // and load the index.html of the app.
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "app", "index.html"),
            protocol: "file:",
            slashes: true,
        })
    );

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

//var tcpClient = new net.Socket();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
var remotePort = 0
var remoteAddr = ""
ipcMain.on("connect", (event, ...arg) => {
    console.log("connect" + arg);
    var data = JSON.parse(arg)
    var dataBuffer = new Buffer.from(JSON.stringify(data));

    // tcpClient.connect(data.port, data.ipaddress, function () {
    //     console.log('Connected...');
    // });
    const udpClient = dgram.createSocket('udp4');
    udpClient.send(dataBuffer, data.port, data.ipaddress, (err) => {
        if (err) {
            console.error(`Failed to send packet to => ${data.ipaddress}:${data.port}`)
        } else {
            console.log(`Connected to server => ${data.ipaddress}:${data.port}`)
            remotePort = data.port
            remoteAddr = data.ipaddress
            udpClient.on("acknowledgement", (message, info) => {
                console.log(`Acknowledgement from:  => ${data.ipaddress}:${data.port}`)
                udpClient.close()
            })
        }
    })
});

ipcMain.on("disconnect", (event, ...arg) => {
    console.log("disconnect" + arg);
    // if (!tcpClient.closed) {
    //     tcpClient.end();
    // }
    console.log(`Disconnected from server => ${remoteAddr}:${remotePort}`)
    remotePort = 0
    remoteAddr = ""
})

ipcMain.on("relayconfig", (event, ...arg) => {
    //if (!tcpClient.closed) {
    if (remotePort != 0 && remoteAddr != "") {
        //var data = JSON.parse(arg)
        //var dataBuffer = new Buffer.from(JSON.stringify(data));
        var data = arg[0]
        var dataBuffer = new Buffer.from(data);

        //tcpClient.write(dataBuffer);
        const udpClient = dgram.createSocket('udp4');
        udpClient.send(dataBuffer, remotePort, remoteAddr, (err) => {
            if (err) {
                console.error(`Failed to send packet to => ${remotePort}:${remotePort}`)
            } else {
                console.log(`Sending relay config:  ${data} => ${remotePort}:${remotePort}`)
                udpClient.on("acknowledgement", (message, info) => {
                    dialog.showErrorBox('Acknowledgement', `Acknowledgement from:  => ${data.ipaddress}:${data.port}`)
                    console.log(`Acknowledgement from:  => ${remotePort}:${remotePort}`)
                    udpClient.close()
                })
            }
        })

    }
});