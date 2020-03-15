const store = require(__dirname + "/assets/lib/store.js");
class BcPlayer{
    constructor(){
        this.el = document.createElement("audio")
        //r = repeat
        this.rAll = true;
        this.rRandon = false;

        this.itemInx = -1;
        this.activePlaylistInx = -1;

        this.isPlay = true;

        this.el.volume = .5;

        this.status = "stopped"
        this.mod="repeatAll";

        this.list = [];
        //names for backend, classes for frontend
        this.mods = [
            {
                name: "repeatAll",
                class: "fa-sync"
            },
            {
                name: "repeatOne",
                class: "fa-redo-alt"
            },
            {
                name: "next",
                class: "fa-angle-double-right"
            },
            {
                name: "random",
                class: "fa-random"
            },
            {
                name: "lock",
                class: "fa-lock"
            }
        ];
        this.modInx = 0;
        let my = this;

        //check for stop
        this.el.onpause = function(){
            if(my.el.duration == my.el.currentTime){
                my.stopped();
            }
        }
    }
    getItemInx(){
        return this.itemInx;
    }
    getMusicPath(){
        return this.list[this.itemInx];
    }
    getAllMods(){
        return this.mods;
    }
    getMod(type){
        switch(type){
            case "name":
                return this.mods[this.modInx].name;
            case "class":
                return this.mods[this.modInx].class; 
        }
    }
    setModInx(inx, type = ""){
        this.modInx = inx;
        this.mod = this.mods[inx].name;
        switch(type){
            case "":
                break;
            case "name":
                return this.mods[inx].name;
            case "class":
                return this.mods[inx].class;
        }
    }
    getModInx(){
        return this.modInx;
    }
    stopped(){
        switch(this.mod){
            case "repeatAll":
                if(this.itemInx == this.list.length - 1){
                    this.itemInx = 0;
                    this.play(this.itemInx);
                }else{
                    this.itemInx++;
                    this.play(this.itemInx);
                }
                break;
            case "next":
                if(this.itemInx == this.list.length - 1)
                    break;
                this.itemInx++;
                this.play(this.itemInx);
                break;
            case "repeatOne":
                this.play(this.itemInx);
                break;
            case "random":
                let rnd = parseInt(Math.random() * this.list.length);
                this.play(rnd);
                break;
            case "lock":
                break;
                
        }
        
    }
    onstopped(cb){
        let my = this;
        this.el.onpause = () => {
            if(my.el.duration == my.el.currentTime){
                my.stopped();
                cb();
            }
        }
    }
    setList(arr){
        this.list = arr;
    }
    setVolume(val){
        this.el.volume = val;
    }
    
    play(inx, mod=1){
        if(this.list.length == 0 )
            return;
        if(this.status == "paused" && mod == 1){
            this.el.play();
            this.status = "played";
            console.log("pause play");
            return;
        }
        this.itemInx = inx;
        ipcRenderer.send("songChanged", this.getMusicPath())
        this.status = "played";
        this.el.src = this.list[inx];
        this.el.play();
        this.el.currentTime = 0;
    }
    pause(){
        this.el.pause();
        this.status = "paused";
    }
    getCurrentTime(){
        
        let str = this.addZero(this.el.currentTime / 60) + ":" + this.addZero(this.el.currentTime % 60);
        return str;
    }
    getDuration(){   
        let str = this.addZero(this.el.duration / 60) + ":" + this.addZero(this.el.duration % 60);
        
        return str;
    }
    getCTPercent(){
        return parseInt(this.el.currentTime / this.el.duration * 100)
    }
    seek(percent){
        this.el.currentTime = this.el.duration * (percent / 100); 
    }
    addZero(int){
        int = parseInt(int);
        if(int < 10)
            return "0" + int;
        else
            return int;
    }
    getStatus(){
        return this.status;
    }
}