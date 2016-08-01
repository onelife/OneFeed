/**
 * @project ArticlePeel
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/**
 * Entry point of web app
 * @param {associativeArray} e - Recognize "url" and "format".
 * @return {object or string} HtmlOutput object or zipped json string
 */
function doGet(e) {
  // check parameters
  if (!e || !e.parameter.url) {
    return null;
  }
  if (!e.parameter.format) {
    // default format
    e.parameter.format = 'html';
  }
  if (['html', 'json'].indexOf(e.parameter.format) == -1) {
    return null;
  }
  Reporter.log(e.parameter.format+': '+e.parameter.url);

  // fetch url and output
  if (e.parameter.format == 'html') {
    ArticlePeel.prop.setProperty('url', e.parameter.url);
    return HtmlService.createTemplateFromFile('Page').evaluate();
  }
  else {
    var content = JSON.stringify(ArticlePeel.byXml(e.parameter.url));
    content = Utilities.zip([Utilities.newBlob(content)]);
    Logger.log(content.getContentType());
    content = Utilities.base64EncodeWebSafe(content.getBytes());
    Logger.log('Blob Size: '+content.length/1024+'kB');
    return ContentService.createTextOutput(content)
        .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Utitlty function called by html template
 * @param {string} fileName
 * @return {string} File content
 */
function include(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}

/**
 * Fetch the article called by client side
 * @return {array} [url, html, config]
 */
function fetchArticle() {
  var url = ArticlePeel.prop.getProperty('url');
  var html = ArticlePeel.fetch(url);
  // get config
  var config = DriveOp.getConfig(
      Setting.configTab,
      {'domain':'"'+url+'".indexOf(x) >= 0'})[0];

  return [url, html, config];
}
