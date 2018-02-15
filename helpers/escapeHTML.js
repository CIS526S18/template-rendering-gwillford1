/** @function escapeHTML
  * A helper function for sanitizing user input by
  * escaping less-than and greater-than symbols (<>).
  * This has the practical effect of transforming html
  * into text.
  * @param {String} html - the html to escape
  * @return {String} the escaped html
  */
function escapeHTML(html) {
  // String.prototype.replace can take a regular expression as an argument.
  // the regular expression /</g means "all < in the string"
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
