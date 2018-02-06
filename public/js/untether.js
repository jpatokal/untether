var TETHERED = [ "BitFinex", "Poloniex", "Hitbtc", "Bittrex" ];
var USD = [ "Bitstamp", "Kraken" ];
var ALL = TETHERED.concat(USD);
// Ignore USD exchanges outside US
var IGNORED = [ "cex.io", "Exmo", "Livecoin", "WEX.nz" ]
// has usdt/usd pairs: exmo, kraken

var timeSeries;
var chart;
var ticks = 1;
var nameToIndex = {};

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(initChart);

function weightedAvg(prices, weights) {
  var total = 0;
  var weight = 0;
  for(p in prices) {
    total += prices[p] * weights[p];
    weight += weights[p];
  }
  return total / weight;
}

function marketType(name) {
  var type = false;
  var index = -1;
  TETHERED.some(function(element, i) {
      if (name.toLowerCase() === element.toLowerCase()) {
          type = "TETHER";
      }
  });
  USD.some(function(element, i) {
      if (name.toLowerCase() === element.toLowerCase()) {
          type = "USD"
      }
  });
  return type;
}

function update() {
  $('.spinner').removeClass('hidden');
  $.ajax({
    url: "https://api.cryptonator.com/api/full/btc-usd"
  }).success(function(data) {
    tetherPrices = [];
    tetherVolumes = [];
    usdPrices = [];
    usdVolumes = [];
    timeStamp = new Date().toLocaleString();
    row = Array(ALL.length ).fill(0);
    row.unshift(timeStamp);
    for(m in data["ticker"]["markets"]) {
      market = data["ticker"]["markets"][m];
      name = market["market"];
      price = parseFloat(market["price"]);
      volume = parseInt(market["volume"]);
      console.log(market);
      switch(marketType(name)) {
        case "TETHER":
          tetherPrices.push(price);
          tetherVolumes.push(market["volume"]);
          row[nameToIndex[name]] = price;
          break;
        case "USD":
          usdPrices.push(price)
          usdVolumes.push(market["volume"])
          row[nameToIndex[name]] = price;
          break;
        default:
          console.log("Ignoring", market)
          continue;
      }
      $(".price ." + market["market"]).text("$" + price.toFixed(2));
      $(".volume ." + market["market"]).text(volume.toFixed(0));
    }
    tetherAvg = weightedAvg(tetherPrices, tetherVolumes);
    usdAvg = weightedAvg(usdPrices, usdVolumes);
    row.push(tetherAvg);
    row.push(usdAvg);
    spread = tetherAvg - usdAvg;
    $(".tetherAvg").text("$" + tetherAvg.toFixed(2));
    $(".usdAvg").text("$" + usdAvg.toFixed(2));
    $(".spread").text("$" + spread.toFixed(2));
    $(".spreadpercent").text((spread*100/usdAvg).toFixed(2) + "%");
    $(".date").text(timeStamp + ".");
    ticks += 1;
    if (!timeSeries) { return; }
    timeSeries.addRow(row);
    if (timeSeries.getNumberOfRows() > 60) {
      timeSeries.removeRow(0);
    }
    drawChart();
  }).fail(function(data) {
    console.log("Error", data);
  });
  $('.spinner').addClass('hidden');
}

function initChart() {
  timeSeries = new google.visualization.DataTable();
  timeSeries.addColumn("string", "Time");
  for(i in ALL) {
    nameToIndex[ALL[i]] = parseInt(i) + 1;
    timeSeries.addColumn("number", ALL[i]);
  }
  timeSeries.addColumn("number", "Tether Average");
  timeSeries.addColumn("number", "USD Average");
  chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  update();
  setInterval(update, 30*1000);
}

function drawChart() {
  var options = {
    colors: ['red', 'red', 'red', 'red', 'green', 'green', 'darkred', 'darkgreen'],
    curveType: 'function',
    legend: { position: 'bottom' },
    series: {
      6: { lineWidth: 2 },
      7: { lineWidth: 2 }
    }
  };
  chart.draw(timeSeries, options);
}
