/**
 * @project FeedFilter
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/**
 * Entry point of web app
 * @param {associativeArray} e - Recognize "feed", "peel".
 * @return {object} TextOutput object (RSS)
 */
function doGet(e) {
  try {
    // get config
    var config = DriveOp.getConfig(Setting.configTab);
    var content = '';

    // fetch and filter RSS
    if (e && e.parameter.feed) {
      Reporter.log(e.parameter.feed);
      var peel = null;
      if (e.parameter.peel) {
        peel = e.parameter.peel;
      }
      for (var item = 0; item < config.length; item++) {
        if (e.parameter.feed == config[item]['name']) {
          content = FeedFilter.fetchRss(config[item], peel);
          break;
        }
      }
    } else {
      // default
      content = FeedFilter.fetchRss(config[0]);
    }

    // output RSS
    if (content) {
      return ContentService.createTextOutput(content)
          .setMimeType(ContentService.MimeType.RSS);
    } else {
      return null;
    }
  }
  catch(error) {
    var msg = error.fileName + ': ' + error.name + ' on line: ' +
        error.lineNumber + ' -> ' + error.message;
    Logger.log(msg);
    Reporter.error(msg);
    return null;
  }
}
