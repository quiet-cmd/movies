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
    this.setState({ genres: await service.getGenres() });
    if (localStorage.getItem('token') === null) {
      const key = await service.createGuestSession();
      localStorage.setItem('token', key.toString());
    }
    this.getRatedMovies();
  };

  switchTab = async (e) => {
    if (e === '2') return this.getRatedMovies();
    const { searchMessage, currentPage } = this.state;
    return this.getMovies(searchMessage, currentPage);
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
