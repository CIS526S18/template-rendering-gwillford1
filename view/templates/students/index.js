const studentList = require('./list');
const studentForm = require('./form');

function studentIndex(students) {
  
  // Render the page
  var html = "<!doctype html>";
  html +=    "  <html>";
  html +=    "    <head>";
  html +=    "      <title>Hello World</title>";
  html +=    "    </head>";
  html +=    "    <body>";
  html +=    "      <h1>";
  html +=    "         Hello World";
  html +=    "      </h1>";
  html +=    studentList(students);
  html +=    studentForm();
  html +=    "    </body>";
  html +=    "  </html>";
  return html;
}

module.exports = studentIndex;
