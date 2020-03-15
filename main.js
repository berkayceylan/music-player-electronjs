const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const Playlist = require(__dirname + "/assets/lib/playlist.js");
const InputBox = require(__dirname + "/assets/lib/inputBox.js");
const musicMetadata = require("music-metadata");
// var mpg = require("mpg123");
// const { createAudio } = require('node-mp3-player')
// const Audio = createAudio();
// const sound = require('sound-play')
var playlist = new Playlist();
global.playlist = playlist;
// var inputBox;
app.on("ready", () => {
    

    let mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile("./index.html");
    mainWindow.on("close", () => {
        mainWindow = null;
    });

    


    ipcMain.on("addPlaylist", () => {
        //createInputBox("Playlist ismini giriniz...", mainWindow);
        InputBox.createInputBox("Playlist ismini giriniz.", mainWindow, (data) => {
            global.playlist.addPlaylist(data);
            mainWindow.webContents.send("playlistChanged");
        });
    });

    ipcMain.on("addItem", async(e, data) => {
        var opt = {
            properties: ["multiSelections", "openFile"],
            filters: [
                {name: "Mp3 Files", extensions: ["mp3"]}
            ]
        }
        const files = await dialog.showOpenDialog(mainWindow, opt);
        files.filePaths.forEach(async (item) => {
            global.playlist.addItem(data, item);
        });
        // console.log(files + "-" + data);
        mainWindow.webContents.send("playlistChanged");
    });

    ipcMain.on("deletePlaylist", async(e, data) => {
        const res = await dialog.showMessageBox(mainWindow,{
            type: "question",
            title: "Confirm",
            message: "Do you want delete this playlist?",
            buttons: ["No", "Yes"]
        });
        if(res.response == 1){
            global.playlist.removePlaylist(data);
            mainWindow.webContents.send("playlistChanged");
        }
        // playlist.removePlaylist(data);
    });
    ipcMain.on("deleteItem", async(e, data) => {
        const res = await dialog.showMessageBox(mainWindow,{
            type: "question",
            title: "Confirm",
            message: "Do you want delete this music from playlist?",
            buttons: ["No", "Yes"]
        });
        if(res.response == 1){
            global.playlist.removeItem(data.playlistInx, data.itemInx);
            mainWindow.webContents.send("playlistChanged");
        }
        // playlist.removePlaylist(data);
    });
    
    ipcMain.on("editPlaylist", (e, inx) => {
        InputBox.createInputBox("Yeni isimi giriniz", mainWindow, (resp) => {
            global.playlist.editPlaylist(inx, resp);
            mainWindow.webContents.send("playlistChanged");
        }, global.playlist.getPlaylist(inx));
    });
    
    ipcMain.on("songChanged", (e, data)=>{
        musicMetadata.parseFile(data).then(metadata => {
            // console.log(util.inspect(metadata, false, null));
            mainWindow.webContents.send("metadata", metadata);
        }).catch(err => {
            var a = dialog.showMessageBoxSync(mainWindow,{
                type: "question",
                message: "This song can't playing. Do you want delete it of the list?",
                title: "Play Error !",
                buttons: ["Yes", "No"]
            });
            if(a == 0){
                global.playlist.removeItem(global.playlist.getPlaylistInx(), global.playlist.getItemInx());
                mainWindow.webContents.send("playlistChanged");
            }

        })
    });

});


var menuTemplate = []
var menu = Menu.buildFromTemplate(menuTemplate);
// app.applicationMenu = menu;
app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});

