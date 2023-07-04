import React, { useState, useEffect } from 'react';
import './SearchSuggestions.css'; // Import the CSS file
import SearchButtonIcon from './SearchButtonIcon';

const SearchSuggestions = () => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });

  let wpUrl = window.location.origin;
  if (wpUrl === "http://localhost:3000") {
    wpUrl = "https://gparency.local";
  }

  useEffect(() => {
    if (location.lat !== null && location.lng !== null) {
      console.log('Selected location:', location);
      
    }
  }, [location]);

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchValue(value);

    // Call the Google Places API to fetch search suggestions
    fetchSuggestions(value);
  };

  const fetchSuggestions = (value) => {
    // Make an API call to the Google Places API to get search suggestions
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
      `${wpUrl}/wp-json/gaprency/v1/proxy?endpoint=place/details/json&place_id=${suggestion.place_id}&fields=geometry`
    )
      .then((response) => response.json())
      .then((data) => {
        const latitude = data.result.geometry.location.lat;
        const longitude = data.result.geometry.location.lng;

        // Store lat and long in state
        setLocation({ lat: latitude, lng: longitude });

        // Clear the suggestions
        setSuggestions([]);
      })
      .catch((error) => console.log(error));
  };

  const handleSearchSubmit = () => {
    if (location.lat !== null && location.lng !== null) {
      const url = `https://auth.marketplace.gparency.com/?lat=${location.lat}&lng=${location.lng}`;
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
