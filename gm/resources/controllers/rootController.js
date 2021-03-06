const request = require('request');
const {
    formatVehicleInfo
} = require('../util/format.js');
const {
    getVehicleInfo
} = require('../gets/gets.js');

module.exports = function(req, res) {
    getVehicleInfo(req.params.id)
        .then(info => {
            res.send(formatVehicleInfo(info));
        })
        .catch(err => {
            res.status(400).send(err);
        });
};
