var TETHERED = [ "BitFinex", "Poloniex", "Hitbtc", "Bittrex" ];
var USD = [ "Bitstamp", "Kraken", "GDAX" ];
var ALL = TETHERED.concat(USD);
// Ignore USD exchanges outside US
var IGNORED = [ "cex.io", "Exmo", "Livecoin", "WEX.nz" ]
// has usdt/usd pairs: exmo, kraken

var timeSeries;
var chart;
var ticks = 1;
var nameToIndex = {};

var row = [];
var tetherPrices = [];
var tetherVolumes = [];
var usdPrices = [];
var usdVolumes = [];

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
  timeStamp = new Date().toLocaleString();
  $(".date").text(timeStamp + ".");
  row = Array(ALL.length + 2).fill(0);
  row.unshift(timeStamp);
  tetherPrices = [];
  tetherVolumes = [];
  usdPrices = [];
  usdVolumes = [];

  $.ajax({
    url: "https://api.cryptonator.com/api/full/btc-usd"
  }).success(function(data) {
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
          usdPrices.push(price);
          usdVolumes.push(market["volume"]);
          row[nameToIndex[name]] = price;
          break;
        default:
          console.log("Ignoring", market)
          continue;
      }
      $(".price ." + market["market"]).text("$" + price.toFixed(2));
      $(".volume ." + market["market"]).text(volume.toFixed(0));
    }
    ticks += 1;
  }).fail(function(data) {
    console.log("Error", data);
    $('.spinner').addClass('hidden');
  }).always(function(data) {
    updateGdax();
  });
}

function updateGdax() {
  $.ajax({
    url: "https://api.gdax.com/products/BTC-USD/ticker"
  }).success(function(data) {
    price = parseFloat(data["price"]);
    volume = parseInt(data["volume"]);
    usdPrices.push(price);
    usdVolumes.push(volume);
    row[nameToIndex["GDAX"]] = price;
    $(".price .GDAX").text("$" + price.toFixed(2));
    $(".volume .GDAX").text(volume.toFixed(0));
  }).fail(function(data) {
    console.log("Error", data);
  }).always(function(data) {
    computeAvg();
  });
 }

function computeAvg() {
  tetherAvg = weightedAvg(tetherPrices, tetherVolumes);
  usdAvg = weightedAvg(usdPrices, usdVolumes);
  row[1] = tetherAvg;
  row[2] = usdAvg;
  spread = tetherAvg - usdAvg;
  $(".tetherAvg").text("$" + tetherAvg.toFixed(2));
  $(".usdAvg").text("$" + usdAvg.toFixed(2));
  $(".spread").text("$" + spread.toFixed(2));
  $(".spreadpercent").text((spread*100/usdAvg).toFixed(2) + "%");
  $('.spinner').addClass('hidden');

  if (!timeSeries) { return; }
  timeSeries.addRow(row);
  if (timeSeries.getNumberOfRows() > 60) {
    timeSeries.removeRow(0);
  }
  drawChart();
}

function initChart() {
  timeSeries = new google.visualization.DataTable();
  timeSeries.addColumn("string", "Time");
  timeSeries.addColumn("number", "Tether Avg");
  timeSeries.addColumn("number", "USD Avg");
  for(i in ALL) {
    nameToIndex[ALL[i]] = parseInt(i) + 3;
    timeSeries.addColumn("number", ALL[i]);
  }
  chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  update();
  setInterval(update, 30*1000);
}

function drawChart() {
  var options = {
    colors: ['red', 'green', 'darkred', 'darkred', 'darkred', 'darkred', 'darkgreen', 'darkgreen', 'darkgreen'],
    curveType: 'function',
    legend: { position: 'bottom' },
    series: {
      0: { lineWidth: 3, lineDashStyle: [4, 1] },
      1: { lineWidth: 3, lineDashStyle: [4, 1] }
    },
    legendTextStyle: { fontSize: 12 },
  };
  chart.draw(timeSeries, options);
}
