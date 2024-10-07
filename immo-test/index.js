var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

let encode = (text) => {
    let enc = text.split('').map((ch, idx) => {
        let val = ch.charCodeAt(0);
        let offset = 0, mode = 0;

        if (val >= 97 && val <= 122) {
            offset = 97;
            mode = 26;
        } else if (val >= 65 && val <= 90) {
            offset = 65;
            mode = 26;
        } else if (val >= 48 && val <= 57) {
            offset = 48;
            mode = 10;
        } else if (val == 32) {
            offset = 0;
            mode = 255;
        } else {
            offset = 0;
            mode = 255;
        }

        val -= offset;
        val += 8;
        val %= mode;
        val += offset;

        return String.fromCharCode(val);
    }).join('');

    return enc;
}

let decode = (text) => {
    let dec = text.split('').map((ch, idx) => {
        let val = ch.charCodeAt(0);
        let offset = 0, mode = 0;

        if (val >= 97 && val <= 122) {
            offset = 97;
            mode = 26;
        } else if (val >= 65 && val <= 90) {
            offset = 65;
            mode = 26;
        } else if (val >= 48 && val <= 57) {
            offset = 48;
            mode = 10;
        } else if (val == 38) {
            offset = 32;
            mode = 256;
        } else {
            offset = 0;
            mode = 256;
        }

        val -= offset;
        val -= 8;
        if (val < 0) val += mode;
        val %= mode;
        val += offset;

        return String.fromCharCode(val);
    }).join('');

    return dec;
}

router.get('/:cmd', function (req, res) {
    console.log("Received Command : ", req.params.cmd);

    if (req.params.cmd.indexOf("cmd=") > -1) {

        let cmd = req.params.cmd.replace('cmd=', '');
        let ret = `
            Recevied Command : ${cmd}<br/>
            Decoded Command : ${decode(cmd)}
        `;
        return res.send(ret);

    } else if (req.params.cmd.indexOf("enc=") > -1) {

        let cmd = req.params.cmd.replace('enc=', '');
        let ret = `
            Recevied Text : ${cmd}<br/>
            Encoded Text : ${encode(cmd)}
        `;
        return res.send(ret);

    }

    res.send("Immobilizer Test API Works!");
});

module.exports = router;