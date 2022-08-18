import React, { Component } from 'react';

import Card from '../card';

import './card-list.css';

export default class CardList extends Component {
  render() {
    const { service, movies } = this.props;
    const moviesList = movies.map(({ id, ...props }) => {
      return <Card key={id} id={id} {...props} service={service} />;
    });
    return <div className="card-list">{moviesList}</div>;
  }
}
