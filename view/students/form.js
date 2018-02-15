/** @function studentForm
  * Returns an HTML form for creating additional students.
  * @return {String} the html form
  */
function studentForm() {
  var form = "<form method='POST' enctype='multipart/form-data'>";
  form +=    "  <fieldset>";
  form +=    "   <label for='name'>Student Name</label>";
  form +=    "   <input type='text' name='name'/>";
  form +=    "  </fieldset>";
  form +=    "  <fieldset>";
  form +=    "   <label for='eid'>Student Eid</label>";
  form +=    "   <input type='text' name='eid'/>";
  form +=    "  </fieldset>";
  form +=    "  <fieldset>";
  form +=    "   <label for='description'>Description</label>";
  form +=    "   <textarea name='description'></textarea>";
  form +=    "  </fieldset>";
  form +=    "  <fieldset>";
  form +=    "    <label for='image'>Image</label>";
  form +=    "    <input type='file' name='image' />";
  form +=    "  </fieldset>";
  form +=    "  <input type='submit' value='add student'/>";
  form +=    "</form>"
  return form;
}

module.exports = studentForm;
