import * as areaChart from "./areaChart.js";
import * as polarArea from "./polarArea.js";
import * as choroplethMap from "./choroplethMap.js";
import * as anomalyRadial from "./anomalyRadial.js";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let cur_specy = "PM2.5";
const firstYear = 2013;
const lastYear = 2016;
let country = "110000";
let year = firstYear;
let month = 0;

const species = ["PM2.5","PM10","SO2","NO2","CO","O3"];

// Init slider variables
const slider = document.getElementById("yearSlider");
slider.min = 2013;
slider.max = 2016;

// Init charts
areaChart.initChart("#areaChart");
polarArea.initChart("#polarArea");
anomalyRadial.initChart("#anomalyRadial");
choroplethMap.initChart("#choroplethMap");

// Datasets to load

  const dataPromises = [
    //d3.csv("data/temp-1901-2020-all.csv"),
    //d3.csv("data/PM-1901-2020-all.csv"),
    d3.csv("data/PM1.csv"),
    d3.csv("data/HadCRUT4.csv"),
    //d3.json("data/world.geo.json"),
    d3.json("data/china.geo.json"),//数据改用"data/china.geo.json"中国省份地图数据
    //d3.json("data/china.json"),
    d3.csv("data/species.csv"),
  ];
  
// Load datasets and start visualization
Promise.all(dataPromises).then(function (data) {
  const topoData = data[2];


  // Group data per country and per year
  const tempData = d3.group(
    data[0],
    (d) => d.Year,
    (d) => d.code
  );
  const anomalyData = d3.group(
    data[1],
    (d) => d.Year
  );

  function updateCharts() {
    const yearData = tempData.get(String(year));
    const countryData = yearData.get(country);
    polarArea.updateChart(countryData);
    areaChart.updateChart(countryData);
    anomalyRadial.updateChart(anomalyData, year);
    choroplethMap.updateChart(topoData, yearData, month, cur_specy);
  }
  updateCharts();

  let interval = d3.interval(() => {
    //year = year < lastYear ? year + 1 : firstYear;
    //月份和年份更迭
    if(++month>11)
    {
      month=0;
      year++;
    }
    if(year>lastYear)year=firstYear;
    slider.value = year;
    
    
    updateCharts();
  }, 400);

  // UI
  // Slider
  let moving = true;
  slider.addEventListener("input", (event) => {
    if (moving) {
      interval.stop();
    }
    year = +slider.value;
    updateCharts();
  });
  slider.addEventListener("pointerup", (event) => {
    if (moving) {
      interval = d3.interval(() => {
        if(++month>11)
        {
          month=0;
          year++;
        }
    if(year>lastYear)year=firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
    }
  });
  // Play/pause button
  // document.getElementById('month-list').addEventListener();
  const playButton = d3.select("#play-button");
  playButton.on("click", function () {
    const button = d3.select(this);//.attr("transform", "translate(0,200)");
    if (button.text() == "暂停") {
      moving = false;
      interval.stop();
      button.text("播放");
    } else {
      moving = true;
      interval = d3.interval(() => {
        //year = year < lastYear ? year + 1 : firstYear;
        if(++month>11)
        {
          month=0;
          year++;
        }
    if(year>lastYear)year=firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
      button.text("暂停");
    }
  });
  // Add month names to months drop down menu
  monthNames.forEach((month, i) => {
    document.getElementById(
      "month-list"
    ).innerHTML += `<li><a class="dropdown-item" value=${i}>${month}</a></li>`;
  });
  // Change months according to month menu
  document.querySelectorAll("#month-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      month = event.target.getAttribute("value");
      updateCharts();
    })
  );

  // Add years to years drop down menu
  for (let year of tempData.keys()) {
    document.getElementById(
      "year-list"
    ).innerHTML += `<li><a class="dropdown-item">${year}</a></li>`;
  }
  // Change year according to year menu
  document.querySelectorAll("#year-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      year = +event.target.innerHTML;
      slider.value = year;
      updateCharts();
    })
  );

  // Add countries to countries drop down menu
  for (let [iso, isoData] of tempData.get(String(firstYear))) {
    const countryName = isoData[0].Country;
    document.getElementById(
      "country-list"
    ).innerHTML += `<li><a class="dropdown-item" value=${iso}>${countryName}</a></li>`;
  }
  // Change country according to country menu
  document.querySelectorAll("#country-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      country = event.target.getAttribute("value");
      updateCharts();
    })
  );

let i=0;
 // 点击事件
 for (let iso of species) {
  document.getElementById(
    "species-list"
  ).innerHTML += `<li><a class="dropdown-item" value= ${species[i]}>${species[i++]}</a></li>`;
}
document.querySelectorAll("#species-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      cur_specy = event.target.getAttribute("value");
      
      updateCharts();
    })
  );

});
