/**
 * @project FeedDeliver
 * @author onelife <onelife.real@gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @const {string} */
var DATA_SHEET = 'YOUR_SPREADSHEET_ID';
var FEED_APP_URL = 'https://script.google.com/macros/s/YOUR_FEED_APP_ID/exec';
var PEEL_APP_URL = 'https://script.google.com/macros/s/YOUR_PEEL_APP_ID/exec';

/** @global */
var Setting = {
  // dependence
  feedApp: FEED_APP_URL,
  peelApp: PEEL_APP_URL,

  // app
  dataSheet: DATA_SHEET,

  // project
  moduleName: 'FeedFilter',
  configTab: 'Feed',
  recordTab: 'Record',
  folderName: 'My RSS',

  // common
  timezone: 'GMT+8',
  reportSheet: DATA_SHEET,
  logTab: 'Log',
  debugTab: 'Debug',
  errorTab: 'Error',
};
