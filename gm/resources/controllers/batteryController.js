const request = require('request');
const {
    formatFuelInfo
} = require('../util/format.js')
const {
    getEnergy
} = require('../gets/gets.js');


module.exports = function(req, res) {
    getEnergy(req.params.id)
        .then(info => {
            res.send(formatFuelInfo(info, 'batteryLevel'));
        })
        .catch(err => {
            res.status(400).send(err);
        });
}
