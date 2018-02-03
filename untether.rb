require 'uri'
require 'net/http'
require 'rubygems'
require 'json'

class Untether
  Sites = {
    "GDAX" => "https://api.gdax.com/products/BTC-USD/ticker",
    "Bitfinex" => "https://api.bitfinex.com/v1/pubticker/btcusd"
  }

  def initialize
    @prices = {}
    load()
  end
  
  def load
    sites.each do |site, uri|
    url = URI(uri)
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    request = Net::HTTP::Get.new(url)
    response = http.request(request)
    json = JSON.parse(response.read_body)
    case site
    when "Bitfinex"
      price = json["last_price"]
    when "GDAX"
      price = json["price"]
    end
    @prices[site] = price.to_f
  end

  #puts "Delta $%.2f" % delta
  def delta
    @prices['Bitfinex'] - @prices['GDAX']
  end

  def deltap
    gdax = @prices['GDAX']
    delta / gdax
  end
end
