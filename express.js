const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000;

let configuration = {};
const resetCount = function () {
    setInterval(() => {
        configuration[this.key]['count'] = 0
    }, this.seconds * 1000);
}

const destroySetInterval = function () {
    clearInterval(this.resetCount);
}


app.use(bodyParser.json());

app.post('/configure', (req, res) => {
    const { clientid, limit, seconds } = req.body;
    if (configuration[clientid] && configuration[clientid]['destroySetInterval'] && typeof configuration[clientid]['destroySetInterval'] === 'function') {
        (configuration[clientid]['destroySetInterval'].bind(configuration[clientid]))();
    }
    configuration[clientid] = { limit, seconds, count: 0, key: clientid };
    configuration[clientid]['resetCount'] = resetCount.bind(configuration[clientid]);
    configuration[clientid]['destroySetInterval'] = destroySetInterval;
    (configuration[clientid]['resetCount'].bind(configuration[clientid]))();
    return res.send({ message: 'OK' }).end();
})

app.all('*', (req, res) => {
    let { clientid } = req.headers;
    if(!configuration[clientid]){
        return res.status(403).end();
    }
    configuration[clientid] = { ...(configuration[clientid]), count: configuration[clientid]['count'] ? configuration[clientid]['count'] + 1 : 1 };
    const { count, limit } = configuration[clientid];
    if (count > limit) {
        return res.status(429).end();
    }
    return res.send({ message: 'OK' }).status(200).end();
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})


// PROBLEM STATEMENT -> 
// Send a client id and configuration in request body to /configure endpoint, 
// Send a request to other routes to use the configuration to send 429 and 200

