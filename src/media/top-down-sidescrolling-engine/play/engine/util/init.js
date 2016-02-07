function Init(main) {
    new AsyncGroup(Init.async_startup_jobs).run(function() {
        for (var i = 0;i<Init.sync_startup_jobs.length;i++) {
            Init.sync_startup_jobs[i]();
        }
        main();
    });
}

Init.sync_startup_jobs = [];

Init.register_sync = function(sync) {
    Init.sync_startup_jobs.push(sync);
}

Init.async_startup_jobs = [];

Init.register_async = function(async) {
    Init.async_startup_jobs.push(async);
}
