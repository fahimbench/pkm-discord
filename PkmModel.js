class PkmModel {
    constructor(img, hash, nameId) {
        this.img = img;
        this.hash = hash;
        this.nameId = nameId;
    }

    getObj(){
        return {img: this.img, hash: this.hash, name: this.nameId}
    }
}

module.exports = PkmModel;