var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
// u5Zd9&e32xt^&XX
const encodeKey = "123";
router.use(bodyParser.urlencoded({ extended: false }));

var config = {
    start: 0,
    end: 0,
    enabled: 0,
    activate: 0,
    schedules: [{
        start: 2359,
        end: 0,
        weekday: 127,
    }, {
        start: 1,
        end: 2,
        weekday: 127,
    }],
};

let encode = (text, key = encodeKey) => {
    let keyIdx = 0;
    let enc = text.split('').map((ch) => {
        let val = ch.charCodeAt(0);
        let offset = 0, mode = 0;
        let op = key.charCodeAt(keyIdx) + key.length;
        keyIdx = (keyIdx + 1) % key.length;

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
        let move = op % mode;

        if (val < offset) val += mode;

        val -= offset;
        val += move;
        val %= mode;
        val += offset;

        return String.fromCharCode(val);
    }).join('');

    return enc;
}

let decode = (text, key = "12345678") => {
    let keyIdx = 0;
    let dec = text.split('').map((ch) => {
        let val = ch.charCodeAt(0);
        let len = key.length;
        let op = key.charCodeAt(keyIdx) + len;
        let offset = 0, mode = 0;
        let move = 0;

        keyIdx = (keyIdx + 1) % key.length;

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
        move = op % mode;

        val -= offset;
        if (val < move) val += mode;
        val -= move;
        val %= mode;
        val += offset;

        return String.fromCharCode(val);
    }).join('');

    return dec;
}

const status = () => {
    let date = new Date();
    let current = date.getHours() * 100 + date.getMinutes();

    let val = config.enabled;

    if (config.activate) val = val | 0x02;
    if (config.activate) val = val | 0x04;
    else if (config.enabled && current >= config.start && current < config.end) val = val | 0x08;

    return val;
}

const digitFormat = (val, len = 4) => {
    let idx = 0;
    let formatted = '';
    while(idx < len) {
        formatted = (val % 10) + formatted;
        val = Math.floor(val / 10);
        idx++;
    }

    return formatted;
}

router.get('/:cmd', function (req, res) {
    if (req.params.cmd.indexOf("cmd=") > -1) {

        let cmd = req.params.cmd.replace('cmd=', '');
        let flag = false;

        console.log("\n\nReceived Command : ", cmd);

        if (cmd == 'ping') return setTimeout(() => res.send("OK"), 1000);

        cmd = decode(cmd);

        console.log("Decoded Command : ", cmd);

        if (cmd.indexOf('disablesch') > -1) {

            config.enabled = 0;
            flag = true;

        } else if (cmd.indexOf('enablesch') > -1) {

            config['enabled'] = 1;
            flag = true;

        } else if (cmd.indexOf('getsch') > -1) {

            let info = config.schedules.map((schedule) => {
                return `${digitFormat(schedule.weekday, 3)}${digitFormat(schedule.start)}${digitFormat(schedule.end)}`;
            });
            let result = info.join('Y') + 'Z';
            console.log("Schedule Result", result);
            return setTimeout(() => res.send(result), 1000);

        } else if (cmd.indexOf('sch') > -1) {

            let info = cmd.substring(3).split('Y');
            let schedules = info.map((item) => {
                if (item.indexOf('Z') > -1) item = item.replace('Z', '');
                let weekday = parseInt(item.substring(0, 3));
                let start = parseInt(item.substring(3, 7));
                let end = parseInt(item.substring(7));
                return {start, end, weekday};
            });

            config['schedules'] = schedules;
            console.log("Status", config);

            return setTimeout(() => res.send("OK"), 1000);

        } else if (cmd.indexOf('deactivate') > -1) {

            config.activate = 0;
            flag = true;

        } else if (cmd.indexOf('activate') > -1) {

            config.activate = 1;
            flag = true;

        } else if (cmd.indexOf('status') > -1) {

            flag = true;

        } else if (cmd.indexOf('time') > -1) {

            console.log("Set current time");
            flag = true;

        }

        if (flag) return setTimeout(() => res.send(`${status()}`), 1000);
        
        console.log("Wrong command! Maybe security code? => " + cmd);
        return setTimeout(() => res.send(`wrong`), 1000);

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