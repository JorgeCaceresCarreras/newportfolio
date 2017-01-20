define(function() {
    var player;

    function init(callback) {
        ispringPresentationConnector.register = function(playerIspring){
            player = playerIspring;
            callback();
        };
    }

    function getPlayer() {
        return player;
    }

    function onSlideChange(callback) {
        player.view().playbackController().slideChangeEvent().addHandler(callback);
    }

    function onClockTick(callback) {
        
        player.view().playbackController().clock().tickEvent().addHandler(callback);

    }

    function getPresentation() {
        return player.presentation();
    }

    function getLocalStorageKey() {
        return "ispring::"+getPresentation().uniqueId();
    }

    function getSlidesCount() {
        return player.presentation().slides().count();
    }

    function getPlaybackController() {
        return player.view().restrictedPlaybackController();
    }
    
    return {
        'getPlayer': getPlayer,
        'onSlideChange': onSlideChange,
        'onClockTick': onClockTick,
        'getPresentation': getPresentation,
        'getLocalStorageKey': getLocalStorageKey,
        'slidesCount': getSlidesCount,
        'getPlaybackController': getPlaybackController,
        'init': init
    }
})