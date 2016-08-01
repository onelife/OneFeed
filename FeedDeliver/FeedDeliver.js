/**
 * @file FeedDeliver project
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @namespace FeedDeliver */
FeedDeliver = {};

/**
 * Deliver articles to target
 * @function to
 * @memberof FeedDeliver
 * @param {string} target - Recognize "drive" and "email".
 */
FeedDeliver.to = function(target, opt_peel) {
  // check target
  if (['drive', 'email'].indexOf(target) == -1) {
    return;
  }

  try {
    // get config
    var config = DriveOp.getConfig(Setting.configTab);
    // get folder
    mainFolder = DriveOp.getSubfolder(DriveApp, Setting.folderName)[0];

    for (var feed in config) {
      // get subfolder
      subFolder = DriveOp.getSubfolder(mainFolder, config[feed]['name'])[0];
      Logger.log('Feed: '+config[feed]['name']);

      // fetch the RSS without peel (peel later)
      var rss_content = UrlFetchApp
          .fetch(Setting.feedApp+'?feed='+config[feed]['name']+'&peel=0');
      var rss_html = rss_content.getContentText();
      var items = rss_html.match(/<item>(.|[\r\n])+?<\/item>/ig);
      Logger.log('Length: '+items.length);
      for (var i in items) {
        // get article url
        var link = items[i].match(/<link>.+?<\/link>/ig)[0];
        link = link.slice(6, -7);
      //  Logger.log(link);

        // fetch the article
        var content = UrlFetchApp
            .fetch(Setting.peelApp+'?url='+link+'&format=json');
        var html = Utilities.base64DecodeWebSafe(content.getContentText());
        html = Utilities.unzip(Utilities.newBlob(html, 'application/zip'))[0];
        html = JSON.parse(html.getDataAsString());
        html.link = link;
        Logger.log('File Size: '+(html.content.length/1024+'kB'));

        // deliver
        switch (target) {
          case 'drive':
            FeedDeliver.saveToDrive(html, config[feed]);
            break;
          case 'email':
            FeedDeliver.sendToEmail(html, config[feed]);
            break;
          default:
            break;
        }
      }
    }
  }
  catch(error) {
    var msg = error.fileName + ': ' + error.name + ' on line: ' +
        error.lineNumber + ' -> ' + error.message;
    Logger.log(msg);
    Reporter.error(msg);
  }
}

/**
 * Save article to Google Drive
 * @function saveToDrive
 * @memberof FeedDeliver
 * @param {associativeArray} content - Article content.
 * @param {associativeArray} config
 */
FeedDeliver.saveToDrive = function(content, config) {
  // check if already have
  var title = content.title.replace(/<(\/?[\w\d]+)[\s\S]*?>/ig, '');
  var file = subFolder.getFilesByName(title+'.html');
  if (file.hasNext()) {
    Logger.log("Skip: "+title);
    return;
  }
  Logger.log('Title: '+title);

  // save the article
  var page = Template.page.replace(
      /<\?= (\w+) \?>/ig,
      function(match, key, offset) {
        return content[key];
      });
  file = subFolder.createFile(title+'.html', page, MimeType.HTML);
  // add record
  var record = {
    'date': Utilities.formatDate(
        new Date(),
        Setting.timezone,
        "yyyy-MM-dd' 'HH:mm:ss"),
    'site': config['name'],
    'article': '=HYPERLINK("'+file.getUrl()+'", "'+title+'")',
  };
  DriveOp.addRecord(Setting.recordTab, record);
  Logger.log("Save to: "+config['name']+'/'+title+'.html');
}

/**
 * Send article to email address
 * @function sendToEmail
 * @memberof FeedDeliver
 * @param {associativeArray} content - Article content.
 * @param {associativeArray} config
 */
FeedDeliver.sendToEmail = function(content, config) {
  var title = content.title.replace(/<(\/?[\w\d]+)[\s\S]*?>/ig, '');
  // send email
  if (content.content.length > 200*1024) {
    Logger.log('Exceed 200kB limit!');
    Logger.log("Skip: "+title);
    return;
  }
  Logger.log('Title: '+title);

  // send email
  var page = Template.page.replace(
      /<\?= (\w+) \?>/ig,
      function(match, key, offset) {
        return content[key];
      });
  MailApp.sendEmail(
      config['deliverto'],
      '@'+config['name']+' '+title,
      '',
      {htmlBody:page});
  Logger.log("Sent to: "+config['deliverto']);
}

/**
 * Test of FeedDeliver.saveToDrive
 * @function testSaveToDrive
 */
function testSaveToDrive() {
  FeedDeliver.to('drive');
  Logger.log('testSaveToDrive');
}

/**
 * Test of FeedDeliver.testSendToEmail
 * @function testSendToEmail
 */
function testSendToEmail() {
  FeedDeliver.to('email');
  Logger.log('testSendToEmail');
}
