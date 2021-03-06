const request = require('request');
const router = require('express').Router();
const {
    determineVehicleMake,
    isValidInput
} = require('./vehicleUtils.js');

// This route works under the assumption that we will always
// be able to tell the manufacturer by the ID. It may be a good idea
// to add ':make'' as one of the required params to API calls.
// This will let us avoid id conflicts in the future if multiple manufacturers
// use the same format.
router.use('/:id', (req, res, next) => {
    const make = determineVehicleMake(req.params.id);
    if (make) {
        res.locals.make = make;
        next();
    } else {
        res.status(400).send({
            error: "An invalid vehicle ID was detected. Please ensure your vehicle ID is correct and retry."
        });
    }
});

router.use('/:id/:route*?', (req, res) => {
    const route = req.params.route || '';
    const make = res.locals.make;
    const id = req.params.id;
    if (isValidInput(req.method, route, req.body)) {
        // If the route is a valid Smartcar route, it will forward
        // the request to the appropriate translation service.
        // The translation service url is defined by the name of the service
        // in the docker-compose file.
        new Promise((resolve, reject) => {
            request({
                url: `http://smartcar-${make}/${id}/${route}`, 
                method: req.method,
                body: req.body,
                json: true
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else if (res.statusCode !== 200) {
                    reject(res.body);
                }
                resolve(res);
            });
        })
        .then(serviceRes => res.send(serviceRes.body))
        .catch(err => res.status(400).send({
            error: `The service for ${make} vehicles returned an error. Please reference the 'api-error' property for more details.`,
            "api-error": JSON.stringify(err)
        }));
    } else {
        res.status(400).send({
            error: "An invalid input was detected. Please ensure that your route/body follow API specifications and retry."
        });
    }
});

router.use('/*', (req, res) => {
    res.status(400).send({
        error: "No ID was recieved. Please include a vehicle ID and try again."
    });
});


module.exports = router;