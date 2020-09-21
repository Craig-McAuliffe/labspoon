import qs from 'qs';

export const searchStateToURL = (location, searchState) =>
  searchState ? `${location.pathname}${createURL(searchState)}` : '';

export const createURL = (state) => `?${qs.stringify(state)}`;
