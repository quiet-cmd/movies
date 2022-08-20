import React, { Component } from 'react';
import { Tag, Rate } from 'antd';

import './card.css';
import { GenresConsumer } from '../context';

import defaultImg from './404.png';

export default class Card extends Component {
  state = {
    rating: 0,
  };

  updateRating = async (e) => {
    const { service, id } = this.props;
    if (e === 0) {
      this.setState({ rating: e });
      await service.deleteRating(id);
      return;
    }
    await service.setRating(id, e);
    this.setState({ rating: e });
  };

  setRatingColor = (rate) => {
    if (rate < 3) return '#E90000';
    if (rate < 5) return '#E97E00';
    if (rate <= 7) return '#E9D100';
    if (rate > 7) return '#66E900';
  };

  componentDidMount() {
    this.setState({ rating: this.props.rating });
  }

  componentDidUpdate(prevState) {
    if (prevState.rating !== this.props.rating) this.setState({ rating: this.props.rating });
  }

  render() {
    const { posterPath, title, overview, releaseDate, genreIds, voteAverage } = this.props;

    const genres = genreIds.map((el) => {
      return <GenresConsumer key={el}>{(genres) => <Tag>{genres[el]}</Tag>}</GenresConsumer>;
    });

    return (
      <div className="card">
        <div className="card__img">
          <img src={posterPath ? `https://image.tmdb.org/t/p/original/${posterPath}` : defaultImg} alt="" />
        </div>
        <div className="card__info">
          <h2 className="card__title">{title}</h2>
          <div className="card__rate" style={{ borderColor: this.setRatingColor(voteAverage) }}>
            {voteAverage}
          </div>
          <p className="card__date">{releaseDate}</p>
          <div className="card__genres genres">{genres}</div>
          <p className="card__description">{overview}</p>
          <Rate count={10} onChange={this.updateRating} value={this.state.rating} />
        </div>
      </div>
    );
  }
}
