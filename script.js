var usdValue=0;
var BTCRate=1;
var JPYRate=0;
var EURRate=0;
var USDRate=0;
var KRWRate=0;
var CNYRate=0;
var GBPRate=0;

var currencyNumArr=["BTC","USD","EUR","GBP","JPY","KRW","CNY"];
var currencyRateArray=new Array(7);
currencyRateArray[0] = BTCRate;
var selectedCurrencyNum=0;
var selectedCurrencyName='BTC';

if(localStorage.getItem("selectedCurrencyNum")){
  selectedCurrencyNum=localStorage.getItem("selectedCurrencyNum");
}else{
  localStorage.setItem("selectedCurrencyNum",0);
}

var selectCurrencyTag='<div style="margin-top: 10px"><div style="margin-left: 20px; float:left">'+
'<label style="margin-right: 10px">Your Currency: </label>'+
'<select id="selectCurrency">'+
'<option value="0">BTC</option>'+
'<option value="1">USD</option>'+
'<option value="2">EUR</option>'+
'<option value="3">GBP</option>'+
'<option value="4">JPY</option>'+
'<option value="5">KRW</option>'+
'<option value="6">CNY</option>'+
'</select></div><div style="float:left; margin-left: 20px"><span id="currentConversionRate">BTC</span></div></div>';

function getSomeRate(){
  $.getJSON("https://api.coindesk.com/v1/bpi/currentprice.json" , function(data) {
    EURRate =data.bpi.EUR.rate_float;
    GBPRate =data.bpi.GBP.rate_float;
    USDRate =data.bpi.USD.rate_float;

	currencyRateArray[1] = USDRate;
	currencyRateArray[2] = EURRate;
	currencyRateArray[3] = GBPRate;
  });
  $.getJSON("https://api.coindesk.com/v1/bpi/currentprice/KRW.json" , function(data) {
    KRWRate =data.bpi.KRW.rate_float;
    currencyRateArray[5] = KRWRate;
  });
  $.getJSON("https://api.coindesk.com/v1/bpi/currentprice/CNY.json" , function(data) {
    CNYRate =data.bpi.CNY.rate_float;
    currencyRateArray[6] = CNYRate;
  });
  $.getJSON("https://api.coindesk.com/v1/bpi/currentprice/JPY.json" , function(data) {
    JPYRate =data.bpi.JPY.rate_float;
    currencyRateArray[4] = JPYRate;
    
    setTimeout(addCurrencySelect,1000);
    setTimeout(updateTables,2000);
    
  });
}


function getCurrentRate(){
  var d= new Date().getTime();
  $.getJSON("https://bittrex.com/api/v2.0/pub/Markets/GetMarketSummaries?_="+d , function(data) {
    var r = data.result;
    r.forEach(function (val) {
      if(val.Market.BaseCurrency === "BTC" || val.Market.BaseCurrency === "BITCNY"){
        rateObjArr[val.Market.MarketCurrency]={
          "MarketName":val.Market.MarketName,
          "MarketCurrency":val.Market.MarketCurrency,
          "LastRate":val.Summary.Last
        }
      }
    });
  });
}


function updateTables() {
	updateBalanceTable();
	updateResultsTable();
}

function updateBalanceTable() {

	if ($($(".dataGrid2")[0]).find("th").length < 7)
		addNewColumnToBalanceTable();

	$($(".dataGrid2")[0]).find("th").last().text(selectedCurrencyName);

	$($(".dataGrid2")[0]).find("tr").each(function(idx){

	var valueInBTC = $(this).find("td").last().prev().text();
	if (valueInBTC.indexOf('USD') > - 1 || valueInBTC.indexOf('Show') > - 1)
		return;
	valueInBTC = valueInBTC.substr(0, valueInBTC.indexOf(' '));
	var convertedValue = valueInBTC;
	if (selectedCurrencyNum > 0)
		convertedValue = (valueInBTC * currencyRateArray[selectedCurrencyNum]).toFixed(2);
	if (valueInBTC != '')
		$(this).find("td").last().text(convertedValue + ' ' + selectedCurrencyName)
  });
}

function updateResultsTable() {

	if ($("#found_results").find('th').length < 7)
		addNewColumnToResultsTable();

	$("#found_results").find('th').last().text(selectedCurrencyName);
	var ismBTC = $("#found_results").find('th').last().prev().prev().prev().text() === 'mBTC';
	var total = parseFloat("0.0");
	
	$("#found_results").find('tr').each(function(idx) {
		var btcValue = parseFloat($(this).find("td").last().prev().prev().prev().text());
		if (!Number.isNaN(btcValue)) {
			if (ismBTC)
				btcValue = btcValue / 1000;
			var convertedValue = btcValue;
			
			if (selectedCurrencyNum > 0)
			{
				convertedValue = (btcValue * currencyRateArray[selectedCurrencyNum]).toFixed(2);
				total = total + (btcValue * currencyRateArray[selectedCurrencyNum]);
				
			}
			else {
				
				total = total + btcValue;
			}
			if (btcValue != '')
				$(this).find("td").last().text(convertedValue + ' ' + selectedCurrencyName);
		}
	});
	if (selectedCurrencyNum > 0)
		total = total.toFixed(2);

	$("#found_results").find('tr').last().find('td').last().text(total + ' ' + selectedCurrencyName);
}

function addNewColumnToBalanceTable() {
	$($(".dataGrid2")[0]).find("th").last().after('<th align="right">' + selectedCurrencyName + '</th>');

	$($(".dataGrid2")[0]).find("tr").each(function(idx){

	var valueInBTC = $(this).find("td").last().text();
	valueInBTC = valueInBTC.substr(0, valueInBTC.indexOf(' '));
	if (valueInBTC != '')
		$(this).find("td").last().after('<td valign="top" align="right" style="font-size: .9em; vertical-align: middle;"></td>');
  });
}

function addNewColumnToResultsTable() {
	$("#found_results").find('th').last().after('<th align="right">' + selectedCurrencyName + '</th>');

	$("#found_results").find('tr').each(function(idx){
		var valueInMBTC = $(this).find("td").last().prev().prev().text();
		if (valueInMBTC != '')
			$(this).find("td").last().after('<td align="right" style="font-size: .8em;">' + selectedCurrencyName + '</td>');
	});

	$("#found_results").find('tr').last().after('<tr class="ssrow"><td width="18"></td><td></td><td></td><td></td><td></td><td></td><td>TOTAL</td><td align="right" style="font-size: .8em;">' + selectedCurrencyName + '</td></tr>');

}

function addCurrencySelect() {
	$("table").first().before(selectCurrencyTag);

	$("#selectCurrency").val(selectedCurrencyNum);
	selectedCurrencyName = $("#selectCurrency").find(":selected").text();
	$("#currentConversionRate").text('Current conversion rate: 1 BTC = ' + currencyRateArray[selectedCurrencyNum] + ' ' + selectedCurrencyName + ' (Source: coindesk.com)');

  	$("#selectCurrency").change(function(){
	    selectedCurrencyNum = $(this).find(":selected").val();
		selectedCurrencyName = $(this).find(":selected").text();
		$("#currentConversionRate").text('Current conversion rate: 1 BTC = ' + currencyRateArray[selectedCurrencyNum] + ' ' + selectedCurrencyName + ' (Source: coindesk.com)');
	    localStorage.setItem("selectedCurrencyNum",selectedCurrencyNum);

	    updateTables();
	});
}

$(function(){
	getSomeRate();
});