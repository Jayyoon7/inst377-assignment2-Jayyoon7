// Function to initialize Annyang
function initializeAnnyang() {
  const commands = {
    'navigate to *page': (page) => {
      window.location.href = page + '.html';
    },
    'change the color to *color': (color) => {
      document.body.style.backgroundColor = color;
    },
    'hello': () => { alert('Hello'); },
    'look up *ticker': (ticker) => {
      document.getElementById('ticker').value = ticker.toUpperCase();
      document.getElementById('form').dispatchEvent(new Event('submit'));
    },
    'Load Dog Breed *DogBreedName': (DogBreedName) => {
      const breedName = DogBreedName.toLowerCase();
      const button = [...document.querySelectorAll('.button')].find(button => button.textContent.toLowerCase() === breedName);
      if (button) {
        button.click();
      }
    }
  };
  annyang.addCommands(commands);
}

// Function to turn on Annyang
function turnOnAnnyang() {
  sessionStorage.setItem('annyangState', 'on');
  annyang.start();
}

// Function to turn off Annyang
function turnOffAnnyang() {
  sessionStorage.setItem('annyangState', 'off');
  annyang.abort();
}

// Initialize Annyang when the page loads
window.onload = function () {
  initializeAnnyang();
  const annyangState = sessionStorage.getItem('annyangState');
  if (annyangState === 'on') {
    annyang.start();
  } else {
    annyang.abort();
  }
};

// Fetch random quotes
fetch('https://api.quotable.io/random')
  .then(response => response.json())
  .then(data => {
    const quote = data.content;
    const author = data.author;
    document.getElementById('quote').textContent = `"${quote}" - ${author}`;
  })

// Fetch dog images
document.addEventListener('DOMContentLoaded', function () {
  fetch('https://dog.ceo/api/breeds/image/random/10')
    .then(response => response.json())
    .then(data => {
      const dogImages = data.message;

      const carouselContainer = document.getElementById('dog-carousel');
      let carouselHTML = '';
      dogImages.forEach(image => {
        carouselHTML += `<img src="${image}"/>`;
      });
      carouselContainer.innerHTML = carouselHTML;

      simpleslider.getSlider();
    })
});

// Fetch dog breed info
document.addEventListener("DOMContentLoaded", function () {
  const buttonsContainer = document.getElementById('buttons-container');
  const breedInfoContainer = document.getElementById('breed-info-container');
  const breedNameElement = document.getElementById('breed-name');
  const breedDescriptionElement = document.getElementById('breed-description');
  const minLifeElement = document.getElementById('min-life');
  const maxLifeElement = document.getElementById('max-life');

  fetch('https://dogapi.dog/api/v2/breeds')
    .then(response => response.json())
    .then(data => {
      data.data.forEach(breed => {
        createButton(breed.attributes);
      });
    })

  function createButton(breed) {
    const button = document.createElement('button');
    button.textContent = breed.name;
    button.className = 'button';
    button.addEventListener('click', function () {

      breedNameElement.textContent = "Name: " + breed.name;
      breedDescriptionElement.textContent = "Description: " + breed.description;
      minLifeElement.textContent = breed.life.min;
      maxLifeElement.textContent = breed.life.max;
      breedInfoContainer.style.display = 'block';
    });
    buttonsContainer.appendChild(button);
  }
});

// stocks chart
document.addEventListener("DOMContentLoaded", function () {
  var myChart;

  document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();

    var ticker = document.getElementById('ticker').value.toUpperCase();
    var duration = document.getElementById('duration').value;

    var today = new Date();
    var fromDate = new Date(today);
    fromDate.setDate(today.getDate() - duration);
    var toDate = new Date();

    var fromDateString = fromDate.toISOString().split('T')[0];
    var toDateString = toDate.toISOString().split('T')[0];

    var apiUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDateString}/${toDateString}?adjusted=true&sort=asc&limit=120&apiKey=gqPHHKlq4bqUh1DpiUWPjUIoVK5A8G0C`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        var labels = data.results.map(result => {
          var date = new Date(result.t);
          return date.toLocaleDateString();
        });
        var prices = data.results.map(result => result.c);

        if (myChart) {
          myChart.destroy();
        }

        const ctx = document.getElementById('stocksChart');

        myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Stock Price',
              data: prices,
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }
        });
      })
  });
});

/* reddit table */
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

async function populateTable() {
  const todayDateString = getTodayDateString();
  const response = await fetch(`https://tradestie.com/api/v1/apps/reddit?date=${todayDateString}`);
  const data = await response.json();

  data.sort((a, b) => b.no_of_comments - a.no_of_comments);

  const top5Data = data.slice(0, 5);

  const tbody = document.querySelector('#reddit-table tbody');

  top5Data.forEach(entry => {
    const row = document.createElement('tr');
    let sentimentImage = '';
    if (entry.sentiment === 'Bullish') {
      sentimentImage = '<img src="https://static.vecteezy.com/system/resources/thumbnails/015/956/526/small_2x/bulls-stock-market-trend-trading-exchange-up-green-arrow-chart-price-chart-going-up-global-economic-boom-design-finance-logo-economic-finance-chart-business-productivity-logo-icon-vector.jpg" alt="Bullish">';
    } else if (entry.sentiment === 'Bearish') {
      sentimentImage = '<img src="https://www.centasec.com/oceanic/wp-content/uploads/2022/06/19.jpg" alt="Bearish">';
    }
    row.innerHTML = `
      <td><a href="https://finance.yahoo.com/quote/${entry.ticker}" target="_blank">${entry.ticker}</a></td>
      <td>${entry.no_of_comments}</td>
      <td>${sentimentImage}</td>
    `;
    tbody.appendChild(row);
  });
}

populateTable();