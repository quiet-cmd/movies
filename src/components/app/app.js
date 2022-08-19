import React, { Component } from 'react';
import { Offline, Online } from 'react-detect-offline';
import { Spin, Alert, Pagination, Empty, Tabs } from 'antd';
import { debounce } from 'lodash';

import ThemoviedbService from '../../services/themoviedb-service';
import { GenresProvider } from '../context';
import CardList from '../card-list';
import Search from '../search';

import 'antd/dist/antd.min.css';

import './app.css';

export default class App extends Component {
  state = {
    movies: [],
    ratedMovies: [],
    currentPage: 1,
    totalPages: 0,
    searchMessage: '',
    genres: [],
    loading: false,
    isError: false,
    notFound: false,
    errorMessage: '',
  };
  service = new ThemoviedbService();

  getMovies = async () => {
    try {
      const { currentPage, searchMessage } = this.state;
      const { movies, totalPages } = await this.service.getMovies(searchMessage, currentPage);
      this.setState({ movies: movies, notFound: !movies.length, isError: false, totalPages: totalPages });
    } catch (e) {
      this.setState({ isError: true, errorMessage: 'The request failed' });
    }
  };

  getRatedMovies = async () => {
    const { movies } = await this.service.getRatedMovies();
    this.setState({ ratedMovies: movies });
  };

  switchPage = (e) => {
    this.setState({ currentPage: e });
    window.scrollTo(0, 0);
  };

  searchMovies = debounce((text) => this.setState({ searchMessage: text, currentPage: 1 }), 1000);

  componentDidMount = async () => {
    const service = this.service;
    await service.createGuestSession();
    this.setState({ genres: await service.getGenres() });
    await this.getRatedMovies();
    await this.getMovies();
  };

  switchTab = async (e) => {
    e === '2' ? this.getRatedMovies() : this.getMovies();
  };

  setRatingAll = async () => {
    await this.getMovies();
    this.setState({ loading: true });
    await this.getRatedMovies();
    const { movies, ratedMovies } = this.state;
    const NewMovies = [];
    for (let movie of movies) {
      let tmp = movie;
      for (let { id, rating } of ratedMovies) {
        if (id === tmp.id) movie.rating = rating;
      }
      NewMovies.push(tmp);
    }
    this.setState({ movies: NewMovies });
    this.setState({ loading: false });
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const { currentPage, searchMessage, movies, ratedMovies } = this.state;
    if (prevState.currentPage !== currentPage || prevState.searchMessage !== searchMessage) this.getMovies();
    else if (JSON.stringify(prevState.movies) !== JSON.stringify(movies)) await this.setRatingAll();
    else if (JSON.stringify(prevState.ratedMovies) !== JSON.stringify(ratedMovies)) await this.setRatingAll();
  };

  render() {
    const { genres, movies, ratedMovies, loading, isError, errorMessage, notFound, totalPages, currentPage } =
      this.state;
    return (
      <GenresProvider value={genres}>
        <main className="container">
          <Offline>
            <Alert message="Error" description="internet connection error" type="error" showIcon />
          </Offline>
          <Online>
            <Tabs defaultActiveKey="1" onChange={this.switchTab}>
              <Tabs.TabPane tab="Search" key="1">
                <Search searchMovies={this.searchMovies} />
                {loading && <Spin size="large" />}
                {notFound && <Empty />}
                {isError && !notFound && <Alert message="Error" description={errorMessage} type="error" showIcon />}
                <CardList movies={movies} service={this.service} />
                {!!totalPages && <Pagination current={currentPage} total={totalPages} onChange={this.switchPage} />}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Rated" key="2">
                {loading && <Spin size="large" />}
                {!ratedMovies.length && <Empty />}
                <CardList movies={ratedMovies} service={this.service} />
              </Tabs.TabPane>
            </Tabs>
          </Online>
        </main>
      </GenresProvider>
    );
  }
}
