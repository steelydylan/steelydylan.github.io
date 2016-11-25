/// <reference path="../typings/myself.d.ts" />
/// <reference path="../typings/browser.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

'use strict';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/throttleTime';

import keycode = require('keycode');

const KEY_UP$ = Observable.fromEvent(document, 'keyup');
const KEY_DOWN$ = Observable.fromEvent(document, 'keydown');

export interface TouchMoveDelta {
  init : number;
  curt : number;
}

/**
 * create Observable from user input
 */
export function keyup(charKey: string|number): Observable<KeyboardEvent> {
  const keyCode = typeof charKey === 'string' ? keycode(charKey)
                                              : charKey;
  return KEY_UP$.filter(keyCodeIs(keyCode));
}

export function keydown(charKey: string|number): Observable<KeyboardEvent> {
  const keyCode = typeof charKey === 'string' ? keycode(charKey)
                                              : charKey;
  return KEY_DOWN$.filter(keyCodeIs(keyCode));
}

export function click(el: HTMLElement): Observable<MouseEvent> {
  return Observable.fromEvent(el, 'click');
}

export function mousemove(el = document.body): Observable<MouseEvent> {
  return Observable.fromEvent(el, 'mousemove');
}

export function touchstart(el: HTMLElement): Observable<TouchEvent> {
  return Observable.fromEvent(el, 'touchstart');
}

export function touchend(el: HTMLElement): Observable<TouchEvent> {
  return Observable.fromEvent(el, 'touchend');
}

export function touchmove(el: HTMLElement): Observable<TouchEvent> {
  return Observable.fromEvent(el, 'touchmove');
}

export function swipe(el: HTMLElement, stop$: Subject<any>): Observable<TouchMoveDelta> {
  const start$ = touchstart(el).do((e: TouchEvent) => e.preventDefault());
  const move$  = touchmove(el).do((e: TouchEvent) => e.preventDefault()).throttleTime(100);
  const end$   = touchend(el).do((e: TouchEvent) => e.preventDefault());

  end$.subscribe(stop$)

  return start$.flatMap(function({changedTouches}) {
    const initialValue = {
      init : changedTouches[0].clientX,
      curt : 0
    };
    return move$.takeUntil(stop$).scan(function(acc: TouchMoveDelta, current: TouchEvent) {
      acc.curt = current.changedTouches[0].clientX;
      return acc;
    }, initialValue).skip(1);
  });
}

export function swipeLeft(el = document.body): Observable<TouchMoveDelta> {
  const stop$ = new Subject();

  return swipe(el, stop$).filter((moves: TouchMoveDelta) => {
    const {init, curt} = moves;
    const delta = curt - init;
    return delta < -10;
  }).do(() => stop$.next(true));
}

export function swipeRight(el = document.body): Observable<TouchMoveDelta> {
  const stop$ = new Subject();

  return swipe(el, stop$).filter((moves: TouchMoveDelta) => {
    const {init, curt} = moves;
    const delta = curt - init;
    return delta > 10;
  }).do(() => stop$.next(true));
}

export function resize(): Observable<UIEvent> {
  return Observable.fromEvent(window, 'resize');
}

export function hashchange(): Observable<HashChangeEvent> {
  return Observable.fromEvent(window, 'hashchange');
}

function keyCodeIs(keyCode: number) {
  return function(event: KeyboardEvent) {
    return event.keyCode === keyCode;
  };
}
