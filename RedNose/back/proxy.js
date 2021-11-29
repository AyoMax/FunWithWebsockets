const express    = require('express');
const path       = require('path');
const config     = require(path.join(__dirname,"/global.json"));
const storage    = path.join(__dirname,"../"+config.Proxy.settings.storage_path);
const port       = config.Proxy.settings.port;
const app        = express();

/**
 *   Storage
 */
app.use(express.static(path.join(__dirname,"../"+config.Proxy.settings.storage_path)));

app.get('/stream', function (req, res) {
    res.sendFile(path.join(storage+'/stream.html'));
});

app.get('/view', function (req, res) {
    res.sendFile(path.join(storage+'/view.html'));
});

app.get('/', function (req, res) {
    res.sendFile(path.join(storage+'/index.html'));
});

app.listen(port, () => console.log(`Proxy listen to portt : `+port));