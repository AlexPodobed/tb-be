var shared = function shared(){
    this.autoBuildCtrl = {};
    this.buildHash = {};
    this.rootUrl = "http://tx3.travian.co.uk/";

    if(shared.caller != shared.getInstance){
        throw new Error("This object cannot be instanciated");
    }
};

shared.instance = null;

shared.getInstance = function(){
    if(this.instance === null){
        this.instance = new shared();
    }
    return this.instance
};

module.exports = shared.getInstance();