//上图 地图

// Plot constants
const WIDTH = 1400;
const HEIGHT = 800;

let svg, g, path, projection, colorScale, speciestitle, title, tooltip, tipCountry, tipData;
let hovered = false;
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

function initChart(canvasElement,cur_specy) {
  // Visualization canvas
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  g = svg.append("g");

  // Labels
  title = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT - 100)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

    speciestitle = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT - 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

  // Map and projection
  path = d3.geoPath();
  projection = d3
    .geoEqualEarth()
    //更改世界地图的旋转角度、放大倍数以及中心位置，讲中国放在中间，且大小合适
    .scale(900)
    .rotate([-90, 0]) 
    .center([20, 32]) 
    .translate([WIDTH / 2, HEIGHT / 2]);

  // scale
  // domain 定义域
  // range 值域
  // scaleLinear 可以理解为y=kx
  // 中间有0 可以理解为是一个分段函数
  // [-30, 0] y=k1x
  // [0, 35]  y=k2x
  colorScale = d3
    .scaleLinear()
    .domain([ 0,35,75,115,250, 300])
    .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);


    const w = 110,
    h = 300;
    const y = d3.scaleLinear().domain([0, 300]).range([h, 0]);
    
    
    // append rect
    // 注意此处fill 是上边准备的渐变色
    g.append("rect")
      .attr("width", w - 100)
      .attr("height", h)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,200)");
  
    // 此处是一个 axis
    // axisRight表示 刻度朝右
    // tickFormat是刻度上的文字
    var yAxis = d3.axisRight(y).tickFormat((d) => d + "μg/m³");
  
    // 此处append g
    // 相当于 班级管理 分成一个个group
    g.append("g")
      .attr("class", "y axis") // class 类名
      .attr("transform", "translate(10,200)") // 平移
      .call(yAxis); // call yAxis 这是固定写法
  
  // Legend
  // 此处为了生成图例，准备渐变色(linearGradient)
  // 相关示例 https://sg-info.cn/article/show/149
  const legend = g
    .append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  // stop可以理解为分段函数的间断点
  
    legend
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#B53838")
    .attr("stop-opacity", 1);

    legend
    .append("stop")
    .attr("offset", "16.7%")
    .attr("stop-color", "#D75454")
    .attr("stop-opacity", 1);

 
    legend
    .append("stop")
    .attr("offset", "61.7%")
    .attr("stop-color", "#ECEB73")
    .attr("stop-opacity", 1);

    legend
    .append("stop")
    .attr("offset", "75%")
    .attr("stop-color", "#FDFD72")
    .attr("stop-opacity", 1);

 
 
    legend
    .append("stop")
    .attr("offset", "88.3%")
    .attr("stop-color", "#96B971")
    .attr("stop-opacity", 1);

 
  legend
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#5F9879")
    .attr("stop-opacity", 1);

  
}

function updateChart(topo, data, month, cur_specy) {
  //这是一个动画 或者 渐变过程
  const trans = d3.transition().duration(100); // duration 表示这个过程要经历多久
 
  const currentYear = data.values().next().value[0].Year; // 此处是获取下一年
  title.text(`${monthNames[month]}, ${currentYear}`);
  speciestitle.text(`${cur_specy}`);

  // 又一个scaleLinear
  // 注意此处range([h, 0])
  // 可以理解为 y = h - kx
  // 如果为range([0, h])
  // 则 y = kx
  
  // Tooltip placeholder
  tooltip = d3.select(".tooltip");
  
  // Draw map
  // Join
  const choroMap = g.selectAll("path").data(topo.features);

  // Exit
  choroMap.exit().remove();

  // Update
  choroMap
    .enter()  // 相关说明 https://sg-info.cn/article/show/21
    .append("path")
    .merge(choroMap)
    .attr("class", "Country")
    .transition(trans)
    // draw each country
    .attr("d", path.projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.properties["filename"]);

      if (++month==12)month=0;
      if(cur_specy=="PM10"){
        let a=150.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].PM10) : 150;}
      if(cur_specy=="SO2"){
        let a=150.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].SO2) : 150;}
      if(cur_specy=="NO2"){
        let a=200.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].NO2) : 200;}
      if(cur_specy=="CO"){
        let a=10.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
        return d.total ? colorScale(d.total[month].CO)  : 10;}
      if(cur_specy=="O3"){
        let a=160.0/300;
      colorScale = d3
      .scaleLinear()
      .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
      .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
       return d.total ? colorScale(d.total[month].O3) : 160;}
       let a=300.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
      return d.total ? colorScale(d.total[month].Temperature) : 300;
    });

  // Interactivity
  choroMap
    .on("pointermove", function (event, d) {  //鼠标移动
      hovered = true;
      tipCountry = d.total ? d.total[0].code : null;
      tipData = tipCountry
        ? data.get(tipCountry)[month]
        //? data.get(tipCountry)[Year]
        : {Country: "No available data", Temperature: ""};
      tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "μg/m³");
      //tooltip.html(tipData.name + "<br/>" + tipData.haha + "℃");
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(100)
        .style("opacity", 0.9)
        .style("font-size", "10px");
      d3.selectAll(".Country").transition().duration(50).style("opacity", 0.5); //透明度0.5 半透明 0表示完全透明，等同于隐藏
      d3.select(this)
        .transition()
        .duration(50)
        .style("opacity", 1) //透明度为1 表示不透明
        .style("stroke", "#0A0A0A") //颜色
        .style("stroke-width", "0.5px");// 笔画粗细，画笔粗细(毛笔，铅笔，钢笔)
    })
    .on("pointerleave", function (event) { // 鼠标移出
      hovered = false;
      // Country highlighting
      d3.selectAll(".Country").transition().duration(50).style("opacity", 1);
      d3.select(this).transition().duration(50).style("stroke", "none");
      // Tooltip
      tooltip.transition().duration(100).style("opacity", 0);
    });
  // Update tooltip data
  if (hovered) {
    tipData = tipCountry
      ? data.get(tipCountry)[month]
      : {Country: "No available data", Temperature: ""};
      if (++month==12)month=0;
      
      tooltip.html(tipData.Country + "<br/>" + tipData.Temperature + "μg/m³");
      if(cur_specy=="PM10"){
        let a=150.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].PM10) : 150;}
      if(cur_specy=="SO2"){
        let a=150.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].SO2) : 150;}
      if(cur_specy=="NO2"){
        let a=200.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
         return d.total ? colorScale(d.total[month].NO2) : 200;}
      if(cur_specy=="CO"){
        let a=10.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
        return d.total ? colorScale(d.total[month].CO)  : 10;}
      if(cur_specy=="O3"){
        let a=160.0/300;
      colorScale = d3
      .scaleLinear()
      .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
      .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
       return d.total ? colorScale(d.total[month].O3) : 160;}
       let a=300.0/300;
        colorScale = d3
        .scaleLinear()
        .domain([ 0,35*a ,75*a ,115*a ,250*a , 300*a])
        .range(["#5F9879","#96B971","#FDFD72","#ECEB73","#D75454", "#B53838"]);
      return d.total ? colorScale(d.total[month].Temperature) : 300;
  }
}

export {initChart, updateChart};
