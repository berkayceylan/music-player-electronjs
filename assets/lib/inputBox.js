const {BrowserWindow, ipcMain} = require("electron");

class InputBox{
    constructor(parent, message){
        this.parent = parent;
        this.message = message;
        
    }

    static createInputBox(text, parent, callback, ans = ""){
        this.resp = "";
        this.inputBox = new BrowserWindow({
            width: 500,
            height: 300,
            webPreferences: {
                nodeIntegration: true
            },
            parent: parent,
            modal: true,
        });
        this.inputBox.loadFile("./assets/inputBox.html");
        this.inputBox.on("close", () => {
            this.inputBox = null;
        });
        this.inputBox.webContents.once("dom-ready", ()=> {
            this.inputBox.webContents.send("inf", {
                 text,
                 ans
            })
            
        });
        ipcMain.once("answer", (e, data) => {
            callback(data);
            this.inputBox.close();
        });
    }
   
       
     
}
module.exports = InputBox;