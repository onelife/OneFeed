/**
 * @author onelife <onelife.real@gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @global */
var DriveOp = {};

/**
 * Get config information from file (Google Spreadsheet)
 * @param {string} tab - Tab name.
 * @param {associativeArray} opt_filter - Filter: {'column_name':
 *     'code_feed_to_eval()'}. The column_value can be referenced as "x".
 */
DriveOp.getConfig = function(tab, opt_filter) {
  var sheet = SpreadsheetApp.openById(Setting.dataSheet).getSheetByName(tab);
  var lastCol = sheet.getLastColumn();
  var result = [];

  // get table title
  var title = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  // get table data
  var hit = false;
  for (var row = 2; row <= sheet.getLastRow(); row++) {
    var key;
    var values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
    var temp;
    if (opt_filter) {
      result[0] = {};
      temp = result[0];
    } else {
      result[row-2] = {};
      temp = result[row-2];
    }
    for (var col = 0; col < title.length; col++) {
      key = title[col].toLowerCase();
      if (opt_filter) {
        for (var k in opt_filter) {
          var x = values[col];
          if ((key == k) && eval(opt_filter[k])) {
            hit = true;
            break;
          }
        }
      }
      if (key[0] == '*') {
        key = key.slice(1);
        temp[key] = values[col].split(',');
      } else {
        temp[key] = values[col];
      }
    }
    // if using filter and got config and stop
    if (opt_filter && hit) {
      break;
    }
  }

  return result;
}

/**
 * Add record to file (Google Spreadsheet)
 * @param {string} tab - Tab name.
 * @param {associativeArray} record - Record content.
 */
DriveOp.addRecord = function(tab, record) {
  var sheet = SpreadsheetApp.openById(Setting.dataSheet).getSheetByName(tab);
  var lastCol = sheet.getLastColumn();

  // get table title
  var title = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // add record to the last row
  var range = sheet.getRange(sheet.getLastRow()+1, 1, 1, lastCol);
  var values = range.getValues()[0];
  for (var i in title) {
    values[i] = record[title[i].toLowerCase()];
  }
  range.setValues([values]);
}

/**
 * Add record to file (Google Spreadsheet)
 * @param {object} folder - Folder object.
 * @param {string} subfolderName - Record content.
 * @return {array} [object_folder, boolean_isNewSubfolder]
 */
DriveOp.getSubfolder = function(folder, subfolderName) {
  var folderIter = folder.getFoldersByName(subfolderName);

  if (!folderIter.hasNext()) {
    // create a new subfolder
    return [folder.createFolder(subfolderName), true];
  } else {
    return [folderIter.next(), false];
  }
}


/**
 * Unit test
 */
function testGetConfig() {
  var url = 'http://www.linuxeden.com/html/news/20160719/167141.html';
  var test1 = DriveOp.getConfig(
    Setting.configTab,
    {'domain':'"'+url+'".indexOf(x) >= 0'}
  );
  var test2 = DriveOp.getConfig(Setting.configTab);
  Logger.log('testGetConfig');
}

function testAddRecord() {
  var record = {
    'date': Utilities.formatDate(
      new Date(),
      Setting.timezone,
      "yyyy-MM-dd' 'HH:mm:ss"
    ),
    'site': 'test site',
    'article': '=HYPERLINK("http://google.com", "google.com")',
  };
  DriveOp.addRecord(Setting.recordTab, record);
  Logger.log('testAddRecord');
}
