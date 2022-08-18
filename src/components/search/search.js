import React, { Component } from 'react';

import './search.css';

export default class Search extends Component {
  state = {
    value: '',
  };

  inputText = (e) => {
    this.setState({ value: e.target.value });
    this.props.searchMovies(e.target.value);
  };

  render() {
    return (
      <input className="search" placeholder="Type to search..." value={this.state.value} onChange={this.inputText} />
    );
  }
}
