var ispringPresentationConnector = {};
requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: '../vendor/jquery-1.11.3.min',
        screenfull: '../vendor/screenfull.min',
        LZString: '../vendor/lz-string/lz-string.min'
    }
});
requirejs(['app', 'ispring'], function(App, ispring) {
    App.initialize(ispringPresentationConnector);
});
