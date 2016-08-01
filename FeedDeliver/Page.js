/**
 * @file FeedDeliver project
 * @author onelife <onelife.real(AT)gmail.com>
 * @license See LICENSE file included in this distribution.
 */

/** @global */
var Template = {
  /** @const {string} page */
  page: '<!DOCTYPE html>' +
      '<html>' +
        '<head>' +
          '<base target="_top">' +
          '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
        '</head>' +
        '<body>' +
          '<div id="title_dst"><?= title ?></div>' +
          '<div id="link_dst"><?= link ?></div>' +
          '<div id="content_dst"><?= content ?></div>' +
        '</body>' +
      '</html>',
};
