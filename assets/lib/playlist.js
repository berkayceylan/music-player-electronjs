var Store = require(__dirname + "/store.js");
const path = require("path");
class Playlist extends Store{
    constructor(){
        super({
            configName: "playList",
            defaults: {
                playlists: [
                    {
                        name: "Playlist 1",
                        items: []
                    },
            ]}
        });
        this.playlists = this.get("playlists");
        this.playlistInx = -1;
        this.itemInx = -1;
    }
    save(){
        this.set("playlists", this.playlists);
    }
    setPlaylistInx(inx){
        this.playlistInx = inx;
    }
    getPlaylistInx(){
        return this.playlistInx;
    }
    setItemInx(inx){
        this.itemInx = inx;
    }
    getItemInx(){
        return this.itemInx;
    }
    changeItem(inx1, inx2){
        this.playlists = this.get("playlists");
        let tmpItems = this.playlists[this.playlistInx].items;
        let tmp = tmpItems[inx1];
        tmpItems[inx1] = tmpItems[inx2];
        tmpItems[inx2] = tmp;
        
        this.playlists[this.playlistInx].items = tmpItems;
        this.set("playlists", this.playlists);

    }
    changePlaylist(inx1, inx2){
        this.callPlaylists();
        let tmp = this.playlists[inx1];
        this.playlists[inx1] = this.playlists[inx2];
        this.playlists[inx2] = tmp;
        this.save();
        
    }
    addPlaylist(_name){
        this.playlists = this.get("playlists");
        console.log(this.playlists);
        this.playlists.push({
            name: _name,
            items: []
        });
        this.set("playlists", this.playlists);
    }
    addItem(inx, str){
        this.playlists = this.get("playlists");
        this.playlists[inx].items.push(str);
        this.set("playlists", this.playlists);
    }
    editPlaylist(inx, str){
        this.playlists = this.get("playlists");
        this.playlists[inx].name = str;
        this.set("playlists", this.playlists);
    }
    removeItem(inxPlaylist, inxItem){
        this.playlists = this.get("playlists");
        if(this.playlists[inxPlaylist] == null || this.playlists[inxPlaylist].items[inxItem] == null)
            return;
        this.playlists[inxPlaylist].items.splice(inxItem, 1);
        this.set("playlists", this.playlists);
    }
    removePlaylist(inx){
        this.playlists = this.get("playlists");
        if(this.playlists[inx] == null)
            return;
        this.playlists.splice(inx, 1);
        this.set("playlists", this.playlists);
    }
    getPlaylists(){
        return this.get("playlists");
    }
    getPlaylist(inx = this.playlistInx){
        if(inx < 0)
            return "NULL";
        return this.get("playlists")[inx].name
    }
    getItems(inx = this.playlistInx){
        return this.get("playlists")[inx].items
    }
    getMusicPathFromInx(inxPlaylist, inxItem){
        this.playlists = this.get("playlists");
        var _path = this.playlists[inxPlaylist].items[inxItem];
        return _path;
    }
    getMusicFromInx(inxPlaylist, inxItem){
        var _path = this.getMusicPathFromInx(inxPlaylist, inxItem);
        
        return path.basename(_path, path.extname(_path));
    }
    getMusicArr(arr){
        var localArr = [];
        arr.forEach(item => {
            localArr.push(path.basename(item, path.extname(item)));
        });
        return localArr;
    }
    callPlaylists(){
        this.playlists = this.get("playlists");
    }
}

module.exports = Playlist;