// 下图 右一

// Plot constants
const MARGIN = {LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 30};
const WIDTH = 0;//500 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 0;//500 - MARGIN.TOP - MARGIN.BOTTOM;
const OUTERRADIUS = Math.min(WIDTH, HEIGHT, 500) / 2;
const INNERRADIUS = OUTERRADIUS * 0.1;

let svg,
  g,
  colorScale,
  distScale,
  radialScale,
  title,
  yearText,
  line,
  barWrapper,
  pathWrapper;

//let currYear = 1901;
let currYear = 2013;

// Domain data
const domLow = -1.5, //-15, low end of data
  domHigh = 1.25, //30, high end of data
  axisTicks = [0, 150, 300]; //[-20,-10,0,10,20,30];  [-2,-1,0,1,2,3];  [-1.5,-0.5,0.5,1.5];

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
      "translate(" + WIDTH / 2 + "," + (HEIGHT / 2 + 20) + ")"
    );

  //Base the color scale on average temperature extremes
  colorScale = d3
    .scaleLinear()
    .domain([domLow, (domLow + domHigh) / 2, domHigh])
    .range(["#1788de", "#ffff8c", "#CE241C"]);

  //Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
  distScale = d3
    .scaleLinear()
    .range([INNERRADIUS, OUTERRADIUS])
    .domain([domLow, domHigh]);

  radialScale = d3
    .scaleLinear()
    .range([0, Math.PI * 2])
    .domain([1, 12]); // for 12 months

  // Title
  //Append title to the top
  title = g
    .append("g")
    .attr("class", "title")
    .append("text")
    .attr("dy", HEIGHT / 2)
    .attr("text-anchor", "middle")
    .text("World Temperature Anomaly");

  // Add axes
  //Wrapper for the bars and to position it downward
  barWrapper = svg
    .append("g")
    .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")");

  pathWrapper = barWrapper.append("g").attr("id", "pathWrapper");

  //Draw gridlines below the bars
  const axes = barWrapper
    .selectAll(".gridCircles")
    .data(axisTicks)
    .enter()
    .append("g");
  //Draw the circles
  axes
    .append("circle")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.2)
    .attr("class", "axisCircles")
    .attr("r", function (d) {
      return distScale(d);
    });
  //Draw the axis labels
  axes
    .append("text")
    .attr("class", "axisText")
    .attr("y", function (d) {
      return distScale(d) - 8;
    })
    .attr("dy", "0.3em")
    .text(function (d) {
      return d + "°C";
    });

  //Add January for reference
  barWrapper
    .append("text")
    .attr("class", "january")
    .attr("x", 7)
    .attr("y", -OUTERRADIUS)
    .attr("dy", "0.9em")
    .text("January");
  //Add a line to split the year
  barWrapper
    .append("line")
    .attr("class", "yearLine")
    .attr("stroke", "black")
    .attr("opacity", 0.5)
    .attr("x1", 0)
    .attr("y1", -INNERRADIUS * 1.8) //.65
    .attr("x2", 0)
    .attr("y2", -OUTERRADIUS * 1.1);

  //Add year in center
  yearText = barWrapper
    .append("text")
    .attr("class", "yearText")
    .attr("text-anchor", "middle")
    .attr("y", 8);

  // 极坐标
  // 相关示例 https://sg-info.cn/article/show/200
  line = d3
    .lineRadial() // 径向线生成器
    .angle(function (d) {  //角度
      return radialScale(d.Month);
    })
    .radius(function (d) { //半径
      return distScale(d.Anomaly);
    });
}

function updateChart(data, nextYear) {
  const trans = d3.transition().duration(400).ease(d3.easeCubicIn);

  if (nextYear < currYear) {
    const paths = document.getElementById("pathWrapper").children;
    const removeRange = paths.length - (currYear - nextYear);
    const removeElems = [];
    for (let i = removeRange; i < paths.length; i++) {
      removeElems.push(paths[i]);
    }
    removeElems.forEach((elem) => elem.parentNode.removeChild(elem));
  } else if (nextYear > currYear) {
    for (let year = currYear; year < nextYear; year++) {
      const yearData = data.get(String(year)); // key 年份
      //Create path using line function
      // 此处可以查看数据结构
      // console.log(data);  

      const path = pathWrapper
            .append("path")
            .attr("class", "line")
            .attr("stroke-width", 5)
            .attr("fill", "none")
            .attr("d", line(yearData))
            .attr("x", -0.75)
            .style("stroke", colorScale(yearData[0].Anomaly));

      const totalLength = path.node().getTotalLength();//全长

      if ((nextYear-currYear) == 1) {
        // 相关说明 https://sg-info.cn/article/show/199
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength) // 虚线
          .attr("stroke-dashoffset", totalLength)
          .transition(trans)
          .attr("stroke-dashoffset", 0);
      }
    }
  }
  yearText.text(nextYear);
  currYear = nextYear; //迭代 下一年
}

export {initChart, updateChart};
