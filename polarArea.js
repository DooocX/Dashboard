// 下图 左一

// Plot constants
const MARGIN = {LEFT: 10, RIGHT: 10, TOP: 10, BOTTOM: 10};
const WIDTH = 400 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;
const INNERRADIUS = 60;
const OUTERRADIUS = Math.min(WIDTH, HEIGHT) / 2;

let svg,
  g,
  x,
  y,
  colorScale,
  xAxisGroup,
  yAxisGroup,
  title,
  subtitle,
  tooltip,
  tipMonth,
  hovMonth,
  tipData;
let hovered = false;
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function initChart(canvasElement) {
  // Visualization canvas
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

  g = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + WIDTH / 2 + "," + (HEIGHT / 2 +20) + ")"
    );

  // Scales
  x = d3
    .scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(monthNames);
  y = d3.scaleLinear().range([INNERRADIUS, OUTERRADIUS]).domain([0, 150]);

  // Color scaleBand
  colorScale = d3
    .scaleSqrt()
    //.domain([-30, 0, 35])
    .domain([ 0, 300])
    .range(["#1788de",  "#CE241C"]);

  // Axes initialization
  // Y axis
  yAxisGroup = g.append("g").attr("class", "y axis");

  const yTicks = yAxisGroup.selectAll("g").data(y.ticks(6)).enter().append("g");

  yTicks
    .append("circle")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.2)
    .attr("r", y);
/*
  yTicks
    .append("text")
    .attr("y", function (d) {
      return -y(d + 3);
    })
    .attr("dy", "0.35em")
    .text(function (d) {
      return d + "μg/m³";
    });
*/
  yAxisGroup
    .append("circle")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.2)
    .attr("r", function () {
      return y(y.domain()[0]);
    });

  // X axis
  xAxisGroup = g.append("g").attr("class", "x axis");

  let xTicks = xAxisGroup
    .selectAll("g")
    .data(monthNames)
    .enter()
    .append("g")
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return (
        "rotate(" +
        ((x(d) * 180) / Math.PI - 75) +
        ")translate(" +
        INNERRADIUS +
        ",0)"
      );
    });

  xTicks.append("line").attr("x2", -5).attr("stroke", "#000");

  xTicks
    .append("text")
    .attr("transform", function (d) {
      var angle = x(d);
      return angle < Math.PI / 2 || angle > (Math.PI * 3) / 2
        ? "rotate(90)translate(0,22)"
        : "rotate(-90)translate(0, -15)";
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("opacity", 0.6);

  title = g
    .append("g")
    .attr("class", "title")
    .append("text")
    .attr("dy", "0.2em")
    .attr("text-anchor", "middle");

  subtitle = g
    .append("text")
    .attr("dy", "1.3em")
    .attr("text-anchor", "middle")
    .attr("opacity", 0.6);

  // Tooltip placeholder
  tooltip = d3.select(".tooltip");
}

function updateChart(data,cur_specy) {
  const trans = d3.transition().duration(400);

  title.text(data[0].Country);

  subtitle.text(data[0].Year);

  const bars = g.selectAll("path").data(data);

  
  y = d3.scaleLinear().range([INNERRADIUS, OUTERRADIUS]).domain([0, cur_specy=="PM2.5"? 150:(cur_specy=="PM10"? 150:(cur_specy=="SO2" ? 150: (cur_specy=="NO2" ? 90:(cur_specy=="CO"? 4:(cur_specy=="O3"? 160:0)))))]);

  bars.exit().remove();

  // Add bars
  // Join
  bars
    .enter()
    .append("path")
    .lower()
    .merge(bars)
    .attr("class", "Bar")
    .on("pointermove", function (event, d) {
      hovered = true;
      tipMonth = d.Statistics.slice(0, 3);
      hovMonth = monthNames.findIndex((month) => month == tipMonth);
      tipData =
        hovMonth != -1 ? data[hovMonth] : {Statistics: "", PM2: ""};
      tooltip.html(tipData.Statistics + "<br/>" + (cur_specy=="PM2.5"? d.PM2:(cur_specy=="PM10"? d.PM10:(cur_specy=="SO2" ? d.SO2: (cur_specy=="NO2" ? d.NO2:(cur_specy=="CO"?d.CO:(cur_specy=="O3"? d.O3:0)))))) + "μg/m³");
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(100)
        .style("opacity", 0.9)
        .style("font-size", "10px");
      d3.selectAll(".Bar").transition().duration(50).style("opacity", 0.5);
      d3.select(this)
        .transition()
        .duration(50)
        .style("opacity", 1)
        .style("stroke", "black");
    })
    .on("pointerleave", function (event) {
      hovered = false;
      d3.selectAll(".Bar").transition().duration(50).style("opacity", 1);
      d3.select(this).transition().duration(50).style("stroke", "none");
      // Tooltip
      tooltip.transition().duration(100).style("opacity", 0);
    })
    .transition(trans)
    .attr("fill", (d) => colorScale(d.PM2))
    .attr("opacity", 1)
    .attr(
      "d",
      d3
        .arc() // imagine your doing a part of a donut plot
        .innerRadius(INNERRADIUS)   //内径
        .outerRadius(function (d) { //外径
          return y(cur_specy=="PM2.5"? d.PM2:(cur_specy=="PM10"? d.PM10:(cur_specy=="SO2" ? d.SO2: (cur_specy=="NO2" ? d.NO2:(cur_specy=="CO"?d.CO:(cur_specy=="O3"? d.O3:0))))));
        })
        .startAngle(function (d) { //起始角度
          return x(d.Statistics.slice(0, 3));
        })
        .endAngle(function (d) { //结束角度
          return x(d.Statistics.slice(0, 3)) + x.bandwidth();
        })
        .padAngle(0.08)  // 弧的间距 可以设成0 则无间距 相关说明 https://www.cnblogs.com/wuhuaguo/p/10058483.html   https://blog.csdn.net/keanu1978/article/details/79173571
        .padRadius(INNERRADIUS)
    );
  // Update tooltip data
  if (hovered) {
    hovMonth = monthNames.findIndex((month) => month == tipMonth);
    tipData =
      hovMonth != -1 ? data[hovMonth] : {Statistics: "", PM2: ""};
    tooltip.html(tipData.Statistics + "<br/>" + (cur_specy=="PM2.5"? d.PM2:(cur_specy=="PM10"? d.PM10:(cur_specy=="SO2" ? d.SO2: (cur_specy=="NO2" ? d.NO2:(cur_specy=="CO"?d.CO:(cur_specy=="O3"? d.O3:0)))))) + "μg/m³");
  }
}

export {initChart, updateChart};
