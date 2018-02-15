
/** @function studentList
  * Returns a formatted list of student's names drawn
  * from the students model.
  * @return {String} an html fragment of the student's names
  */
function studentList(students) {
  var html = "<ul>";
  html += students.map(function(item) {
    return "<li>" + item.name + "</li>";
  }).join("");
  html += "</ul>"
  return html;
}

module.exports = studentList;
