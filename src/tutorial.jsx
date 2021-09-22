import JQuery from 'jquery'
import React from 'react'
import ReactDom from 'react-dom'
import ClassNames from 'classnames'
import Clone from 'clone'
import Cookie from 'js-cookie'

import { conditionsMet } from './conditions.jsx'

const BASE_Z_INDEX = 1050;

function clear_step_checkpoints(tutorial) {
  for (var stepIndex = 0; stepIndex < tutorial.steps.length; stepIndex++) {
    var step = tutorial.steps[stepIndex];
    Cookie.remove('tutorial_' + tutorial.key + '_' + step.key);
  }
  if (tutorial.checkpoints) {
    for (var checkpointIndex = 0; checkpointIndex < tutorial.checkpoints.length; checkpointIndex++) {
      var checkpoint = tutorial.checkpoints[checkpointIndex];
      Cookie.remove('tutorial_' + tutorial.key + '_' + checkpoint.checkpoint);
    }
  }
}

function set_step_checkpoint(tutorial, step) {
  Cookie.set(
    'tutorial_' + tutorial.key + '_' + step.key,
    true,
    {path: '/'}
  );
}

class Tutorial extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,

      tutorials: {},
      finaliseCallbacks: [],

      popupActive: false,
      blockingInput: false,

      tutorial: null,
      complete: false,
      step: null,

      tooHigh: true,
      tooLow: false,
    };
  }

  addFinaliseCallback(callback) {
    this.setState(state => {
      state.finaliseCallbacks = state.finaliseCallbacks.concat(callback);
      return state;
    });
  }
  updateTutorials(tutorials) {
    this.setState(state => {
      state.tutorials = tutorials;
      return state;
    }, this.refreshStep);
  }
  refreshStep(callback) {
    if (this.state.tutorial !== null) {
      if (this.state.tutorial.complete && this.state.tutorial.complete.on == 'checkpointReached') {
        if (Cookie.get('tutorial_' + this.state.tutorial.key + '_' + this.state.tutorial.complete.checkpoint)) {
          Cookie.set('tutorial_complete_' + this.state.tutorial.key, true, {path: '/'});
        }
      }

      if (Cookie.get('tutorial_complete_' + this.state.tutorial.key)) {
        this.setState(state => {
          state.step = null;
          state.complete = true;
          state.popupActive = true;
          return state;
        });
        return;
      }
    }

    var newStep = null;
    var oldStepIndex;
    var newStepIndex;
    if (this.state.tutorial !== null) {
      for (var stepIndex = this.state.tutorial.steps.length - 1; stepIndex >= 0; stepIndex--) {
        var step = this.state.tutorial.steps[stepIndex];

        if (this.state.step !== null && step.key == this.state.step.key)
          oldStepIndex = stepIndex;

        var met = conditionsMet(step.activeWhen, true);
        if (newStep === null && met) {
          newStep = step;
          newStepIndex = stepIndex;
        }
      }
    }

    if (newStep === null) {
      if (this.state.step !== null) {
        this.setState(state => {
          state.step = null;
          state.complete = false;
          return state;
        }, function() {
          if (typeof callback == 'function')
            callback();
          this.refreshOffPage();
        });
      }
    }
    else {
      if (this.state.step === null || newStep.key != this.state.step.key) {
        this.setState(state => {
          state.step = newStep;
          state.complete = false;
          if (oldStepIndex === null || newStepIndex > oldStepIndex)
            state.popupActive = true;
          return state;
        }, function() {
          if (typeof callback == 'function')
            callback();
          this.refreshOffPage();
        });
      }
    }
  }
  refreshOffPage() {
    if (this.state.step !== null) {
      var highlight = JQuery(this.state.step.highlight);
      if (highlight && typeof highlight[0] !== 'undefined') {
        var rect = highlight[0].getBoundingClientRect();
        if (rect.bottom < 0) {
          if (this.state.tooHigh == true || this.state.tooLow == false) {
            this.setState(state => {
              state.tooHigh = false;
              state.tooLow = true;
              return state;
            });
          }
          return;
        }
        if (rect.top > window.outerHeight) {
          if (this.state.tooHigh == false || this.state.tooLow == true) {
            this.setState(state => {
              state.tooHigh = true;
              state.tooLow = false;
              return state;
            });
          }
          return;
        }
      }
    }
    if (this.state.tooHigh != false || this.state.tooLow != false) {
      this.setState(state => {
        state.tooHigh = false;
        state.tooLow = false;
        return state;
      });
    }
  }

  componentDidMount() {
    JQuery(document).on('shown.bs.dropdown', this.refreshStep.bind(this));
    JQuery(document).on('hidden.bs.dropdown', this.refreshStep.bind(this));
    // hide the tutorial when navigating to a link, already completed steps may show for the load time
    JQuery(document).on('click', 'a[href]:not([href=""]):not([href="#"])', (event) => {
      this.close();
    });
    var onInputChange = (event, ignoreBlank) => {
      var newValue = JQuery(event.target).val();
      if (this.proceedAfter !== null) {
        window.clearTimeout(this.proceedAfter);
        this.proceedAfter = null;
      }
      if (newValue == '' && ignoreBlank)
        return;
      if (this.state.tutorial !== null && !this.state.step.editWhileOpen)
        this.acknowledge(null);
      this.proceedAfter = window.setTimeout(() => {
        this.refreshStep();
      }, 1500);
    };
    onInputChange = onInputChange.bind(this);
    JQuery(document).on('shown.bs.modal', () => {
      this.acknowledge(null);
    });
    JQuery(document).on('single-page-tab-loaded', (event) => {
      window.setTimeout(() => {
        this.refreshStep();
      }, 500);
    });
    JQuery(document).on('input', 'input, textarea', (event) => {
      onInputChange(event, true);
    });
    JQuery(document).on('change', 'select', (event) => {
      onInputChange(event, true);
    });
    JQuery(document).on('change', 'input[type="radio"]', (event) => {
      onInputChange(event, false);
    });
    JQuery(document).on('selectChoice', (event) => {
      onInputChange(event, false);
    });
    JQuery(document).on('click', (event) => {
      onInputChange(event, false);
    });
    JQuery(document).on('submit', 'form', (event) => {
      if (!this.state.tutorial)
        return;

      var expect_form = function(form, method, url, callback) {
        if (method && form.attr('method') != method)
          return false;
        if (url && form.attr('action').match(url) === null)
          return false;
        callback();
        return true;
      };
      expect_form = expect_form.bind(this);

      var form = JQuery(event.target);
      if (this.state.tutorial.complete && this.state.tutorial.complete.on == 'form_submission') {
        expect_form(
          form,
          this.state.tutorial.complete.form.method,
          this.state.tutorial.complete.form.url,
          () => {
            Cookie.set(
              'tutorial_complete_' + this.state.tutorial.key,
              true,
              {path: '/'}
            );
          }
        );
      }
      if (!this.state.tutorial.checkpoints)
        return;
      for (var checkpointIndex = 0; checkpointIndex < this.state.tutorial.checkpoints.length; checkpointIndex++) {
        var checkpoint = this.state.tutorial.checkpoints[checkpointIndex];
        if (checkpoint.on != 'form_submission')
          continue;
        expect_form(
          form,
          checkpoint.form.method,
          checkpoint.form.url,
          () => {
            Cookie.set(
              'tutorial_' + this.state.tutorial.key + '_' + checkpoint.checkpoint,
              true,
              {path: '/'}
            );
          }
        );
      }
    });
    window.setInterval(this.refreshOffPage.bind(this), 500);
    window.setTimeout(() => {
      var tutorialKey = Cookie.get('tutorial_active');
      if (tutorialKey) {
        this.setState(state => {
          state.tutorial = Clone(state.tutorials[tutorialKey]);
          state.step = null;
          return state;
        }, () => {
          this.refreshStep(this.open.bind(this));
        });
      }
    }, 500);
  }
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.popupActive && this.state.popupActive) {
      if (this.state.step !== null && this.state.step.highlight) {
        var highlight = JQuery(this.state.step.highlight);
        if (!this.state.step.noFocus) {
          if (highlight.is('input') || highlight.is('select'))
            highlight.focus();
          else {
            highlight.find('input, select').first().focus();
          }
        }
      }
      this.setState(state => {
        state.blockingInput = true;
        return state;
      });
    }
    if (prevState.popupActive && !this.state.popupActive) {
      window.setTimeout(() => {
        if (!this.state.popupActive) {
          this.setState(state => {
            state.blockingInput = false;
            return state;
          });
        }
      }, 600);
    }
  }

  start(tutorialName) {
    var tutorial = this.state.tutorials[tutorialName];
    if (!tutorial) {
      console.error('Tutorial "' + tutorialName + '" not found.');
      return;
    }
    Cookie.set('tutorial_active', tutorialName, {path: '/'});
    clear_step_checkpoints(tutorial);
    this.setState(state => {
      state.tutorial = Clone(tutorial);
      state.step = null;
      state.popupActive = true;
      return state;
    }, () => {
      this.refreshStep();
    });
  }
  open() {
    if (this.state.tutorial !== null) {
      this.setState(state => {
        state.popupActive = true;
        return state;
      });
    }
  }
  dismissAnnouncement(event) {
    this.acknowledge(300);
  }
  acknowledge(delay) {
    if (this.state.tutorial === null)
      return;
    set_step_checkpoint(this.state.tutorial, this.state.step);
    this.close();
    if (delay !== null) {
      window.setTimeout(() => {
        this.refreshStep();
      }, delay);
    }
  }
  close() {
    if (this.state.popupActive && !this.state.complete) {
      this.setState(state => {
        state.popupActive = false;
        return state;
      });
    }
  }
  finalise() {
    this.abort();
    for (var callbackIndex = 0; callbackIndex < this.state.finaliseCallbacks.length; callbackIndex++) {
      var callback = this.state.finaliseCallbacks[callbackIndex];
      callback(this.state.tutorial);
    }
  }
  abort() {
    Cookie.remove('tutorial_active');
    if (this.state.tutorial !== null) {
      Cookie.remove('tutorial_complete_' + this.state.tutorial.key);
      this.setState(state => {
        state.tutorial = null;
        state.step = null;
        state.complete = false;
        state.popupActive = false;
        return state;
      });
    }
  }
  exit() {
    if (this.state.complete)
      return;
    this.abort();
  }

  renderHighlightStyles() {
    var styles = '';
    if (this.state.popupActive) {
      if (this.state.step !== null) {
        if (this.state.step.highlight) {
          var background = '';
          if (this.state.step.highlightBack) {
            background = `background: ${this.state.step.highlightBack};\n`;
          }

          styles += `
${this.state.step.highlight} {
  position: relative;
  z-index: ${BASE_Z_INDEX + 2};
  ${background}
}
          `;
        }
      }
    }
    return styles;
  }
  renderAnnotationStyles() {
    var step = this.state.step;
    var styles = '';
    if (this.state.popupActive) {
      if (step !== null) {
        if (step.annotate) {
          var margin, position, movement, selector, addSelector = '';
          if (step.annotateAfter) {
            margin = 'margin-top: 1rem;\n';
            position = 'position: absolute;\n';
            movement = 'top: 100%;\n';

            selector = step.annotateAfter;
            addSelector = step.annotateAfter + ':after';
          }
          else if (step.annotateBefore) {
            margin = 'margin-bottom: 1rem;\n';
            position = 'position: absolute;\n';
            movement = 'bottom: 100%;\n';

            selector = step.annotateBefore;
            addSelector = step.annotateBefore + ':before';
          }
          else if (step.annotateIn) {
            margin = 'margin-top: 1rem;\n';
            position = 'position: absolute;\n';

            selector = step.annotateIn;
            addSelector = step.annotateIn + ':after';
          }

          if (selector) {
            var content = (step.annotate || '');
            if (step.annotateSkip) {
              if (step.editWhileOpen) {
                content += `\n\nWhen you are done, press the '${step.annotateSkip}' button in the bottom right corner of your screen.`;
              }
              else {
                content += `\n\nTo continue, press the '${step.annotateSkip}' button in the bottom right corner of your screen.`;
              }
            }
            content = content.replace(/\n/g, '\\00000a').replace(/'/g, "\\'");
            styles += `
${addSelector} {
  opacity: 0.9;
  content: '${content}';
  ${margin}
  ${position}
  ${movement}
  left: 0;
  width: 100%;
  min-width: 200px;
  max-width: 500px;
  z-index: ${BASE_Z_INDEX + 2};
  color: #fff;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.2em;
  text-align: left;
}
          `;
        }
        if (step.annotateBefore || step.annotateAfter) {
          styles += `
${selector} {
  position: relative;
}
            `;
          }
        }
      }
    }
    return styles;
  }
  render() {
    var current;
    if (this.state.tutorial !== null) {
      var steps = [];
      var activeFound = false;
      for (var stepIndex = 0; stepIndex < this.state.tutorial.steps.length; stepIndex++) {
        var step = this.state.tutorial.steps[stepIndex];
        var active = (this.state.step !== null && step.key == this.state.step.key);

        if (active)
          activeFound = true;

        var icon;
        if (active) {
          steps.push(<li key={step.key} className="active">&#9679;</li>);
        }
        else if (!activeFound) {
          steps.push(<li key={step.key} className="complete">&#9679;</li>);
        }
        else {
          steps.push(<li key={step.key} className="future">&#9675;</li>);
        }
      }
      var actions = [];
      actions.push(
        <a
          key="abort"
          className="btn btn-primary btn-md float-xs-left"
          onClick={this.exit.bind(this)}
          disabled={this.state.complete}
        >
          Exit Tutorial
        </a>
      );
      if (this.state.blockingInput) {
        actions.push(
          <a
            key="hide"
            href="#"
            className="btn btn-secondary btn-md float-xs-right"
            onClick={(event) => {
              event.preventDefault();
              this.close();
            }}
            disabled={!this.state.popupActive || this.state.complete}
          >
            Hide Help
          </a>
        );
      }
      else {
        actions.push(
          <a
            key="open"
            href="#"
            className="btn btn-secondary btn-md float-xs-right"
            onClick={(event) => {
              event.preventDefault();
              this.open();
            }}
            disabled={this.state.complete}
          >
            Show Help
          </a>
        );
      }
      current = (
        <div className="status">
          <h4>{this.state.tutorial.title}</h4>
          <ul className="steps">
            {steps}
          </ul>
          <div className="actions">
            {actions}
          </div>
        </div>
      );
    }

    var complete;
    if (this.state.complete) {
      complete = (
        <div className="complete">
          <h2>{this.state.tutorial.complete.title || 'Tutorial Complete'}</h2>
          <p>{this.state.tutorial.complete.message}</p>
          <a className="btn btn-primary float-xs-right" onClick={this.finalise.bind(this)}>Complete</a>
        </div>
      );
    }

    var skipper;
    if (this.state.step !== null && this.state.step.annotateSkip) {
      skipper = (
        <div className="skipper">
          <p>
            <a className="btn btn-primary btn-block" href="#" onClick={(event) => {
              event.preventDefault();
              this.dismissAnnouncement();
            }}>
              {this.state.step.annotateSkip}
            </a>
          </p>
          <p>(Go to next step)</p>
        </div>
      );
    }

    var announcement;
    if (this.state.popupActive && this.state.step !== null && this.state.step.announce) {
      var dismiss;
      if (this.state.step.announceDismiss) {
        dismiss = (
          <a
            className="float-xs-right btn btn-secondary"
            href="#"
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            {this.state.step.announceDismiss}
          </a>
        );
      }
      announcement = (
        <div className="announcement">
          {this.state.step.announce.trim()}
          <div className="dismiss" onClick={this.dismissAnnouncement.bind(this)}>
            {dismiss}
          </div>
        </div>
      );
    }
    var blackoutSize = 0;
    if (this.state.blockingInput)
      blackoutSize = 100;
    return (
      <div className={ClassNames('react-tutorial-container', {'active': this.state.popupActive})}>
        <style>
          {this.renderHighlightStyles() + '\n' + this.renderAnnotationStyles()}
        </style>
        <div
          className={ClassNames('blackout', {
            'too-high': this.state.tooHigh,
            'too-low': this.state.tooLow,
          })}
          style={{
            width: blackoutSize + '%',
            height: blackoutSize + '%',
          }}
        >
          <div className="too-low">↑ Scroll up to see the next section of the tutorial ↑</div>
          <div className="too-high">↓ Scroll down to see the next section of the tutorial ↓</div>
        </div>
        <div
          className="announcements"
          style={{
            width: blackoutSize + '%',
            height: blackoutSize + '%',
          }}
        >
          {announcement}
        </div>
        {current}
        {complete}
        {skipper}
      </div>
    );
  }
}

export default Tutorial
