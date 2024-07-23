const slides = [
    {
        id: 1,
        title: "2021: COVID-19 Deaths and Vaccinations",
        content: "2021 saw a significant number of COVID-19 deaths, while vaccination efforts began ramping up.",
        year: 2021,
        annotations: [
            { year: "2021-01-01", deaths: 100000, vaccinations: 5000000, text: "Early 2021: High deaths, vaccination rollout begins." },
            { year: "2021-06-01", deaths: 300000, vaccinations: 15000000, text: "Mid 2021: Vaccinations increase, deaths start to decrease." }
        ]
    },
    {
        id: 2,
        title: "2022: Continued Vaccinations and Impact on Deaths",
        content: "In 2022, widespread vaccination led to a decrease in COVID-19 deaths.",
        year: 2022,
        annotations: [
            { year: "2022-01-01", deaths: 50000, vaccinations: 30000000, text: "Early 2022: Vaccinations continue, deaths decrease." },
            { year: "2022-12-01", deaths: 10000, vaccinations: 60000000, text: "Late 2022: Significant drop in deaths." }
        ]
    },
    {
        id: 3,
        title: "2023: Stabilization and Ongoing Vaccination Efforts",
        content: "By 2023, COVID-19 deaths have stabilized, and vaccination efforts continue.",
        year: 2023,
        annotations: [
            { year: "2023-01-01", deaths: 5000, vaccinations: 70000000, text: "Early 2023: Continued low death rates." },
            { year: "2023-06-01", deaths: 3000, vaccinations: 75000000, text: "Mid 2023: Ongoing vaccinations, stable death rates." }
        ]
    }
];
let currentSlide = 0;

function renderSlide(slideIndex) {
    const slide = slides[slideIndex];
    const container = d3.select("#container");
    const textBox = d3.select("#text-box");
    const chart = d3.select("#chart");
    
    textBox.selectAll("*").remove();
    textBox.append("h2").text(slide.title);
    textBox.append("p").text(slide.content);
    
    chart.selectAll("*").remove();
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = chart.node().clientWidth - margin.left - margin.right;
    const height = chart.node().clientHeight - margin.top - margin.bottom;
    
    const svg = chart.append("svg")
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
        
        const y1 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.new_deaths_smoothed)])
            .range([height, 0]);
        
        const y2 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.new_vaccinations_smoothed)])
            .range([height, 0]);
        
        const lineDeaths = d3.line()
            .x(d => x(d.month))
            .y(d => y1(d.new_deaths_smoothed));
        
        const lineVaccinations = d3.line()
            .x(d => x(d.month))
            .y(d => y2(d.new_vaccinations_smoothed));
        
        svg.append("path")
            .data([filteredData])
            .attr("class", "line deaths")
            .attr("d", lineDeaths)
            .attr("stroke", "red");
        
        svg.append("path")
            .data([filteredData])
            .attr("class", "line vaccinations")
            .attr("d", lineVaccinations)
            .attr("stroke", "green");
        
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));
        
        svg.append("g")
            .call(d3.axisLeft(y1));
        
        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(y2));
        
        slide.annotations.forEach(annotation => {
            svg.append("text")
                .attr("x", x(new Date(annotation.month)))
                .attr("y", y1(annotation.deaths))
                .attr("class", "annotation")
                .text(annotation.text);
        });
    });
}

d3.select("#btn1").on("click", () => {
    currentSlide = 0;
    renderSlide(currentSlide);
});

d3.select("#btn2").on("click", () => {
    currentSlide = 1;
    renderSlide(currentSlide);
});

d3.select("#btn3").on("click", () => {
    currentSlide = 2;
    renderSlide(currentSlide);
});

renderSlide(currentSlide);