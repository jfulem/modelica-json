const path = require('path')
const fs = require('fs')
const fse = require('fs.extra')
const fse2 = require('fs-extra')
const glob = require('glob')
const cheerio = require('cheerio')
const mu = require('mustache')

const ut = require('../lib/util')

// var logger = require('winston')

/** Parse the json component description
  *  and return an html snippet
  */
function toHtml (component) {
  var template = `
  {{! This is a template for an Modelica block. }}

<h2>{{topClassName}}<a name="{{topClassName}}"></a></h2>

    <p>{{html.comment}}</p>

<h3>Functionality</h3>

    {{{info}}}

<h3>Public Parameters</h3>
    {{#public.parameters.length}}
    <p>
    It has the following publicly visible parameters:
    </p>
    <table>
    <tr><th>Name    </th>
    <th class="description">Description</th>
    <th>Value    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th class="type">Type        </th>
    <th>min    </th>
    <th>max    </th></td>
    {{#public.parameters}}
    <tr>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{html.comment}}</td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td>{{{html.type}}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td>
    </tr>
    {{/public.parameters}}
    </table>
    {{/public.parameters.length}}
    {{^public.parameters}}
    <p>It has no parameters.</p>
    {{/public.parameters}}

<h3>Inputs</h3>
    {{#inputs.length}}
    <p>
    It has the following inputs:
    </p>
    <table>
    <tr>
      <th class="type">Type        </th>
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      </td>
    {{#inputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{html.comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
      </tr>
    {{/inputs}}
    </table>
    {{/inputs.length}}
    {{^inputs}}
    <p>It has no inputs.</p>
    {{/inputs}}

<h3>Outputs</h3>
    {{#outputs.length}}
    <p>
    It has the following outputs:
    </p>
    <table>
    <tr>
      <th class="type">Type        </th>
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      </td>
    {{#outputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{html.comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
      </tr>
    {{/outputs}}
    </table>
    {{/outputs.length}}
    {{^outputs}}
    <p>It has no outputs.</p>
    {{/outputs}}

<h3>Public Blocks</h3>
    {{#public.models.length}}
    <p>
    It has the following public blocks:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Name</th>
      <th class="description">Description</th>
      <th>Parameter Assignments</th>
    </td>
    {{#public.models}}
    <tr>
      <td>
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{html.comment}}</td>
      <td>
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      </td>
      </tr>
    {{/public.models}}
    </table>
    {{/public.models.length}}
    {{^public.models}}
    <p>It has no public blocks.</p>
    {{/public.models}}

<h3>Protected Parameters</h3>
    {{#protected.parameters.length}}
    <p>
    It has the following protected parameters:
    </p>
    <table>
    <tr><th>Name    </th>
    <th class="description">Description</th>
    <th>Value    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th class="type">Type        </th>
    <th>min    </th>
    <th>max    </th>
    </td>
    {{#protected.parameters}}
    <tr>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{html.comment}}</td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td>{{{html.type}}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td></tr>
    {{/protected.parameters}}
    </table>
    {{/protected.parameters.length}}
    {{^protected.parameters}}
    <p>It has no parameters.</p>
    {{/protected.parameters}}


<h3>Protected Blocks</h3>
    {{#protected.models.length}}
    <p>
    It has the following protected blocks:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Name</th>
      <th class="description">Description</th>
      <th>Parameter Assignments</th>
    </td>
    {{#protected.models}}
    <tr>
      <td>
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{html.comment}}</td>
      <td>
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      </td>
      </tr>
    {{/protected.models}}
    </table>
    {{/protected.models.length}}
    {{^protected.models}}
    <p>It has no protected blocks.</p>
    {{/protected.models}}

<h3>Internal connections</h3>
    {{#connections.length}}
    <p>
    The inputs of the internal blocks are connected to the following outputs:
    </p>
    <p>Todo: Make sure inputs point to outputs. Now, they are not ordered.</p>

    <ol>
    {{#connections}}
    <li>
    <code>
    <a href="#{{0.instanceLinkTarget}}">{{0.instance}}</a>{{#0.connector}}.<a href="#{{0.portLinkTarget}}" >{{0.connector}}</a>{{/0.connector}}
    </code>
    &rarr;
    <code>
    <a href="#{{1.instanceLinkTarget}}">{{1.instance}}</a>{{#1.connector}}.<a href="#{{1.portLinkTarget}}" >{{1.connector}}</a>{{/1.connector}}
    </code>
    </li>
    {{/connections}}
    </ol>
    {{/connections.length}}
    {{^connections}}
    <p>It has no internal connections.</p>
    {{/connections}}
    `
    // Make a copy of the input argument, as we need to remove the <html> amd </html>
  var comCop = JSON.parse(JSON.stringify(component))
  comCop.info = component.info.replace('</html>', '').replace('<html>', '')
  return mu.render(template, comCop)
}

function removeHtmlTag (string, tag) {
  var regEx = new RegExp('</?' + tag + '>', 'ig')
  return string.replace(regEx, '')
}

/** Return the content of page.html.

    The content is a complete html page, returned as a string.
*/
function getPage (data) {
  var fileName = path.join(__dirname, 'page.html')
  var content = fs.readFileSync(fileName, 'utf8')
  return mu.render(content, {'body': data})
}

/** Return the MODELICAPATH, with the current directory being the first
  *  element. Elements are separated by ':'
  */
function getMODELICAPATH () {
  return (process.env.MODELICAPATH)
    ? (process.cwd() + ':' + process.env.MODELICAPATH).split(':')
    : [process.cwd()]
}

/** Return a string that points to the .mo file that contains
  * the class `className`. This function searches on the
  * current directory and the MODELICAPATH.
  * If the file is not found, it returns 'null'
  */
function getModelicaFileName (className) {
  const MOPA = getMODELICAPATH()
  // Search on the MODELICAPATH
  // Note that 'file:///Buildings/Resources' may be in the
  // directory 'file:///Buildings 5.0.1/Resources'
  // rather than only in Buildings
  const topLevel = className.substring(0, className.indexOf('.'))
  const classNameWithoutTopLevel = className.substring(className.indexOf('.') + 1)
  // fixme: for now, get the json file, not the .mo file,
  //        this will be changed later when we parse mo files dynamicall
  const fileName = classNameWithoutTopLevel.replace(/\./g, '/') + '.mo'

  for (var k = 0; k < MOPA.length; k++) {
    // Process the first element in the MODELICAPATH
    // Search 'Buildings' and 'Buildings x' where x is any character
    var dirs = glob.sync(path.join(MOPA[k], topLevel + '?( *)'))
    for (var d = 0; d < dirs.length; d++) {
      const fullName = path.join(dirs[d], fileName)
      if (fse.existsSync(fullName)) {
        return fullName
      }
    }
  }
  return null
}
/** Search the MODELICAPATH and copy all images with names in `fileNames`,
    unless they already exist
*/
function copyImages (fileNames) {
  const MOPA = getMODELICAPATH()

  // Search each file on the Modelica path, and if found, copy it
  for (var i = 0; i < fileNames.length; i++) {
    const des = fileNames[i].replace('file:///', '')
    var src = null
    var mustCopy = false
    if (fse.existsSync(des)) {
      src = des
    } else {
      // Search on the MODELICAPATH
      // Note that 'file:///Buildings/Resources' may be in the
      // directory 'file:///Buildings 5.0.1/Resources'
      // rather than only in Buildings
      var fileWithoutPackage = des.substring(des.indexOf('/'))

      for (var k = 0; k < MOPA.length; k++) {
        // Process the first element in the MODELICAPATH
        // Search 'Buildings' and 'Buildings x' where x is any character
        var dirs = glob.sync(path.join(MOPA[k], 'Buildings?( *)'))
        for (var d = 0; d < dirs.length; d++) {
          const can = path.join(dirs[d], fileWithoutPackage)
          if (fse.existsSync(can)) {
            src = can
            mustCopy = true
            break
          }
        }
      }
    }
    if (src == null) {
      console.log('Warning: Did not find image file for modelica://' + des + '\n' +
            '  Make sure your library is on the MODELICAPATH.\n' +
            '  Search directories are ' + MOPA)
    } else {
      if (mustCopy) {
        // Create directory if it does not exists
        const di = des.substring(0, des.lastIndexOf('/'))
        fse2.ensureDirSync(di, function (err) {
          if (err) {
            console.log(err)
          }
        })
        fse.copy(src, des, function (err) {
          if (err) {
            // Error during copy
            console.log(err)
          }
        })
      }
    }
  }
}

/**
  * Search the html_body for the 'src' attribute of all 'img' elements,
  * and return them as an array.
  */
function getImageLocations (htmlBody) {
  const src = []
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  $('img').each(function (i, elem) {
    src[i] = $(this).attr('src')
    // If there is a trailing /, remove it. It could be from ..pSet.png\"/>
    if (src[i].endsWith('/')) {
      src[i] = src[i].slice(0, -1)
    }
    // Remove trailing \"
    if (src[i].startsWith('\\"') && src[i].endsWith('\\"')) {
      src[i] = src[i].slice(2, -2)
    }
  })
  return src
}

function write (fileName, data) {
  // Copy the images
  const files = []
  data.forEach(function (dat) {
    const f = getImageLocations(dat.info)
    f.forEach(function (obj) {
      files.push(obj)
    })
  })
  copyImages(files)

  // Get the html snippet of the component
  const htmlComp = []
  data.forEach(function (dat) {
    htmlComp.push(toHtml(dat))
  })
  // Write the file
  const page = getPage(htmlComp.join(''))
  return ut.writeFile(fileName, page)
}

module.exports.getModelicaFileName = getModelicaFileName
module.exports.toHtml = toHtml
// module.exports.getPage = getPage
// module.exports.writePage = writePage
module.exports.removeHtmlTag = removeHtmlTag
module.exports.getImageLocations = getImageLocations
module.exports.write = write
// module.exports.copyImages = copyImages