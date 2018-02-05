var TETHERED = [ "BitFinex", "Poloniex", "Hitbtc", "Bittrex", "C-Cex" ]
var USD = [ "Bitstamp", "Kraken" ]
// Ignore USD exchanges outside US
var IGNORED = [ "cex.io", "Exmo", "Livecoin", "WEX.nz" ]
// has usdt/usd pairs: exmo, kraken

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
    for(m in data["ticker"]["markets"]) {
      market = data["ticker"]["markets"][m];
      name = market["market"];
      price = parseInt(market["price"]);
      switch(marketType(name)) {
        case "TETHER":
          tetherPrices.push(price)
          tetherVolumes.push(market["volume"])
          break;
        case "USD":
          usdPrices.push(price)
          usdVolumes.push(market["volume"])
          break;
        default:
          console.log("Ignoring", market)
          continue;
      }
      $("." + market["market"]).text("$" + price.toFixed(2));
    }
    tetherAvg = weightedAvg(tetherPrices, tetherVolumes);
    usdAvg = weightedAvg(usdPrices, usdVolumes);
    spread = tetherAvg - usdAvg;
    $(".tetherAvg").text("$" + tetherAvg.toFixed(2));
    $(".usdAvg").text("$" + usdAvg.toFixed(2));
    $(".spread").text("$" + spread.toFixed(2));
    $(".spreadpercent").text((spread*100/usdAvg).toFixed(2) + "%");
    $(".date").text(new Date().toLocaleString());
  }).fail(function(data) {
    console.log("Error", data);
  });
  $('.spinner').addClass('hidden');
}

$( document ).ready(function() {
    update();
    setInterval(update, 60*1000);
});
