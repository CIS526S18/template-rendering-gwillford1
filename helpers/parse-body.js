
const qs = require('querystring');
const CRLF = Buffer.from([0x0D, 0x0A]);
const DOUBLE_CRLF = Buffer.from([0x0D,0x0A,0x0D,0x0A]);

/** @function parseBody
  * An asynchronous function that parses the body
  * of a POST request, and attaches the parsed form data
  * to the req.body as an object.
  *
  * It can handle the common body types:
  *   x-www-form-urlencoded
  *   form/multipart
  *   text/plain
  *   application/json
  *
  * @param {http.IncomingRequest} req - the request object
  * @param {http.ServerResponse} res - the response object
  * @param {function} callback - a callback function to execute
  * The callback should expect a request and response parameter,
  * where the request will have a body parameter containing the
  * parsed form data.
  */
function parseBody(req, res, callback) {
  var chunks = [];

  // Handle incoming data by appending it to the chunks array
  req.on('data', function(data) {
    chunks.push(data);
  });

  // Handle any errors that occur while receiving the body
  req.on('error', function(err) {
    console.log(err);
    res.statusCode = 500;
    res.end("Server error");
  });

  // Handle the end event by taking our now-complete body
  // and parsing it.
  req.on('end', function() {
    var buffer = Buffer.concat(chunks);

    // Determine the content-type of the post request...
    switch(req.headers['content-type'].split(';')[0]) {

      // Multipart form data is the most complicated, so
      // we'll process it using helper functions.
      case "multipart/form-data":
        // 1) extract the boundary
        var match = /boundary=(.+);?/.exec(req.headers['content-type'])
        // 2) parse the body.  There are several possible errors
        // that can occur here, so enclose this portion in a try/catch
        try {
          req.body = parseMultipartBody(buffer, match[1]);
          callback(req, res);
        } catch(err) {
          // If we encounter an error, treat it as a bad request
          // as it is probably a request formatting issue.
          res.statusCode = 400;
          res.end("Bad request");
        }
        return;

      // urlencoded is easy to handle - the querystring library
      // will parse it for us and return an object populated with
      // the form's key/value pairs.
      case "application/x-www-form-urlencoded":
        req.body = qs.parse(buffer.toString());
        callback(req, res);
        return;

      // likewise, we can parse a JSON string with the JSON.parse
      // built-in function
      case "application/json":
        req.body = JSON.parse(buffer.toString());
        callback(req, res);
        return;

      // Finally, text/plain does not get parsed - just converted
      // to a string and returned.
      case "text/plain":
        req.body = buffer.toString();
        callback(req, res);
        return;

      // If it wasn't one of the four formats we know,
      // treat it as a bad request
      default:
        res.statusCode = 400;
        res.end("Bad request");
    }

  });
}

/** @function processMultipartBody
  * A helper function to process multipart forms.
  * It splits the multipart form on the specified
  * boundary bytes, then invokes the parseContent
  * function on each of the resulting content sections.
  * @param {Buffer} buffer - the multipart body to process
  * @param {String} boundary - the boundary bytes that separate
  * content sections in the multipart body.
  * @return {Object} a map of key/value pairs, where the key
  * is the name of the form field, and the value is its value.
  * The value of file inputs is an object consisting of a filename
  * and data properties.
  */
function parseMultipartBody(buffer, boundary) {
  var start = 0;
  var end = 0;
  var sections = [];
  // According to the multipart specification https://tools.ietf.org/html/rfc7578#page-4
  // the boundary is constructed of a double dash (--),
  // and the boundary bytes.  We can therefore concatenate
  // the double-dash to the current boundary bytes value.
  boundary = '--' + boundary;
  // Now, find the first index of the boundary in our Buffer
  start = buffer.indexOf(boundary, start);
  // We need to move our start position to the end of
  // our boundary bytes (index + boundary length).
  start += boundary.length;
  // Each successive boundary is proceeded by a new line
  // composed of two characters, carriage return and line feed.
  // We can also concatenate this to our boundary.
  boundary = CRLF + boundary;
  // We can then find the start of the next boundary,
  // which should be the end of the current content.
  end = buffer.indexOf(boundary, start);
  while (end !== -1) {
    sections.push(buffer.slice(start, end));
    // Again, we need to move our start position
    // to the end of the boundary section
    start = end + boundary.length;
    // The start of the next boundary is the
    // end of our current section.
    end = buffer.indexOf(boundary, start);
  }
  // We now have all body sections in the sections array
  // We need to parse these into key/value pairs.
  properties = {}
  // The map function invokes the parseContent() function
  // on each section, and places the results in a new array
  sections.map(parseContent)
  // We can then invoke forEach() on that new Array
  // to extract the key/value pair and apply them to our
  // properties map.
  .forEach(function(property) {
    properties[property.key] = property.value;
  });
  // Then we return the populated properties map
  return properties;
}

/** @function parseContent
  * Helper function to parse the content from a
  * form/multipart section. Each section consists of
  * a header and a body.
  *
  * There is a double new line (\n\n) between the header a
  * and body.
  *
  * There are two types of content we need to deal with:
  * form fields (text, number, date, checkboxes, etc.)
  * and file inputs (which have additional binary data).
  * We can determine which by looking at the headers.
  *
  * @param {Buffer} content - the section as a buffer
  * @return {Object} a name -> value map of the form fields.
  * For file inputs, the value will be an object with
  * two properties, filename and data, where data is a
  * binary buffer.
  */
function parseContent(content) {
  // The specification indicates that the headers and body
  // are separated by two new lines (CR+LF,CR+LF).  We can find the index
  // the first occurance of the corresponding bytes,
  // and divide buffer into the header and body.
  var index = content.indexOf(DOUBLE_CRLF);
  var headers = content.slice(0, index).toString();
  // The body occurs after the two new lines, or
  // four characters (a new line being two characters,
  // carriage return & line feed)
  var body = content.slice(index + 4);
  // Determine if this is a form field or file
  if(headers.indexOf("filename") > 0) {
    // This is a file!
    // Extract the input name and filename from the
    // Content-Disposition header
    var match = /name="(.*)";\s*filename="(.*)"/.exec(headers)
    // Return a key/value pair using the field name as key,
    // and the value will be file description object with
    // filename and data properties.
    return {
      key: "match[1]",
      value: {
        filename: "match[2]",
        data: body
      }
    }
  } else {
    // This is a form field!
    // Extract the field name from the Content-Disposition header
    var match = /name="(.+)";?/.exec(headers);
    // Return a key/value pair using the field name as key,
    // and the body buffer converted to a string as the value.
    return {
      key: match[1],
      value: body.toString()
    }
  }
}

/** @module parse-body
  * Encapsulates a function to parse the body of a POST request,
  * and attach the POSTed data to the request object's body property.
  */
module.exports = parseBody;
