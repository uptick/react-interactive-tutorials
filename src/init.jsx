import React from 'react'
import ReactDom from 'react-dom'
import JQuery from 'jquery'
import Clone from 'clone'

import Tutorial from './tutorial.jsx'

var TUTORIAL_CLASS = null;
var REGISTER_DELAY = null;
var TUTORIALS = {};

const init_dom = function(callback) {
  if (TUTORIAL_CLASS !== null) {
    callback();
    return;
  }
  var destination = JQuery('<div>');
  destination.appendTo('body');
  TUTORIAL_CLASS = ReactDom.render(<Tutorial />, destination[0]);
  callback();
};

const register_tutorials = function() {
  init_dom(function() {
    TUTORIAL_CLASS.updateTutorials(TUTORIALS);
  });
};

const debounce_register_tutorials = function(tutorials) {
  var newTutorials = Clone(TUTORIALS);
  for (var tutorialKey in tutorials)
    newTutorials[tutorialKey] = tutorials[tutorialKey];
  TUTORIALS = newTutorials;
  if (REGISTER_DELAY !== null)
    window.clearTimeout(REGISTER_DELAY);
  REGISTER_DELAY = window.setTimeout(register_tutorials, 500);
};

const register_finalise_callback = function(callback) {
  init_dom(function() {
    TUTORIAL_CLASS.addFinaliseCallback(callback);
  });
};

const start_tutorial = function(tutorialKey) {
  if (TUTORIAL_CLASS === null) {
    console.error('Cannot start tutorial: Tutorials not yet initialised.');
    return;
  }
  TUTORIAL_CLASS.start(tutorialKey);
};

const abort_tutorial = function() {
  if (TUTORIAL_CLASS === null) {
    console.warning('Cannot abort tutorial: Tutorials not yet initialised.');
    return;
  }
  TUTORIAL_CLASS.abort();
};

module.exports = {
  registerTutorials: debounce_register_tutorials,
  registerFinaliseCallback: register_finalise_callback,
  startTutorial: start_tutorial,
  abortTutorial: abort_tutorial,
};
