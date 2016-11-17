import jQuery from 'jquery'

import interactiveTutorials from 'react-interactive-tutorials'
import {
  paragraphs,
  registerTutorials,
  startTutorial,
} from 'react-interactive-tutorials'

const TUTORIALS = {
  'demo': {
    key: 'demo',
    title: 'Demo Tutorial',
    steps: [
      {
        key: 'anywhere',
        announce: paragraphs`
          The tutorial will present itself as a series of modals with annotations and prompts on how
          to progress. This, in fact, is an announcement-style tutorial step.

          Feel free to hide / show this modal at any point to attempt to break the flow of the
          tutorial. You should not be able to force the tutorial into any situtation it cannot
          recover from.
        `,
        announceDismiss: "Okay, let's begin",
        activeWhen: [],
      },
      {
        key: 'beginning',
        highlight: '#colour',
        annotate: paragraphs`
          Step one: choose your favourite colour.

          Note that you can skip this step if your favourite colour was guessed correctly.
        `,
        annotateIn: 'div.colour-input-group > div',
        annotateSkip: 'Skip',
        activeWhen: [
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_anywhere',
          },
        ],
      },
      {
        key: 'entering-name',
        highlight: '#name',
        annotate: 'Now we need to know your full name. This is mandatory, so start typing!',
        annotateIn: 'div.name-input-group > div',
        activeWhen: [
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_beginning',
          },
        ],
      },
      {
        key: 'optional-info',
        highlight: 'form div.form-details',
        highlightBack: '#fff',
        annotate: paragraphs`
          You can choose to enter more information at this point, and review the information you
          have already provided.

          The help overlay will remain open whilst you are typing.
        `,
        annotateAfter: 'form div.form-details',
        annotateSkip: 'Okay I am done',
        editWhileOpen: true,
        activeWhen: [
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_anywhere',
          },
          {
            compare: 'inputNotVal',
            selector: '#name',
            value: '',
          },
        ],
      },
      {
        key: 'submission',
        highlight: 'form button[type="submit"]',
        annotate: 'Click "Submit" to submit the form and continue',
        annotateAfter: 'form button[type="submit"]',
        activeWhen: [
          {
            compare: 'inputNotVal',
            selector: '#name',
            value: '',
          },
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_optional-info',
          },
        ],
      },
      {
        key: 'new-page',
        announce: paragraphs`
          The tutorial state can be inferred across pages, if you set your conditions wisely.

          In this case, the url matching 'react-interactive-tutorials/demo-form' is used to
          recognise the fact that we have progressed.
        `,
        announceDismiss: 'Okay, cool',
        activeWhen: [
          {
            compare: 'url',
            url: /^\/react-interactive-tutorials\/demo-form$/,
          },
        ],
      },
      {
        key: 'returning',
        highlight: '#return',
        annotate: "Let's return to the first page with the code",
        annotateAfter: '#return',
        activeWhen: [
          {
            compare: 'url',
            url: /^\/react-interactive-tutorials\/demo-form$/,
          },
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_new-page',
          },
        ],
      },
      {
        key: 'complete',
        announce: paragraphs`
          Now we're back at the first page, but we know the user has acknowledged the announcements
          on the previous page.
        `,
        announceDismiss: 'Okay',
        activeWhen: [
          {
            compare: 'url',
            url: /^\/react-interactive-tutorials\/$/,
          },
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_new-page',
          },
        ],
      },
    ],
    complete: {
      on: 'checkpointReached',
      checkpoint: 'complete',
      title: 'Demo Tutorial Complete!',
      message: paragraphs`
        And so concludes the demo tutorial.

        Take a look at the code for this tutorial below, and get started writing your own
        tutorials!
      `,
    },
  },
};

registerTutorials(TUTORIALS);

jQuery('a.begin-tutorial').on('click', (event) => {
  event.preventDefault();
  startTutorial('demo');
});
