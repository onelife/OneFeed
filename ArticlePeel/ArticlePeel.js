/**
 * @project ArticlePeel
 * @author onelife <onelife.real@gmail.com>
 * @license See LICENSE file included in this distribution.
 */

 /** @global */
var ArticlePeel = {};
ArticlePeel.prop = PropertiesService.getUserProperties();

/**
 * Parse the charset
 * @param {string} html - page content.
 * @return {string} charset
 */
ArticlePeel.getCharset = function(html) {
  // get meta tag
  var metaAttr = html.match(/meta\s+([^>]+)/i)[1].toLowerCase();
  metaAttr = metaAttr.match(/\s*\w+\s*=\s*"[^"]+"\s*/ig);
  // get charset
  var charset;
  for (var i in metaAttr) {
    if (metaAttr[i].indexOf('charset') != -1) {
      charset = metaAttr[i].match(/charset=\s*"?([^";]+)"/i)[1];
      break;
    }
  }

  if (!charset) {
    // default charset
    return 'utf-8';
  }
  return charset;
}

/**
 * Fetch a article by url
 * @return {array} [url, html, config]
 */
ArticlePeel.fetch = function(url) {
  try {
    // fetch the url
    var content = UrlFetchApp.fetch(url);
    var html = content.getContentText();

    // check charset
    var charset = ArticlePeel.getCharset(html);
    if (charset && charset != 'utf-8') {
      html = content.getContentText(charset);
    }
  } catch(error) {
    var msg = error.fileName + ': ' + error.name + ' on line: ' +
        error.lineNumber + ' -> ' + error.message;
    Logger.log(msg);
    Reporter.error(msg);
    return null;
  }

  return html;
}

/**
 * Fetch and peel the article at server side
 * @param {string} url - Folder object.
 * @return {associativeArray}
 */
ArticlePeel.byXml = function(url) {
  // fetch the url
  var html = ArticlePeel.fetch(url);
  if (!html) {
    return null;
  }

  // get config
  var config = DriveOp.getConfig(
      Setting.configXmlTab,
      {'domain':'"'+url+'".indexOf(x) >= 0'})[0];

  // get content
  var output = {};
  if (config.plan == 'a') {
    // get <body> ... </body>
    var body = html.match(/<body[\s\S]+?<\/body>/i)[0];
    // remove <script> ... </script>
    body = body.replace(/<script[\s\S]+?<\/script>/ig, '');
    // remove <!-- ... -->
    body = body.replace(/<!--[\s\S]+?-->/ig, '');
    // remove [\t\r\n]
    body = body.replace(/[\t\r\n]/ig, '');
    // convert to single space
    body = body.replace(/ {2,}/ig, ' ');

    // number the tags
    var open = {};
    var close = {};
    body = body.replace(
        /<(\/?[\w\d]+)[\s\S]*?>/ig,
        function(match, tag, offset) {
          var tag2;
          if (tag[0] != '/') {
            if (tag in open) {
              open[tag]++;
            } else {
              open[tag] = 1;
              close[tag] = [];
            }
            close[tag].push(open[tag]);
            tag2 = tag+'_'+open[tag];
          } else {
            tag = tag.slice(1);
            if (tag in open) {
              tag2 = tag+'_'+close[tag].pop();
            } else {
              tag2 = tag+'_'+'???';
            }
          }
          return match.replace(tag, tag2);
        });
    //  Logger.log(body.length);
    //  Logger.log(body);

    // extract content
    var title = body.match(new RegExp(config.title[0], 'i'))[config.title[1]];
    var content = body.match(new RegExp(config.body[0], 'i'))[config.body[1]];

    // process "exclude" config
    //  Logger.log(content.length);
    for (var i in config.exclude) {
      //  Logger.log(config.exclude[i]);
      content = content.replace(new RegExp(config.exclude[i], 'ig'), '');
      //  Logger.log(content.length);
    }
    // convert to single space again
    content = content.replace(/ {2,}/ig, ' ');

    // remove tag number
    title = title.replace(
        /<\/?([\w\d]+)[\s\S]*?>/ig,
        function(match, tag, offset) {
          var tag2 = tag.split('_')[0];
          return match.replace(tag, tag2);
        });
    content = content.replace(
        /<\/?([\w\d]+)[\s\S]*?>/ig,
        function(match, tag, offset) {
          var tag2 = tag.split('_')[0];
          return match.replace(tag, tag2);
        });
    //  Logger.log(content.length);
    //  Logger.log(content);

    output = {
      'title': title,
      'content': content,
    };

  } else if (config.plan == 'b') {
    // get data
    var code = html.match(new RegExp(config.code[0]))[1];
    eval(code);
    var content = eval(config.code[1]);
    var dict = JSON.parse(config.keys);
    for (var i in dict) {
      output[i] = eval(dict[i]);
    }
    // Logger.log(output);

  } else {
    output = {
      'content': html,
    };
  }

  return output;
}

/**
 * Unit test
 */
// ?url=http://www.linuxeden.com/html/news/20160727/167247.html&format=json
function testByXml() {
  var urlPlanA = 'http://www.linuxeden.com/html/news/20160727/167247.html';
  var urlPlanB = 'http://36kr.com/p/5050042.html';
  var content = ArticlePeel.byXml(urlPlanA);
  var title1 = content.title.replace(/<(\/?[\w\d]+)[\s\S]*?>/ig, '');
  var output = JSON.stringify({
    'title': Utilities.base64EncodeWebSafe(Utilities.newBlob(content.title)
        .getBytes()),
    'content': Utilities.base64EncodeWebSafe(Utilities.newBlob(content.content)
        .getBytes()),
  });
  var html = JSON.parse(output);
  var title2 = Utilities.newBlob(Utilities.base64DecodeWebSafe(html.title))
      .getDataAsString();
  var content2 = Utilities.newBlob(Utilities.base64DecodeWebSafe(html.content))
      .getDataAsString();

  var content3 = ArticlePeel.byXml(urlPlanB);
  Logger.log('testByXml');
}
