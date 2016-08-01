/**
 * @file FeedDeliver project
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @const {string} DATA_SHEET - Your SpreadSheet ID */
var DATA_SHEET = 'YOUR_SPREADSHEET_ID';
/** @const {string} FEED_APP_URL - Your feed App url */
var FEED_APP_URL = 'https://script.google.com/macros/s/YOUR_FEED_APP_ID/exec';
/** @const {string} PEEL_APP_URL - Your peel App url */
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
