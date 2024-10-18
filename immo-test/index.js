var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

var config = {
    start: 0,
    end: 0,
    enabled: 0,
    activate: 0,
    schedules: [{
        start: 130,
        end: 230,
    }, {
        start: 530,
        end: 830,
    }],
};

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

const status = () => {
    let date = new Date();
    let current = date.getHours() * 100 + date.getMinutes();

    let val = config.enabled;

    if (config.activate) val = val | 0x02;
    if (config.activate) val = val | 0x04;
    else if (config.enabled && current >= config.start && current < config.end) val = val | 0x08;

    return val;
}

const fourDigit = (val) => {
    if (val < 10) return "000" + val;
    if (val < 100) return "00" + val;
    if (val < 1000) return "0" + val;
    return "" + val;
}

router.get('/:cmd', function (req, res) {
    if (req.params.cmd.indexOf("cmd=") > -1) {

        let cmd = req.params.cmd.replace('cmd=', '');

        if (cmd == 'ping') return setTimeout(() => res.send("OK"), 1000);

        cmd = decode(cmd);

        console.log("Received Command : ", cmd);

        if (cmd.indexOf('disablesch') > -1) {

            config.enabled = 0;

        } else if (cmd.indexOf('enablesch') > -1) {

            config['enabled'] = 1;

        } else if (cmd.indexOf('getsch') > -1) {

            let info = config.schedules.map((schedule) => {
                return `${fourDigit(schedule.start)}${fourDigit(schedule.end)}`;
            });
            let result = info.join('Y') + 'Z';
            console.log("Schedule Result", result);
            return setTimeout(() => res.send(result), 1000);

        } else if (cmd.indexOf('sch') > -1) {

            let info = cmd.substring(3).split('Y');
            let schedules = info.map((item) => {
                if (item.indexOf('Z') > -1) item = item.replace('Z', '');
                let start = parseInt(item.substring(0, 4));
                let end = parseInt(item.substring(4));
                return {start, end};
            });

            config['schedules'] = schedules;
            console.log("Status", config);

            return setTimeout(() => res.send("OK"), 1000);

        } else if (cmd.indexOf('deactivate') > -1) {

            config.activate = 0;

        } else if (cmd.indexOf('activate') > -1) {

            config.activate = 1;

        }

        console.log("Status", config, status());
        return setTimeout(() => res.send(`${status()}`), 1000);

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