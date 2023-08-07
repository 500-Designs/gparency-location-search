import React, { useState, useEffect } from 'react';
import './SearchSuggestions.css'; // Import the CSS file
import SearchButtonIcon from './SearchButtonIcon';

const SearchSuggestions = () => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null, street: '', state: '', country: '', zip: '', city: '' });

  let marketplaceAppUrl = 'https://marketplace.gparency.com?zoomLevel=17';
  let wpUrl = window.location.origin;
  if (wpUrl === "http://localhost:3000") {
    wpUrl = "https://gparency.local";
  }
  if (wpUrl === "https://gparencydev.wpengine.com/") {
    marketplaceAppUrl = 'https://marketplace.gparency.com?zoomLevel=17';
  }

  useEffect(() => {
    if (location.lat !== null && location.lng !== null) {
      console.log('Selected location:', location);
      handleSearchSubmit();
    }
  }, [location]);

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchValue(value);
    fetchSuggestions(value);
  };

  const fetchSuggestions = (value) => {
    fetch(
      `${wpUrl}/wp-json/gaprency/v1/proxy?endpoint=place/autocomplete/json&input=${value}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.predictions) {
          setSuggestions(data.predictions);
        }
      })
      .catch((error) => console.log(error));
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.description);
    fetch(
      `${wpUrl}/wp-json/gaprency/v1/proxy?endpoint=place/details/json&place_id=${suggestion.place_id}&fields=address_component,geometry`
    )
      .then((response) => response.json())
      .then((data) => {
        const latitude = data.result.geometry.location.lat;
        const longitude = data.result.geometry.location.lng;

        const addressComponents = data.result.address_components;
        const street = encodeURIComponent(addressComponents.find((component) => component.types.includes('route'))?.long_name || '');
        const city = encodeURIComponent(addressComponents.find((component) => component.types.includes('locality'))?.long_name || '');
        const state = encodeURIComponent(addressComponents.find((component) => component.types.includes('administrative_area_level_1'))?.short_name || '');
        const country = encodeURIComponent(addressComponents.find((component) => component.types.includes('country'))?.long_name || '');
        const zip = encodeURIComponent(addressComponents.find((component) => component.types.includes('postal_code'))?.long_name || '');

        setLocation({ lat: latitude, lng: longitude, street, state, country, zip, city });

        setSuggestions([]);
      })
      .catch((error) => console.log(error));
  };

  const handleSearchSubmit = () => {
    if (location.lat !== null && location.lng !== null) {
      const { lat, lng, street, state, country, zip, city } = location;
      const url = `${marketplaceAppUrl}&lat=${lat}&lng=${lng}&street=${street}&state=${state}&country=${country}&zip=${zip}&city=${city}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="appSearchContainer">
      <input type="text" className='appSearchField' value={searchValue} onChange={handleChange} placeholder='Search by Address, City, State, Zip or County' />
      <button onClick={handleSearchSubmit} className="appSearchButton" disabled={(location.lat && location.lng ) ? false : true } >
        <SearchButtonIcon />
      </button>

      {suggestions.length > 0 &&
        <ul className="appSuggesstions">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id} className="appSuggestion" onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.description}
            </li>
          ))}
        </ul>
      }
    </div>
  );
};

export default SearchSuggestions;
