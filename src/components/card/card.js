import React, { Component } from 'react';
import { Tag, Rate } from 'antd';

import './card.css';
import { GenresConsumer } from '../context';

import defaultImg from './404.png';

export default class Card extends Component {
  state = {
    rating: 0,
  };

  updateRating = (e) => {
    const { service } = this.props;
    if (e === 0) return service.deleteRating(this.props.id);
    service.setRating(this.props.id, e);
    this.setState({ rating: e });
  };

  rateColor = (rate) => {
    let color = '#E90000';
    if (rate < 3) color = '#E90000';
    else if (rate < 5) color = '#E97E00';
    else if (rate <= 7) color = '#E9D100';
    else if (rate > 7) color = '#66E900';
    return { borderColor: color };
  };

  render() {
    const { posterPath, title, overview, releaseDate, genreIds, voteAverage, rating } = this.props;
    const genres = genreIds.map((el) => {
      return <GenresConsumer key={el}>{(genres) => <Tag>{genres[el]}</Tag>}</GenresConsumer>;
    });

    return (
      <div className="card">
        <aside className="card__img">
          <img src={posterPath ? `https://image.tmdb.org/t/p/original/${posterPath}` : defaultImg} alt="" />
        </aside>
        <div className="card__info">
          <h2 className="card__title">{title}</h2>
          <div className="card__rate" style={this.rateColor(voteAverage)}>
            {voteAverage}
          </div>
          <p className="card__date">{releaseDate}</p>
          <div className="card__genres genres">{genres}</div>
          <p className="card__description">{overview}</p>
          <Rate count={10} onChange={this.updateRating} value={rating} />
        </div>
      </div>
    );
  }
}