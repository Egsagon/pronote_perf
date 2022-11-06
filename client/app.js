// app.js

GRADES = {'Overall': []}
AVERAGE = {}

pages = {
    'home':     document.querySelector('.home'),
    'overall':  document.querySelector('.overall'),
    'graph':    document.querySelector('.graph'),
    'array':    document.querySelector('.array')
}

current_page = 'home'

// Default graph tab
graph_cat = 'Overall' // TODO: overall first

function get_grade(grade) {
    // Get the grade of an object and calculate its value out of 20

    val = (grade.grade * 20) / grade.out_of
    grade.coefficient *= (grade.out_of / 20)
    return val
}

function get_class_grade(grade) {
    // Get the grade of an object and calculate its value out of 20

    val = (grade.average * 20) / grade.out_of
    grade.coefficient *= (grade.out_of / 20)
    return val
}

function switch_page(page, animate = true) {
    // Smooth scrolling to a page

    let index = Object.keys(pages).indexOf(page)
    let dist = index * document.documentElement.clientHeight

    window.scrollTo({top: dist, behavior: animate ? 'smooth' : 'auto'});
    current_page = page
}

function plot() {
    // Plots grades to the graph

    subject = graph_cat

    mode = 'lines+markers'

    // If mode is overall, don't draw the lines
    // because it would be a mess for some reason
    if (subject == 'Overall') {mode = 'markers'}

    grades = GRADES[subject]

    arrx = []
    arry = []
    cap = []

    minx = Infinity
    maxx = 0

    for (let grade of grades) {

        date = Date.parse(grade.date)
        
        if (date < minx) {minx = date}
        if (date > maxx) {maxx = date}

        // Set grade on 20 if nescessary
        val = get_grade(grade)
        
        arrx.push(date)
        arry.push(val)
        cap.push(grade)
    }

    let data = [{
        x: arrx,
        y: arry,
        mode: mode,
        marker: {size: 16, color:'#202634'},
        type: "scatter",
        text: cap,
        hovertemplate: '%{text.grade}/%{text.out_of} (coef. %{text.coefficient})<br>' + 
                       'From %{text.date}<br>' + 
                       '%{text.comment}<extra></extra>',
    }]
    
    padding = 10e7

    let layout = {
        xaxis: {range: [minx - padding, maxx + padding], title: "Time", showgrid: false, showticklabels: false},

        yaxis: {
            range: [0, 20 + .3], // Space for the max grades
            title: "Performance",
            showgrid: false,
            showline: true,
            showticklabels: false
        },

        title: `Subject: ${graph_cat}`,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent"
    }

    Plotly.newPlot('gcontent', data, layout, {displayModeBar: false})
}

// Attribuate home buttons
document.querySelectorAll('.home .pages button').forEach((btn) => {
    btn.addEventListener('click', () => {switch_page(btn.name)})
})

// On scroll, redraw the graph and center back the current page
window.onresize = () => {
    plot(graph_cat)
    switch_page(current_page, false)
}

// Fetch data
fetch("grades.json").then((res) => res.json()).then((data) => {

    GRADES = data
    GRADES['Overall'] = []

    let g_avg = 0
    let g_avg_class = 0

    // Load grades array
    for (let [subject, grades] of Object.entries(data)) {

        // Create a new graph button
        btn = document.createElement('button')
        btn.innerHTML = subject
        btn.addEventListener('click', () => {
            graph_cat = subject
            plot(graph_cat)
        })

        document.querySelector('.types').append(btn)

        // Create new row
        row = document.createElement('tr')

        // Add the subject name
        sub = document.createElement('th')
        sub.innerHTML = subject
        sub.className = 'subject'
        row.append(sub)

        for (let grade of grades) {

            // Create new grade object
            obj = document.createElement('td')
            obj.innerHTML = grade.grade
            obj.className = 'grade'

            obj.addEventListener('click', () => {
                // console.log(grade.grade)
            })

            row.append(obj)
        }

        // Append row to array
        pages.array.append(row)
    }

    // Calculate the average in each subject
    Object.keys(GRADES).forEach((subject) => {

        // Student
        sum = 0
        div = 0

        // Class
        csum = 0
        cdiv = 0
        
        for (let grade of GRADES[subject]) {
            sum += get_grade(grade) * grade.coefficient
            csum += get_class_grade(grade) * grade.coefficient

            div += grade.coefficient
            cdiv += grade.coefficient
        }

        // Divide sum of grades with sum of coefs.
        avg = (sum / div).toPrecision(3)

        // Add to global average (TODO: subject ponderations)
        g_avg += avg
        g_avg_class += (csum / cdiv).toPrecision(3)

        AVERAGE[subject] = avg
    })

    // Add a section with all grades
    for (let [_, grades] of Object.entries(data)) {GRADES.Overall.push(...grades)}

    // Display averages
    for (let [subject, avg] of Object.entries(AVERAGE)) {
        // console.log(subject, avg)

        p = document.createElement('p')
        p.innerHTML = `<span class='subspan'>${subject}:</span> ${avg}`
        document.querySelector('.overall .subjects').append(p)
    }

    // Display global averages
    o = document.querySelectorAll('.overall *')
    o[0].innerHTML = `<span class='avgspan'>Average:</span> ${g_avg}`
    o[1].innerHTML = `<span class='avgspan'>Class average:</span> ${g_avg_class}`

    // Display graph for the first time
    plot(graph_cat)
})
