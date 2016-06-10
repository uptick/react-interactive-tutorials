import React from 'react'

const Tutorial = React.createClass({
  getInitialState: function() {
    return {
      tutorials: [],
    };
  },

  updateTutorials: function(tutorials) {
    this.setState(state => {
      state.tutorials = tutorials;
      return state;
    });
  },

  render: function() {
    console.log('tutorials are', this.state.tutorials);
    return (<p>Tutorials content here</p>);
  },
});

module.exports = Tutorial;
