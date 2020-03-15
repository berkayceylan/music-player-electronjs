const { ipcRenderer, remote } = require("electron");
// btn1.addEventListener("click", () => {
//     ipcRenderer.send("btn1", text1.value);
// });
var playlist = remote.getGlobal("playlist");
var bcPlayer = new BcPlayer();
$(function(){
    $("#items").sortable({
        revert: true,
        helper: "clone",
        handle: ".move",
        items: ".li-wrap",
        start: function(e, ui){
            this.inx1 = ui.item.index();
        },
        stop: function(e, ui){
            if(this.inx1 != ui.item.index())
                playlist.changeItem(this.inx1, ui.item.index());
            
        }
    });
    $("#sidebar").sortable({
        revert: true,
        helper: "clone",
        items:".li-wrap",
        start: function(e, ui){
            this.inx1 = ui.item.index();
        },
        stop: function(e, ui){
            playlist.changePlaylist(this.inx1, ui.item.index());
        }
    });
      
});

//*** VUEJS ***
var vm = new Vue({
    el: "#app",
    data: function(){
        return {
            playlists: playlist.getPlaylists(),
            listDisplay: false,
            listItems: [],
            activePlaylistInx: -1,
            currentPlaylist: playlist.getPlaylist(),
            duration: "00:00",
            currentTime: "00:00",
            interval: "",
            CTPercent: 0,
            volumebar: false,
            volumeVal: .5,
            status: "stopped",
            mod: "fa-sync",
            metadata: null,
            thumbNailSrc: null,
            displayThumbnail: false,
        }
    },
    mounted() {
        this.$nextTick(function(){
            this.setSidebarHeight();
            window.addEventListener("resize", this.setSidebarHeight);
            this.setBgRange(0.5, "#volumebar");  
        });

    },
    beforeDestroy() {
        
    },
    
    watch: {
        CTPercent: function(val){
            this.setBgRange(val / 100 + 1 / 100, "#timebar");
        },
        volumeVal: function(val){
            this.setBgRange(val, "#volumebar");    
        },
        
    },
    computed: {
        
    },
    methods: {
        
        setSidebarHeight: function(){
            let height =  document.documentElement.clientHeight - document.getElementById("bottom").clientHeight
        
            document.getElementById("sidebar").style.height = height + "px";

        },
        setBgRange: function(val, selector){
            let volumebar = document.querySelector(selector);
            volumebar.style = 'background-image: ' + 
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', rgb(106, 88, 175)), '
                + 'color-stop(' + val + ', rgb(188, 175, 238))'
                + ')'
        },
        pageClick: function(){
            if(this.listDisplay)
                this.listDisplay = false;
        },
        clickPlaylist: function(inx,e){
            if(!this.listDisplay){
                this.listDisplay = true;
                
            }
            
            playlist.setPlaylistInx(inx);
            this.currentPlaylist = playlist.getPlaylist();
            this.listItems = playlist.getMusicArr(this.playlists[inx].items);
            
        },        
        addPlaylist: function(){
            ipcRenderer.send("addPlaylist");
        },
        addItem: function(){
            ipcRenderer.send("addItem", playlist.getPlaylistInx());
            
        },
        deletePlaylist: function(inx){
            ipcRenderer.send("deletePlaylist", inx)
        },
        deleteItem: function(inx){
            ipcRenderer.send("deleteItem", {
                playlistInx: playlist.getPlaylistInx(),
                itemInx: inx
            });
        },
        clickItem: function(inx){
            // audio.setAttribute("src", playlist.getMusicPathFromInx(this.playlistInx, inx));
            // audio.play();

            // console.log(audio);
           bcPlayer.setList(this.playlists[playlist.getPlaylistInx()].items);
           
           this.activePlaylistInx = playlist.getPlaylistInx();

           bcPlayer.el.onplaying = () => { // I will edit
            bcPlayer.isPlay = true;
            this.duration = bcPlayer.getDuration();
            if(this.interval != "")
                clearInterval(this.interval);
            
            this.interval = setInterval(() => {
                this.currentTime = bcPlayer.getCurrentTime();
                this.CTPercent = bcPlayer.getCTPercent();
            },100);
            
           };
            bcPlayer.onstopped(function(){
                vm.status = "stopped"
                console.log(vm);
            });
           this.play(inx, 0);
           this.status = "played";
        },
        changeSong: function(b){
            if(b){
                this.play(bcPlayer.getItemInx() + 1);
            }else{
                this.play(bcPlayer.getItemInx() - 1);
            }
        },
        play: function(inx, mod = 1){
            bcPlayer.play(inx, mod);
            remote.getGlobal("playlist").setItemInx(inx);
        },
        editPlaylist: function(inx){
            ipcRenderer.send("editPlaylist", inx);
            
        },
        clickWrap: function(inx){
            playlist.setPlaylistInx(inx);
        },
        seek: function(e){
            
            bcPlayer.seek(e.target.value);
            //bcPlayer.seek(percent);
            console.log(e.target);
        },
        volumeBtn: function(bool){
            this.volumebar = bool;
        },
        changeVolume: function(e){
            bcPlayer.setVolume(e.target.value);
            this.volumeVal = e.target.value;
        },
        playBtn: function(){
            switch(bcPlayer.status){
                case "stopped":
                    bcPlayer.play(bcPlayer.getItemInx());
                    this.status = "played";
                    break;
                case "paused":
                    bcPlayer.play(bcPlayer.getItemInx());
                    this.status = "played";
                    break;
                case "played":
                    bcPlayer.pause();
                    this.status = "paused"
                    break;
            }

        },
        repeatBtn: function(){
            
            if(bcPlayer.getModInx() != bcPlayer.getAllMods().length -1){
                
                this.mod = bcPlayer.setModInx(bcPlayer.getModInx() + 1, "class");

            }else{
                this.mod = bcPlayer.setModInx(0, "class");
            }
            
        }
    }
    });

ipcRenderer.on("playlistChanged", function () {
    vm.playlists = playlist.getPlaylists();
    vm.listItems = playlist.getMusicArr(vm.playlists[playlist.getPlaylistInx()].items);
});
ipcRenderer.on("metadata", (e, data)=>{
    vm.metadata = data;
    if(data.common.picture != null){
        vm.thumbNailSrc = `data:${data.common.picture[0].format};base64,${data.common.picture[0].data.toString('base64')}`;
    }else{
        vm.thumbNailSrc = "./assets/img/singer.png";
    }
        if(!vm.displayThumbnail){
            vm.displayThumbnail = true;
            return;
        }
        
        vm.displayThumbnail = false;
        setTimeout(function(){
            vm.displayThumbnail = true;
        }, 500);

        console.log(vm.displayThumbnail);
    
    // console.log(data.common);
});
