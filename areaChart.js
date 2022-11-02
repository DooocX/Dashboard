// 下图 中间

// Plot constants
const MARGIN = {LEFT: 10, RIGHT: 60, TOP: 20, BOTTOM: 100};
const WIDTH = 550 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 350 - MARGIN.TOP - MARGIN.BOTTOM;

let svg,
  g,
  xLabel,
  yLabel,
  x,
  y,
  xAxisGroup,
  yAxisGroup,
  timeParser,
  dateRange,
  gradient;

function initChart(canvasElement) {
  // Visualization canvas
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM );

  //下图中间那张表格
  g = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.LEFT + 50}, ${MARGIN.TOP})`);
  g.append("path").attr("class", "plot");

  // Labels
  xLabel = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2 )
    .attr("y", HEIGHT + 50)
    .attr("font-size", "20px") // 字体大小
    .attr("text-anchor", "middle"); // 相关说明https://sg-info.cn/article/show/121

  yLabel = g
    .append("text")
    .attr("class", "y-label")
    .attr("x", -HEIGHT / 2)
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle") //中间对齐
    .attr("transform", "rotate(-90)") // 旋转
    .text("Temperature (K)"); //文字内容

  // Scales
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
  timeParser = d3.timeParse("%b");
  dateRange = monthNames.map((month) => timeParser(month));

  x = d3.scaleTime().range([0, WIDTH]); //时间比例尺
  y = d3.scaleLinear().range([HEIGHT, 0]);
  x.domain(d3.extent(dateRange)); // 值域范围 extent返回数组最小值和最大值 [min, max]
  //y.domain([-30, 35]);
  y.domain([0, 300]);

  gradient = g
    .append("linearGradient")
    .attr("id", "temperature-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    //.attr("y1", y(-30))
    .attr("y1", y(0))
    .attr("x2", 0)
    //.attr("y2", y(35));
    .attr("y2", y(300));

  gradient
    .selectAll("stop")
    .data([
      {offset: "0%", color: "#5f9879"},
      {offset: "11.7%", color: "#96b971"},
      {offset: "25%", color: "#fdfd72"},
      {offset: "38.3%", color: "#ECEB73"},
      {offset: "75%", color: "#D75454"},
      {offset: "100%", color: "#B53838"},
      //{offset: "0%", color: "#1788de"},
      //{offset: "50%", color: "#3C81B7"},
      //{offset: "70%", color: "#CE241C"},
    ])
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  // Axes initialization
  xAxisGroup = g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${HEIGHT})`);

  yAxisGroup = g.append("g").attr("class", "y axis");

  // Add x axis
  const xAxisCall = d3
    .axisBottom(x) //刻度朝下
    .ticks(d3.timeMonth, 1) //刻度
    .tickFormat(d3.timeFormat("%b")); // 相关说明 https://sg-info.cn/kanli/show/201
  xAxisGroup.call(xAxisCall);
}

function updateChart(data, cur_specy) {
  const trans = d3.transition().duration(400);

  xLabel.text(`${data[0].Country}, ${data[0].Year}`);
  // Add domains
  //y.domain([d3.min(data, (d) => Number(d.Temperature)) < 0 ? -30 : 0, 35]);
  y.domain([0,cur_specy=="PM2.5"? 300:(cur_specy=="PM10"? 150:(cur_specy=="SO2" ? 150: (cur_specy=="NO2" ? 200:(cur_specy=="CO"?10:(cur_specy=="O3"? 160:0)))))]);

  // Line and area generator
  let curve = d3.curveMonotoneX;
  const line = d3
    .line()
    .curve(curve)
    .x((d) => x(timeParser(d.Statistics.slice(0, 3))))
    .y((d) => y(d.Temperature));

  const area = d3
    .area()
    .curve(curve)
    .x((d) => x(timeParser(d.Statistics.slice(0, 3)))) //x
    .y0(y(0)) //下边
    .y1((d) => y(cur_specy=="PM2.5"? d.Temperature:(cur_specy=="PM10"? d.PM10:(cur_specy=="SO2" ? d.SO2: (cur_specy=="NO2" ? d.NO2:(cur_specy=="CO"?d.CO:(cur_specy=="O3"? d.O3:0))))))); //上边

  // Add y axis
  const yAxisCall = d3.axisLeft(y);
  yAxisGroup
  .call(yAxisCall);

  gradient
  .attr("y1", y(0))
  .attr("y2", y(cur_specy=="PM2.5"? 300:(cur_specy=="PM10"? 150:(cur_specy=="SO2" ? 150: (cur_specy=="NO2" ? 200:(cur_specy=="CO"?10:(cur_specy=="O3"? 160:0)))))));

  const linePath = g.selectAll("path.plot").datum(data);

  linePath.exit().remove();

  // Add line and area
  linePath
    .merge(linePath)  //merge  相关说明 https://sg-info.cn/article/show/173
    .transition(trans)
    .attr("fill", "none")
    .attr("stroke", "#8d99ae")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round") // 折线的拐角 round 代表圆角
    .attr("stroke-linecap", "round") // lineCap lineCap属性设置或返回线条末端线帽的样式
    .attr("d", line);

  const areaPath = g.selectAll("path.plot").datum(data);  //datum data 相关说明 https://sg-info.cn/article/show/187

  areaPath.exit().remove();

  areaPath
    .merge(areaPath)
    .transition(trans)
    .attr("fill", "url(#temperature-gradient)")  // fill url 相关示例 https://sg-info.cn/article/show/149
    .attr("opacity", 0.8)
    .attr("d", area);
}

export {initChart, updateChart};
