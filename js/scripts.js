const slides = [
    {
        id: 1,
        title: "2021: COVID-19 Deaths and Vaccinations",
        content: "2021 saw a significant number of COVID-19 deaths, while vaccination efforts began ramping up.",
        year: 2021,
        annotations: [
            { month: 1, deaths: 190740.85799999986, vaccinations: 60356748.0, text: "January 2021: High deaths, vaccination rollout begins." },
            { month: 5, deaths: 36450.272000000004, vaccinations: 114530378.0, text: "May 2021: Continued vaccination efforts." }
        ]
    },
    {
        id: 2,
        title: "2022: Continued Efforts",
        content: "2022 continued with significant efforts in vaccinations and a decrease in deaths.",
        year: 2022,
        annotations: [
            { month: 3, deaths: 80424.85000000005, vaccinations: 161874846.0, text: "March 2022: Increased vaccinations, fewer deaths." }
        ]
    },
    {
        id: 3,
        title: "2023: Stabilization",
        content: "2023 saw a stabilization in deaths and continued vaccinations.",
        year: 2023,
        annotations: [
            { month: 4, deaths: 43591.153999999944, vaccinations: 183419494.0, text: "April 2023: Stable deaths and high vaccination rates." }
        ]
    }
];

let currentSlide = 0;

function renderSlide(slideIndex) {
    const slide = slides[slideIndex];
    const textBox = d3.select("#text-box");
    const chartDeaths = d3.select("#chart-deaths");
    const chartVaccinations = d3.select("#chart-vaccinations");

    textBox.selectAll("*").remove();
    textBox.append("h2").text(slide.title);
    textBox.append("p").text(slide.content);

    chartDeaths.selectAll("*").remove();
    chartVaccinations.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = document.querySelector("#graphs").clientWidth / 2 - margin.left - margin.right;
    const height = 300;

    const svgDeaths = chartDeaths.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const svgVaccinations = chartVaccinations.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("data/covid_yearly_data.csv").then(data => {
        data.forEach(d => {
            d.year = +d.year;
            d.month = +d.month;
            d.new_deaths_smoothed = +d.new_deaths_smoothed;
            d.new_vaccinations_smoothed = +d.new_vaccinations_smoothed;
        });

        const filteredData = data.filter(d => d.year === slide.year);

        const x = d3.scaleLinear()
            .domain([1, 12])
            .range([0, width]);

        const yDeaths = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.new_deaths_smoothed) * 1.2])
            .range([height, 0]);

        const yVaccinations = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.new_vaccinations_smoothed) * 1.2])
            .range([height, 0]);

        const lineDeaths = d3.line()
            .x(d => x(d.month))
            .y(d => yDeaths(d.new_deaths_smoothed))
            .curve(d3.curveMonotoneX);

        const lineVaccinations = d3.line()
            .x(d => x(d.month))
            .y(d => yVaccinations(d.new_vaccinations_smoothed))
            .curve(d3.curveMonotoneX);

        svgDeaths.append("path")
            .data([filteredData])
            .attr("class", "line deaths")
            .attr("d", lineDeaths)
            .attr("stroke", "red")
            .attr("fill", "none");

        svgVaccinations.append("path")
            .data([filteredData])
            .attr("class", "line vaccinations")
            .attr("d", lineVaccinations)
            .attr("stroke", "green")
            .attr("fill", "none");

        const xAxis = d3.axisBottom(x)
            .ticks(12)
            .tickFormat(d => d3.timeFormat("%b")(new Date(2021, d - 1, 1)));

        const yAxisDeaths = d3.axisLeft(yDeaths)
            .tickFormat(d3.format(".2s"));

        const yAxisVaccinations = d3.axisLeft(yVaccinations)
            .tickFormat(d3.format(".2s"));

        svgDeaths.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svgVaccinations.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svgDeaths.append("g")
            .call(yAxisDeaths);

        svgVaccinations.append("g")
            .call(yAxisVaccinations);

        // Y-axis label for deaths chart
        svgDeaths.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("New Deaths Smoothed");

        // Chart title for deaths chart
        svgDeaths.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("COVID-19 New Deaths Smoothed");

        // Y-axis label for vaccinations chart
        svgVaccinations.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("New Vaccinations Smoothed");

        // Chart title for vaccinations chart
        svgVaccinations.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("COVID-19 New Vaccinations Smoothed");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#fff")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px");

        function showTooltip(event, d, type) {
            const monthName = d3.timeFormat("%B")(new Date(2021, d.month - 1, 1));
            const value = type === "deaths" ? d.new_deaths_smoothed : d.new_vaccinations_smoothed;
            tooltip.html(`${monthName}: ${value}`)
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
            tooltip.style("visibility", "visible");
        }

        function hideTooltip() {
            tooltip.style("visibility", "hidden");
        }

        svgDeaths.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.month))
            .attr("cy", d => yDeaths(d.new_deaths_smoothed))
            .attr("r", 5)
            .attr("fill", "red")
            .on("mouseover", (event, d) => showTooltip(event, d, "deaths"))
            .on("mouseout", hideTooltip);

        svgVaccinations.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.month))
            .attr("cy", d => yVaccinations(d.new_vaccinations_smoothed))
            .attr("r", 5)
            .attr("fill", "green")
            .on("mouseover", (event, d) => showTooltip(event, d, "vaccinations"))
            .on("mouseout", hideTooltip);

        slide.annotations.forEach(annotation => {
            svgDeaths.append("text")
                .attr("x", x(annotation.month))
                .attr("y", yDeaths(annotation.deaths))
                .attr("class", "annotation")
                .text(annotation.text);

            svgVaccinations.append("text")
                .attr("x", x(annotation.month))
                .attr("y", yVaccinations(annotation.vaccinations))
                .attr("class", "annotation")
                .text(annotation.text);
        });
    });
}

function updateNavButtons() {
    d3.selectAll(".nav-btn").classed("active", false);
    d3.select(`#btn${currentSlide + 1}`).classed("active", true);
}

d3.select("#yearSlider").on("input", function() {
    const year = +this.value;
    currentSlide = slides.findIndex(slide => slide.year === year);
    renderSlide(currentSlide);
    updateNavButtons();
});

d3.select("#btn1").on("click", () => {
    currentSlide = 0;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
    updateNavButtons();
});

d3.select("#btn2").on("click", () => {
    currentSlide = 1;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
    updateNavButtons();
});

d3.select("#btn3").on("click", () => {
    currentSlide = 2;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
    updateNavButtons();
});

renderSlide(currentSlide);
updateNavButtons();