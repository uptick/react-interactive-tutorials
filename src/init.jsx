import ReactDom from 'react-dom'
import Tutorial from './tutorial.jsx'

var TUTORIAL_CLASS = null;
var REGISTER_DELAY = null;
var TUTORIALS = [];

const init_dom = function() {
  if (TUTORIAL_CLASS !== null)
    return;
  TUTORIAL_CLASS = ReactDom.render(<Tutorial />, document);
};

const register = function() {
  init_dom();
  TUTORIAL_CLASS.updateTutorials(TUTORIALS);
};

const debounce_register = function(tutorials) {
  TUTORIALS = TUTORIALS.concat(tutorials);
  if (REGISTER_DELAY !== null)
    window.clearTimeout(REGISTER_DELAY);
  REGISTER_DELAY = window.setTimeout(register, 500);
};

module.exports = {
  register,
};
