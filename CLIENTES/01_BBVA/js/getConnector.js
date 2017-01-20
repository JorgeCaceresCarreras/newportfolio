APIConector = function(player){
    (function(player)
{
    function findConnector(win)
    {
        var retries = 0;
        while (!win.ispringPresentationConnector && win.parent && win.parent != win)
        {
            ++retries;
            if (retries > 7)
            {
                return null;
            }

            win = win.parent;
        }
        return win.ispringPresentationConnector;
    }

    function getConnector()
    {
        var api = findConnector(window);
        if (!api && window.opener && (typeof(window.opener) != "undefined"))
        {
            api = findConnector(window.opener);
        }
        return api;
    }

    var connector = getConnector();
    if (connector)
    {
        connector.register(player);
    }
})(player);

};
