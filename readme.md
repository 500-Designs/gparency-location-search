  

# gparency-location-search-app
  

- A Wordpress plugin that renders a location search app on home page when shortcode "[gaprency_search_app]" is added
- After location is selected and search bar is clicked, 
	- a new tab is loaded for Gaprency marketplace app passing lat and long for the selected location like so:
		`https://auth.marketplace.gparency.com/?lat={LATITUDE}&lng=-{LONGITUDE}`
		example: https://auth.marketplace.gparency.com/?lat=37.7749295&lng=-122.4194155
	- final url working format for GParency marketplace app accepting the lat and long is yet to be verified and provided by client

- preview: ![widget preview](https://github.com/jamesdev500/gparency-location-search/blob/main/preview.png)

- google api key is used in the plugin php file, and must be updated to paid account, and set necessary site environment urls as restrictions to the google cloud account