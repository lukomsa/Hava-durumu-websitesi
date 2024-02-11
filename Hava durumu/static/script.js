let userLatitude;
let userLongitude;
const apiKey = 'YOUR_API';

const translations = {
    tr: {
        appTitle: "Hava Durumu Uygulaması",
        searchButton: "Ara",
        currentLocationWeather: "Mevcut Konumun Hava Durumu",
        searchResults: "Arama Sonuçları",
        placeholder: "Bir şehir adı girin...",
        temperature: "Sıcaklık",
        weatherCondition: "Hava Durumu",
        humidity: "Nem",
        pressure: "Basınç",
        windSpeed: "Rüzgar Hızı",
        weatherInfoNotAvailable: "Hava durumu bilgisi alınamadı."
    },
    nl: {
        appTitle: "Weer App",
        searchButton: "Zoeken",
        currentLocationWeather: "Het weer op uw locatie",
        searchResults: "Zoekresultaten",
        placeholder: "Voer een stadsnaam in...",
        temperature: "Temperatuur",
        weatherCondition: "Weerconditie",
        humidity: "Vochtigheid",
        pressure: "Druk",
        windSpeed: "Windsnelheid",
        weatherInfoNotAvailable: "Weer informatie is niet beschikbaar."
    },
    en: {
        appTitle: "Weather App",
        searchButton: "Search",
        currentLocationWeather: "Current Location Weather",
        searchResults: "Search Results",
        placeholder: "Enter a city name...",
        temperature: "Temperature",
        weatherCondition: "Weather Condition",
        humidity: "Humidity",
        pressure: "Pressure",
        windSpeed: "Wind Speed",
        weatherInfoNotAvailable: "Weather information could not be obtained."
    }
};

function getTranslation(lang, key) {
    return translations[lang][key] || key;
}

document.addEventListener('DOMContentLoaded', function() {
    const defaultLang = 'tr';
    updateTexts(defaultLang);
    if (navigator.geolocation && !userLatitude && !userLongitude) {
        navigator.geolocation.getCurrentPosition(position => {
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            getWeatherByLocation(userLatitude, userLongitude, 'currentWeather', defaultLang);
        }, () => alert(getTranslation(defaultLang, 'weatherInfoNotAvailable')));
    }
    
    document.getElementById('languageSelect').addEventListener('change', function() {
        const selectedLang = this.value;
        updateTexts(selectedLang);

        // If weather data already fetched for current location or a city, refresh it on language change
        if (userLatitude && userLongitude) {
            getWeatherByLocation(userLatitude, userLongitude, 'currentWeather', selectedLang);
        } else {
            const cityInput = document.getElementById('cityInput').value;
            if (cityInput) {
                getWeatherByCity(selectedLang);
            }
        }
    });
});

function getWeatherByLocation(lat, lon, elementId, lang) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;
    fetchWeatherData(url, elementId, lang);
}

function getWeatherByCity(lang) {
    const city = document.getElementById('cityInput').value;
    if (!city) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`;
    fetchWeatherData(url, 'searchResults', lang);
}

function fetchWeatherData(url, elementId, lang) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(getTranslation(lang, 'weatherInfoNotAvailable'));
            return response.json();
        })
        .then(data => {
            const result = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <p>${getTranslation(lang, 'temperature')}: ${data.main.temp} °C</p>
                <p>${getTranslation(lang, 'weatherCondition')}: ${data.weather[0].description}</p>
                <p>${getTranslation(lang, 'humidity')}: ${data.main.humidity}%</p>
                <p>${getTranslation(lang, 'pressure')}: ${data.main.pressure} hPa</p>
                <p>${getTranslation(lang, 'windSpeed')}: ${data.wind.speed} m/s</p>
            `;
            document.getElementById(elementId).innerHTML = result;
        })
        .catch(error => {
            console.error("A error occurred: ", error);
            document.getElementById(elementId).innerHTML = `<p>${getTranslation(lang, 'weatherInfoNotAvailable')}</p>`;
        });
}

document.querySelector('button').addEventListener('click', () => {
    const selectedLang = document.getElementById('languageSelect').value;
    getWeatherByCity(selectedLang);
});

document.getElementById('cityInput').addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        const selectedLang = document.getElementById('languageSelect').value;
        getWeatherByCity(selectedLang);
        
        // Close the keyboard by removing focus
        this.blur();
    }
});

function updateTexts(lang) {
    document.querySelector('title').textContent = getTranslation(lang, 'appTitle');
    document.getElementById('cityInput').placeholder = getTranslation(lang, 'placeholder');
    document.querySelectorAll('[data-key]').forEach(elem => {
        const key = elem.getAttribute('data-key');
        elem.textContent = getTranslation(lang, key);
    });

    // Refresh the weather data if already displayed in the current language
    const currentWeatherDisplayed = document.getElementById('currentWeather').innerHTML;
    const searchResultsDisplayed = document.getElementById('searchResults').innerHTML;
    if (currentWeatherDisplayed || searchResultsDisplayed) {
        if (userLatitude && userLongitude) {
            getWeatherByLocation(userLatitude, userLongitude, 'currentWeather', lang);
        } else {
            const cityInput = document.getElementById('cityInput').value;
            if (cityInput) {
                getWeatherByCity(lang);
            }
        }
    }
}
