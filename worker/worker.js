
function Worker() {
    this._exec = require('child_process').fork;
}

Worker.prototype.execute = function (job, callback) {

    this._cb = callback;
    this._job = job;
    this._proc = this._exec(`${__dirname}/index.js`);


    this._proc.on('message', (data) => {
        this._cb(null, data);
        // this._proc.kill('SIGINT');
    });
    this._proc.send(job);
}





module.exports = Worker;


