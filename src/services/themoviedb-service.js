import { format, parse } from 'date-fns';
export default class ThemoviedbService {
  _apiBase = 'https://api.themoviedb.org/3';
  _apiKey = '?api_key=ec0eb18fbcc5a6af1e4eb4dcf922ea35';

  get guestToken() {
    return localStorage.getItem('token');
  }

  async getResource(url, opt = {}) {
    try {
      const res = await fetch(url, opt);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      return e.message;
    }
  }

  async createGuestSession() {
    const url = `${this._apiBase}/authentication/guest_session/new${this._apiKey}`;
    if (this.guestToken === null) {
      const key = await this.getResource(url);
      localStorage.setItem('token', key.guest_session_id.toString());
    }
  }

  async getMovies(query, page) {
    const url = `${this._apiBase}/search/movie${this._apiKey}&query=${query}&page=${page}&include_adult=false&language=en-US`;
    if (query.trim() === '') return { movies: [], totalPages: 0 };
    const { results, total_pages } = await this.getResource(url);
    return { movies: results.map(this._transformMovies), totalPages: total_pages };
  }

  async getRatedMovies() {
    const url = `${this._apiBase}/guest_session/${this.guestToken}/rated/movies${this._apiKey}`;
    const { results } = await this.getResource(url);
    return { movies: results.map(this._transformMovies) };
  }

  async getGenres() {
    const url = `${this._apiBase}/genre/movie/list${this._apiKey}&language=en-US`;
    const res = await this.getResource(url);
    return res.genres.reduce((acc, { id, name }) => {
      acc[id] = name;
      return acc;
    }, {});
  }

  setRating(id, rating) {
    const url = `${this._apiBase}/movie/${id}/rating${this._apiKey}&guest_session_id=${this.guestToken}`;
    const opt = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: rating }),
    };
    this.getResource(url, opt);
  }

  deleteRating(id) {
    const url = `${this._apiBase}/movie/${id}/rating${this._apiKey}&guest_session_id=${this.guestToken}`;
    const opt = {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    this.getResource(url, opt);
  }

  _transformMovies(item) {
    const formatDate = (date) => {
      if (!date) return 'unknown';
      return format(parse(date, 'yyyy-mm-dd', new Date()), 'MMMM d, yyyy');
    };
    const shortDescr = (str, len) => {
      if (str.length <= len) return str;
      let newStr = str.substring(0, len);
      let first = newStr.slice(0, newStr.lastIndexOf('.')) + '...';
      let second = newStr.slice(0, newStr.lastIndexOf(' ')) + '...';
      return second.length > first.length ? second : first;
    };
    return {
      id: item.id,
      title: item.title,
      overview: shortDescr(item.overview, 150),
      releaseDate: formatDate(item.release_date),
      posterPath: item.poster_path,
      genreIds: item.genre_ids,
      voteAverage: item.vote_average.toFixed(1),
      rating: item.rating || 0,
    };
  }
}
