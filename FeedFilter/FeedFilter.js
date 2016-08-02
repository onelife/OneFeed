/**
 * @file FeedFilter project
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @namespace FeedFilter */
FeedFilter = {};

/**
 * Fetch RSS feed
 * @function fetchRss
 * @memberof FeedFilter
 * @param {associativeArray} config - url, filter, yeslist, nolist, peel.
 * @param {boolean} opt_peel - Peel option which overrides config.peel, default is null.
 * @return {string} XML format RSS feed
 */
FeedFilter.fetchRss = function(config, opt_peel) {
  var charset;

  // check config
  if (!config.url) {
    return null;
  }

  // override config.peel
  if (opt_peel != null) {
    config.peel = opt_peel;
  }

  // fetch RSS
  try {
    // fetch Rss content
    var xml = UrlFetchApp.fetch(config.url).getContentText();
    var content = xml.match(/\?\s*xml\s*(.+)\?/i)[1].toLowerCase();
    content = content.match(/\s*\w+\s*=\s*"[^"]+"\s*/ig);

    // check charset
    for (var i in content) {
      if (content[i].indexOf('encoding') != -1) {
        charset = content[i].match(/"([^"]+)"/i)[1];
      }
    }
    if (!charset) {
      charset = 'utf-8';
    }
    if (charset != 'utf-8') {
      xml = UrlFetchApp.fetch(config.url).getContentText(charset);
    }

  } catch(error) {
    var msg = error.fileName + ': ' + error.name + ' on line: ' +
        error.lineNumber + ' -> ' + error.message;
    Logger.log(msg);
    Reporter.error(msg);
    return null;
  }

  // parse content
  var doc = XmlService.parse(xml);
  var root = doc.getRootElement();
  var channel = root.getChildren('channel')[0];
  var childs = channel.getChildren();
  var skipList = [];

  // loop through the items of a channel
  for (var i in childs) {
    if (childs[i].getName() == 'item') {
      // filter items
      var iChilds = childs[i].getChildren();
      var skip = false;
      // loop through the attributes of a chaitemnnel
      for (var j in iChilds) {
        // check against filter
        if (config.filter && config.nolist &&
            config.filter.indexOf(iChilds[j].getName()) != -1) {
          for (var k in config.nolist) {
            var text = iChilds[j].getText();
            if (text.search(config.nolist[k]) != -1) {
              skipList.push(childs[i]);
              skip = true;
              break;
            }
          }
          if (skip) {
            break;
          }
        }
        // replace link with peel
        if (config.peel != 0 && iChilds[j].getName() == 'link') {
          iChilds[j].setText(Setting.peelApp+'?url='+iChilds[j].getText());
          Logger.log(iChilds[j].getText());
        }
      }
    }
  }

  // remove the items in skipList
  for (var i in skipList) {
    ret = channel.removeContent(skipList[i]);
    Logger.log(ret);
  }

  return XmlService.getRawFormat().setEncoding(charset).format(doc);
}

/**
 * Test of FeedFilter.fetchRss
 * @function testFetchRss
 */
function testFetchRss() {
  var config = DriveOp.getConfig(Setting.configTab);
  var content = FeedFilter.fetchRss(config[0]);
  Logger.log('testFetchRss');
}
