/**
 * Created by abel on 12/15/16.
 */
(function () {
    var datafileProcessor = require('./fileProcessor'),
        async = require('async'),
        Worker = require('./worker');

    module.exports = function (child) {
        function Manager(child) {
            this._q = async.queue(function (job, queueRelease) {
                var worker = new Worker();
                worker.execute(job, function (err, result) {
                    job.callback(null, result);
                });
            });
        };
        Manager.prototype.process = function (job, callback) {
            job.callback =  callback;
            console.log("job executing ... ");
            console.log(job)
            this._q.push(job, function (err) {
                console.log("job done ...");
            })
        };
        return new Manager(child);
    }

})();