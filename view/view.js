const fs = require('fs');
const path = require('path');

module.exports = {
    render: render,
    cacheTemplates: cacheTemplates
};

var cache = {};

function cacheTemplates(){
    _loadDirectory('');

}

function _loadDirectory(directory){
    var items = fs.readdirSync(path.join('templates',directory));
    items.forEach(function(item){
        var stats = fs.statSync(path.join('templates',directory,item));
        if (stats.isFile()) {
            var key = path.join(directory,item);
            var file = fs.readFileSync(path.join('templates',directory,item));
            cache[key] = file.toString();
        }
        
        if (stats.isDirectory()) {
            _loadDirectory(path.join(directory, item));
        }

    });
}

function render(template, params, callback)
{
    if (typeof params === "function") {
        callback = params;
        params = {};
    }


    //assume template is the filename
    fs.readFile(path.join('view', 'templates',template), function(err,data) {
        if (err)return callback(err);
    
        var html = cache[template].replace(/<%=(.*)%>/g, function(match, p1){
            var scope = "";
            for(var key in params) {
                scope += "var " + key + "=" + JSON.stringify(params[key]);
            }
            try{
                return eval(scope + code);
            }
            catch(evalError){
                err=evalError;
                return callback(err);
            }
           //eval('var params = ' + JSON.stringify(params) + ';' + p1);
        });

        if (!err) callback(err, html);
    });

}