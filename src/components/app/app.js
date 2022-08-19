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

  getMovies = async (text = '', pages = 1) => {
    this.setState({ loading: true });
    try {
      const service = this.service;
      const { movies, totalPages } = await service.getMovies(text, pages);
      this.setState({
        movies: movies,
        notFound: movies.length === 0,
        isError: false,
        totalPages: totalPages,
        searchMessage: text,
      });
    } catch (e) {
      this.setState({ isError: true, errorMessage: 'The request failed' });
    }
    this.setState({ loading: false });
  };

  getRatedMovies = async () => {
    const service = this.service;
    this.setState({ loading: true });
    const { movies } = await service.getRatedMovies();
    this.setState({ ratedMovies: movies, loading: false });
  };

  switchPage = (e) => {
    this.setState({ currentPage: e });
    this.getMovies(this.state.searchMessage, e);
    window.scrollTo(0, 0);
  };

  searchMovies = debounce((text) => this.getMovies(text), 1000);

  componentDidMount = async () => {
    const service = this.service;
    await service.createGuestSession();
    const genres = await service.getGenres();
    this.setState({ genres: genres });
    await this.getRatedMovies();
  };

  switchTab = async (e) => {
    if (e === '2') return this.getRatedMovies();
    const { currentPage, searchMessage } = this.state;
    return this.getMovies(searchMessage, currentPage);
  };

  setRatingAll = async () => {
    const { searchMessage, currentPage } = this.state;
    await this.getMovies(searchMessage, currentPage);
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
    if (JSON.stringify(prevState.movies) !== JSON.stringify(this.state.movies)) await this.setRatingAll();
    if (JSON.stringify(prevState.ratedMovies) !== JSON.stringify(this.state.ratedMovies)) await this.setRatingAll();
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
