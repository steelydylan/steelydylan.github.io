/// <reference path="../typings/myself.d.ts" />
/// <reference path="../typings/browser.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

'use strict';

import assign = require('object-assign');

export function toArray<T>(list: CSSStyleDeclaration|NodeList|HTMLCollection|IArguments|NamedNodeMap): T[] {
  return Array.prototype.slice.call(list);
}

export function defaults(orig: any, defaults: any) {
  const ret = clone(orig);
  Object.keys(defaults).forEach((k) => {
    if (k in ret) {
      return;
    }
    ret[k] = defaults[k];
  });
  return ret;
}

/**
 * shallow clone
 */
export function clone(orig: any) {
  const ret: { [key: string]: any } = {};
  Object.keys(orig).forEach((k) => ret[k] = orig[k]);
  return ret;
}

export const extend = assign;

/**
 * @see http://underscorejs.org/#compose
 */
export function compose(...fns: Function[]) {
  const start = fns.length - 1;
  return function() {
    let i = start;
    let result = fns[start].apply(this, arguments);
    while (i--) {
      result = fns[i].call(this, result);
    }
    return result;
  };
}

export function getById(ident: string) {
  return document.getElementById(ident);
}

export function textAssignOf(el: HTMLElement) {
  return function(text: string|number) {
    el.textContent = '' + text;
  };
}

export function styleAssignOf(el: HTMLElement, property: string) {
  return function(value: string) {
    (el.style as any)[property] = value === '' ? null : value;
  };
}

export function attributeAssignOf(el: HTMLElement, attribute: string) {
  return function(value: string|number) {
    if (value != null) {
      el.setAttribute(attribute, value + '');
    } else {
      el.removeAttribute(attribute);
    }
  };
}

export function preloadImg(src: string) {
  const img = document.createElement('img');
  img.onload = () => img.parentNode.removeChild(img);
  img.src = src;
  img.style.display = 'none';
  document.body.appendChild(img);
}

export function getPageNumberFromHash() {
  return parseInt(location.hash.replace('#', ''), 10) || 0;
}

export function getPrimitiveFromString(str: string) {
  let ret: any = (str == null) ? null : str + '';

  if (str === 'true') {
    ret = true;
  } else if (str === 'false') {
    ret = false;
  } else if (str == null) {
    ret = null;
  } else if (str.match(/^\d+$/)) {
    ret = parseInt(str, 10);
  }

  return ret;
}

export function stylePrefixDetect(property: string) {
  let validProperty: string;
  const styles = toArray<string>(window.getComputedStyle(document.documentElement, ''));

  function includes(needle: string) {
    return styles.indexOf(needle) !== -1;
  }

  if (includes(`-webkit-${property}`)) {
    validProperty = `-webkit-${property}`;
  } else if (includes(`-moz-${property}`)) {
    validProperty = `-moz-${property}`;
  } else if (includes(`-ms-${property}`)) {
    validProperty = `-ms-${property}`;
  } else if (includes(property)) {
    validProperty = property;
  }

  return validProperty;
}
