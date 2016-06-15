var tutorials = {
  'demo': {
    key: 'demo',
    title: 'Demo Tutorial',
    steps: [
      {
        key: 'anywhere',
        announce: 'The tutorial prompts will present themselves as a series of modals with \
annotations and prompts on how to progress. This, in fact, is an announcement-style tutorial step.\
\n\nFeel free to hide / show this modal at any point to attempt to break the flow of the tutorial. \
You should not be able to force the tutorial into any situtation it cannot recover from.',
        announceDismiss: "Okay, let's begin",
        activeWhen: [],
      },
      {
        key: 'beginning',
        highlight: '#colour',
        annotate: 'Step one: choose your favourite colour.\n\nNote that you can skip this step if \
your favourite colour was guessed correctly.',
        annotateAfter: '#colour',
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
        annotateAfter: '#name',
        activeWhen: [
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_beginning',
          },
        ],
      },
      {
        key: 'optional-info',
        highlight: '#more-info',
        annotate: 'You can choose to enter more information at this point.',
        annotateAfter: '#more-info',
        annotateSkip: 'I would rather not',
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
        highlight: 'button[type="submit"]',
        annotate: 'Click "Submit" to submit the form and continue',
        annotateAfter: 'div.actions > div:last-child',
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
        announce: 'The tutorial state can be inferred across pages, if you set your conditions \
wisely.\n\nIn this case, the url matching "/demo-form/" is used to recognise the fact that we have \
progressed.',
        announceDismiss: 'Okay, cool',
        activeWhen: [
          {
            compare: 'url',
            url: /^\/react-interactive-tutorials\/demo-form\/$/,
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
            url: /^\/react-interactive-tutorials\/demo-form\/$/,
          },
          {
            compare: 'checkpointComplete',
            checkpoint: 'demo_new-page',
          },
        ],
      },
      {
        key: 'complete',
        announce: "Now we're back at the first page, but we know the user has acknowledged the \
announcements on the previous page.",
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
      message: 'And so concludes the demo tutorial.\n\nTake a look at the code for this tutorial \
below, and get started writing your own tutorials!',
    },
  },
};
interactiveTutorials.registerTutorials(tutorials);
