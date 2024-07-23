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
    const chart = d3.select("#chart");

    textBox.selectAll("*").remove();
    textBox.append("h2").text(slide.title);
    textBox.append("p").text(slide.content);

    chart.selectAll("*").remove();
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = chart.node().clientWidth - margin.left - margin.right;
    const height = (chart.node().clientHeight - margin.top - margin.bottom) / 2;

    const svgDeaths = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const svgVaccinations = chart.append("svg")
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
            .domain([0, d3.max(filteredData, d => d.new_deaths_smoothed)])
            .range([height, 0]);

        const yVaccinations = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.new_vaccinations_smoothed)])
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

        svgDeaths.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));

        svgVaccinations.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));

        svgDeaths.append("g")
            .call(d3.axisLeft(yDeaths));

        svgVaccinations.append("g")
            .call(d3.axisLeft(yVaccinations));

        slide.annotations.forEach(annotation => {
            svgDeaths.append("text")
                .attr("x", x(annotation.month))
                .attr("y", yDeaths(annotation.deaths))
                .attr("class", "annotation")
                .text(annotation.text);
        });
    });
}

d3.select("#yearSlider").on("input", function() {
    const year = +this.value;
    currentSlide = slides.findIndex(slide => slide.year === year);
    d3.select("#yearLabel").text(year);
    renderSlide(currentSlide);
});

d3.select("#prevBtn").on("click", () => {
    if (currentSlide > 0) {
        currentSlide--;
        renderSlide(currentSlide);
        document.getElementById("yearSlider").value = slides[currentSlide].year;
    }
});

d3.select("#nextBtn").on("click", () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderSlide(currentSlide);
        document.getElementById("yearSlider").value = slides[currentSlide].year;
    }
});

d3.select("#btn1").on("click", () => {
    currentSlide = 0;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
});

d3.select("#btn2").on("click", () => {
    currentSlide = 1;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
});

d3.select("#btn3").on("click", () => {
    currentSlide = 2;
    renderSlide(currentSlide);
    document.getElementById("yearSlider").value = slides[currentSlide].year;
});

renderSlide(currentSlide);
