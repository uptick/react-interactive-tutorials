import React from 'react'
import ReactDom from 'react-dom'
import JQuery from 'jquery'
import Clone from 'clone'

import Tutorial from './tutorial.jsx'

var TUTORIAL_CLASS = null;
var REGISTER_DELAY = null;
var TUTORIALS = {};

function init_dom(callback) {
  if (TUTORIAL_CLASS !== null) {
    callback();
    return;
  }
  var destination = JQuery('<div>');
  destination.appendTo('body');
  TUTORIAL_CLASS = ReactDom.render(<Tutorial />, destination[0]);
  callback();
}

function register_tutorials() {
  init_dom(function() {
    TUTORIAL_CLASS.updateTutorials(TUTORIALS);
  });
}

function registerTutorials(tutorials) {
  var newTutorials = Clone(TUTORIALS);
  for (var tutorialKey in tutorials)
    newTutorials[tutorialKey] = tutorials[tutorialKey];
  TUTORIALS = newTutorials;
  if (REGISTER_DELAY !== null)
    window.clearTimeout(REGISTER_DELAY);
  REGISTER_DELAY = window.setTimeout(register_tutorials, 500);
}

function registerFinaliseCallback(callback) {
  init_dom(function() {
    TUTORIAL_CLASS.addFinaliseCallback(callback);
  });
}

function startTutorial(tutorialKey) {
  if (TUTORIAL_CLASS === null) {
    console.error('Cannot start tutorial: Tutorials not yet initialised.');
    return;
  }
  TUTORIAL_CLASS.start(tutorialKey);
}

function abortTutorial() {
  if (TUTORIAL_CLASS === null) {
    console.warning('Cannot abort tutorial: Tutorials not yet initialised.');
    return;
  }
  TUTORIAL_CLASS.abort();
}

export {
  registerTutorials,
  registerFinaliseCallback,
  startTutorial,
  abortTutorial,
}
