/**
 * @author onelife <onelife.real@gmail.com>
 * @license See LICENSE file included in this distribution.
 */

 /** @global */
 var Reporter = {};

 /**
 * Add a record to file (Google Spreadsheet)
 * @param {string} type - Report type.
 * @param {string} msg - Report content.
 */
Reporter.report = function(type, msg)
{
  if ([Setting.debugTab, Setting.logTab, Setting.errorTab]
    .indexOf(type) == -1) {
    type = Setting.logTab;
  }

  var sheet = SpreadsheetApp.openById(Setting.reportSheet).getSheetByName(type);
  var timestamp = Utilities.formatDate(new Date(), Setting.timezone,
    "yyyy-MM-dd' 'HH:mm:ss");
  sheet.getRange(sheet.getLastRow()+1, 1, 1, 4).setValues([[timestamp,
    Session.getActiveUser().getEmail(), Setting.moduleName, msg]]);
}

/**
* Add a debug message
* @param {string} msg - Debug message.
*/
Reporter.debug = function(msg) {
  Reporter.report(Setting.debugTab, msg);
}

/**
* Add a log message
* @param {string} msg - Log message.
*/
Reporter.log = function(msg) {
  Reporter.report(Setting.logTab, msg);
}

/**
* Add a error message
* @param {string} msg - Error message.
*/
Reporter.error = function(msg) {
  Reporter.report(Setting.logTab, msg);
}
