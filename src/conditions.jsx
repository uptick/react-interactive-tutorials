import JQuery from 'jquery'
import Cookie from 'js-cookie'

const are_conditions_met = function(conditions, mustMatchAll) {
  var anyConditionMet = false;
  var allConditionsMet = true;
  for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
    var condition = conditions[conditionIndex];
    var conditionMet = false;
    switch (condition.compare) {
      case 'url':
        if (window.location.pathname.match(condition.url) !== null)
          conditionMet = true;
        break;

      case 'inputVal':
        var input = JQuery(condition.selector);
        if (input) {
          if (input.is('input[type="radio"]')) {
            if (input.prop('checked') == condition.value)
              conditionMet = true;
          }
          else {
            if (input.val() == condition.value)
              conditionMet = true;
          }
        }

        break;

      case 'inputNotVal':
        var input = JQuery(condition.selector);
        if (input) {
          if (input.is('input[type="radio"]')) {
            if (input.prop('checked') != condition.value)
              conditionMet = true;
          }
          else {
            if (input.val() != condition.value)
              conditionMet = true;
          }
        }
        break;

      case 'dropdownState':
        var dropdown = JQuery(condition.selector);
        if (dropdown.length == 1) {
          var state;
          if (dropdown.hasClass('open'))
            state = 'open';
          else
            state = 'closed';
          if (state == condition.state)
            conditionMet = true;
        }
        break;

      case 'checkpointComplete':
        if (Cookie.get('tutorial_' + condition.checkpoint))
          conditionMet = true;
        break;

      case 'checkpointIncomplete':
        if (!Cookie.get('tutorial_' + condition.checkpoint))
          conditionMet = true;
        break;

      case 'either':
        if (are_conditions_met(condition.when, false))
          conditionMet = true;
        break;

      case 'all':
        if (are_conditions_met(condition.when, true))
          conditionMet = true;
        break;
    }

    if (conditionMet) {
      anyConditionMet = true;
      if (!mustMatchAll)
        return true;
    }
    else {
      allConditionsMet = false;
    }
  }
  if (!mustMatchAll)
    return false;
  else {
    return allConditionsMet;
  }
};

module.exports = {
  conditionsMet: are_conditions_met,
};
