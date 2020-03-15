const electron = require("electron");
const path = require("path");
const fs = require("fs");
class Store{
    constructor(opt){
        const userDataPath = (electron.app || electron.remote.app).getPath("userData");
        
        //Set user Data Path
        this.path = path.join(userDataPath, opt.configName +  ".json");
        this.data = parseDataFile(this.path, opt.defaults);
        console.log(this.path);
    }
    get(key){
        this.data = parseDataFile(this.path, "");
        return this.data[key];
    }
    set(key, value){
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

};

function parseDataFile(filePath, defaults){
    
    try{
        return JSON.parse(fs.readFileSync(filePath));
    }catch(err){
        return defaults;
    }
}
module.exports = Store;