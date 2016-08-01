/**
 * @project FeedFilter
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @const {string} */
var DATA_SHEET = 'YOUR_SPREADSHEET_ID';
var PEEL_APP_URL = 'https://script.google.com/macros/s/YOUR_PEEL_APP_ID/exec';

/** @global */
var Setting = {
  // dependence
  peelApp: PEEL_APP_URL,

  // app
  dataSheet: DATA_SHEET,

  // project
  moduleName: 'FeedFilter',
  configTab: 'Feed',

  // common
  timezone: 'GMT+8',
  reportSheet: DATA_SHEET,
  logTab: 'Log',
  debugTab: 'Debug',
  errorTab: 'Error',
};
