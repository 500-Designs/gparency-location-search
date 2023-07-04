import './App.css';
// import LocationSearch from './components/LocationSearch';
// import MapContainer from './components/MapContainer';
// import AutoComplete from './components/AutoComplete';
import SearchSuggestions from './components/SearchSuggestions';

// import Autocomplete from "react-google-autocomplete";
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

// const GOOGLE_PLACES_API_KEY = 'AIzaSyCl-7pJgI-AXJmpjtYmrJvKtL7p6bP4_W0';

function App() {
  return (
    <div className="LocationSearchApp">
      <SearchSuggestions />
    </div>
  );
}

export default App;
