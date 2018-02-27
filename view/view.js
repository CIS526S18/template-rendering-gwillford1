const fs = require('fs');
const path = require('path');

module.exports = {
    render: render
};

function render(template, params, callback)
{
    if (typeof params === "function") {
        callback = params;
        params = {};
    }


    //assume template is the filename
    fs.readFile(path.join('view', 'templates',template), function(err,data) {
        if (err)return callback(err);
    
        var html = data.toString().replace(/<%=(.*)%>/g, function(match, p1){
            
           return eval('var params = ' + JSON.stringify(params) + ';' + p1);
        });

        callback(err, html);
    });

}