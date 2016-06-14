# react-interactive-tutorials
Framework for creating unobtrusive interactive tutorials for use in web apps.

## How it Works
Tutorials are represented as a set of prompts that will result in the user successfully completing
actions within the interface of your app.

Rather than storing a state of the current tutorial step, the currently active tutorial step is
calculated on the fly by the step configuration's set of conditions. This allows the user to go off
and do something unexpected / get lost in the middle of a tutorial without consequence.
