$(document).ready(function() {
    // OpenWeatherMap API key
    const apiKey = 'df60fbdfd7a86ba5d213f161a6eb0622'; 
    
    // Retrieve the search history from localStorage or initialize an empty array if none exists
    let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

    // Function to render search history buttons
    function renderSearchHistory() {
        
        $('#history').empty();
        
        searchHistory.forEach(city => {
            $('#history').append(`<button class="history-btn" data-city="${city}">${city}</button>`);
        });
    }

    // Function to fetch and display weather data for a given city
    function getWeather(city) {
        // URL to get geographic coordinates (latitude and longitude) based on the city name
        const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        
        // Make an AJAX request to get geographic coordinates
        $.getJSON(geoURL, function(geoData) {
            // Check if the city is found in the API response
            if (geoData.length === 0) {
                alert('City not found!');
                return;
            }

            // Extract latitude and longitude from the API response
            const lat = geoData[0].lat;
            const lon = geoData[0].lon;
            
            // URL to get the 5-day weather forecast based on the city's latitude and longitude
            const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            // Make an AJAX request to get weather data
            $.getJSON(weatherURL, function(weatherData) {
                // Display the current weather data (first entry in the list)
                const today = weatherData.list[0];
                $('#today').html(`
                    <h2>${weatherData.city.name} (${dayjs().format('MMM D, YYYY')})</h2>
                    <img src="https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png" alt="${today.weather[0].description}">
                    <p>Temperature: ${today.main.temp}°C</p>
                    <p>Humidity: ${today.main.humidity}%</p>
                    <p>Wind Speed: ${today.wind.speed} m/s</p>
                `);

                // Clear the forecast section before appending new forecast data
                $('#forecast').empty();
                
                // Loop through the forecast data to display weather for the next 5 days
                for (let i = 1; i <= 5; i++) {
                    const forecast = weatherData.list[i * 8 - 1]; // Data is taken every 3 hours, so we select data approximately 24 hours apart
                    $('#forecast').append(`
                        <div class="forecast-day">
                            <h3>${dayjs(forecast.dt_txt).format('MMM D')}</h3>
                            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                            <p>Temp: ${forecast.main.temp}°C</p>
                            <p>Humidity: ${forecast.main.humidity}%</p>
                        </div>
                    `);
                }
            });
        });
    }

    // Event listener for the search form submission
    $('#search-form').on('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        
        // Get the city name from the input field
        const city = $('#search-input').val().trim();
        
        // If the city is not empty and not already in the search history, add it to the history
        if (city && !searchHistory.includes(city)) {
            searchHistory.push(city);
            localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        }
        
        // Re-render the search history buttons
        renderSearchHistory();
        
        // Fetch and display the weather data for the searched city
        getWeather(city);
    });

    // Event listener for clicking on a city in the search history
    $('#history').on('click', '.history-btn', function() {
        const city = $(this).data('city'); // Get the city name from the data attribute
        getWeather(city); // Fetch and display weather data for the selected city
    });

    // Initial render of the search history
    renderSearchHistory();
    
    // If there's a search history, display the weather for the last searched city
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});
