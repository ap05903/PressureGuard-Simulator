// ==========================================
// PRESSUREGUARD SIMULATOR
// LATEST VERSION
// SIMULATED DEMONSTRATION DATA
// ==========================================


// ==========================================
// SETTINGS
// ==========================================

const BASE_PRESSURE = 12;

const ELEVATED_THRESHOLD = 28;

const WARNING_THRESHOLD = 35;

const MAX_PRESSURE = 38.2;

const RELIEVED_PRESSURE = 8.4;

const PRESSURE_RISE_TIME = 5000;

const WARNING_PAUSE_TIME = 1200;

const DEFLATION_TIME = 4000;

const INFLATION_TIME = 4000;


// ==========================================
// SYSTEM VARIABLES
// ==========================================

let activeCell = null;

let sequenceNumber = 0;

let pressureValues = [
    12.1,
    11.8,
    12.3,
    12.0
];


// ==========================================
// GRAPH VARIABLES
// ==========================================

let graphValues = [];

const MAX_GRAPH_POINTS = 60;


// ==========================================
// BUTTON CONTROLS
// ==========================================

document
    .querySelectorAll("[data-cell]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                triggerPressure(
                    Number(button.dataset.cell)
                );

            }
        );

    });


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            ["1", "2", "3", "4"]
                .includes(event.key)
        ) {

            triggerPressure(
                Number(event.key)
            );

        }

    }
);


// ==========================================
// MAIN PRESSURE EVENT
// ==========================================

async function triggerPressure(cellNumber) {

    // Do not trigger the same active cell again.

    if (activeCell === cellNumber) {
        return;
    }


    sequenceNumber++;

    const mySequence = sequenceNumber;

    const previousCell = activeCell;

    activeCell = cellNumber;


    // Clear previous graph when a new sensor is selected.

    graphValues = [];

    clearGraph();


    // ======================================
    // REINFLATE PREVIOUS CELL
    // ======================================

    if (previousCell !== null) {

        reinflateCell(
            previousCell
        );

    }


    // ======================================
    // PREPARE NEW CELL
    // ======================================

    const cell =
        document.getElementById(
            "cell" + cellNumber
        );

    const state =
        document.getElementById(
            "state" + cellNumber
        );

    const card =
        document.getElementById(
            "readingCard" + cellNumber
        );

    const bar =
        document.getElementById(
            "bar" + cellNumber
        );


    cell.classList.remove(
        "deflated"
    );


    state.classList.remove(
        "warning"
    );

    state.classList.remove(
        "elevated"
    );


    bar.classList.remove(
        "high"
    );


    state.textContent =
        "PRESSURE RISING";


    card.classList.add(
        "active"
    );


    // ======================================
    // MAIN MONITOR
    // ======================================

    const mainSensorLabel =
        document.getElementById(
            "mainSensorLabel"
        );


    if (mainSensorLabel) {

        mainSensorLabel.textContent =
            "SENSOR " + cellNumber;

    }


    const graphSensor =
        document.getElementById(
            "graphSensor"
        );


    if (graphSensor) {

        graphSensor.textContent =
            "SENSOR " + cellNumber;

    }


    const warningBox =
        document.getElementById(
            "warningBox"
        );


    if (warningBox) {

        warningBox.classList.remove(
            "active"
        );

    }


    setMonitor(
        "rising",
        "MONITORING"
    );


    setMessage(

        "Monitoring Sensor " + cellNumber,

        "Simulated contact pressure is increasing."

    );


    // ======================================
    // PRESSURE RISE
    // ======================================

    const completed =
        await animateIrregularRise(

            cellNumber,

            pressureValues[
                cellNumber - 1
            ],

            MAX_PRESSURE,

            PRESSURE_RISE_TIME,

            mySequence

        );


    if (
        !completed ||
        mySequence !== sequenceNumber
    ) {

        return;

    }


    // ======================================
    // THRESHOLD EXCEEDED
    // ======================================

    setMonitor(
        "danger",
        "⚠ THRESHOLD EXCEEDED"
    );


    state.textContent =
        "HIGH PRESSURE";


    state.classList.remove(
        "elevated"
    );


    state.classList.add(
        "warning"
    );


    bar.classList.add(
        "high"
    );


    if (warningBox) {

        warningBox.classList.add(
            "active"
        );

    }


    setMessage(

        "⚠ Demo Threshold Exceeded — Cell "
        + cellNumber,

        "Simulated reading exceeded "
        + WARNING_THRESHOLD
        + " mmHg. Controller response initiated."

    );


    // ======================================
    // SHORT CONTROLLER RESPONSE DELAY
    // ======================================

    await wait(
        WARNING_PAUSE_TIME
    );


    if (
        mySequence !== sequenceNumber
    ) {

        return;

    }


    // ======================================
    // OPEN EXHAUST VALVE
    // ======================================

    state.textContent =
        "VALVE OPEN • DEFLATING";


    setMonitor(
        "danger",
        "REDISTRIBUTING"
    );


    setMessage(

        "Pressure Redistribution Active",

        "Exhaust valve opened. Cell "
        + cellNumber
        + " is deflating."

    );


    // Physical cell begins flattening.

    cell.classList.add(
        "deflated"
    );


    // ======================================
    // PRESSURE FALL
    // ======================================

    const deflated =
        await animatePressure(

            cellNumber,

            pressureValues[
                cellNumber - 1
            ],

            RELIEVED_PRESSURE,

            DEFLATION_TIME,

            mySequence

        );


    if (
        !deflated ||
        mySequence !== sequenceNumber
    ) {

        return;

    }


    // ======================================
    // PRESSURE RELIEVED
    // ======================================

    pressureValues[
        cellNumber - 1
    ] = RELIEVED_PRESSURE;


    updatePressure(
        cellNumber,
        RELIEVED_PRESSURE
    );


    state.textContent =
        "DEFLATED • VALVE CLOSED";


    state.classList.remove(
        "warning"
    );


    state.classList.remove(
        "elevated"
    );


    card.classList.remove(
        "active"
    );


    bar.classList.remove(
        "high"
    );


    setMonitor(
        "normal",
        "PRESSURE RELIEVED"
    );


    setMessage(

        "Pressure Relieved — Cell "
        + cellNumber,

        "Simulated pressure has decreased. "
        + "Select another sensor to continue."

    );

}


// ==========================================
// IRREGULAR PRESSURE RISE
// ==========================================

function animateIrregularRise(
    cellNumber,
    startValue,
    endValue,
    duration,
    sequence
) {

    return new Promise(
        function (resolve) {

            const startTime =
                performance.now();


            function animate(currentTime) {

                if (
                    sequence !==
                    sequenceNumber
                ) {

                    resolve(false);

                    return;

                }


                const progress =
                    Math.min(

                        (
                            currentTime -
                            startTime
                        )
                        /
                        duration,

                        1

                    );


                // General upward trend.

                const trend =

                    startValue +

                    (
                        endValue -
                        startValue
                    )

                    * progress;


                // Small simulated variation.

                const variation =

                    Math.sin(
                        currentTime / 170
                    )

                    * 0.45

                    * (1 - progress);


                const value =
                    trend + variation;


                pressureValues[
                    cellNumber - 1
                ] = value;


                updatePressure(
                    cellNumber,
                    value
                );


                updatePressureState(
                    cellNumber,
                    value
                );


                if (progress < 1) {

                    requestAnimationFrame(
                        animate
                    );

                }

                else {

                    pressureValues[
                        cellNumber - 1
                    ] = endValue;


                    updatePressure(
                        cellNumber,
                        endValue
                    );


                    resolve(true);

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}


// ==========================================
// PRESSURE FALL ANIMATION
// ==========================================

function animatePressure(
    cellNumber,
    startValue,
    endValue,
    duration,
    sequence
) {

    return new Promise(
        function (resolve) {

            const startTime =
                performance.now();


            function animate(currentTime) {

                if (
                    sequence !==
                    sequenceNumber
                ) {

                    resolve(false);

                    return;

                }


                const progress =
                    Math.min(

                        (
                            currentTime -
                            startTime
                        )
                        /
                        duration,

                        1

                    );


                // Smooth acceleration/deceleration.

                const smoothProgress =

                    progress *
                    progress *
                    (
                        3 -
                        2 * progress
                    );


                // Small variation during deflation.

                const variation =

                    Math.sin(
                        currentTime / 150
                    )

                    * 0.18

                    * (1 - progress);


                const value =

                    startValue +

                    (
                        endValue -
                        startValue
                    )

                    * smoothProgress

                    + variation;


                pressureValues[
                    cellNumber - 1
                ] = value;


                updatePressure(
                    cellNumber,
                    value
                );


                if (progress < 1) {

                    requestAnimationFrame(
                        animate
                    );

                }

                else {

                    pressureValues[
                        cellNumber - 1
                    ] = endValue;


                    updatePressure(
                        cellNumber,
                        endValue
                    );


                    resolve(true);

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}


// ==========================================
// PRESSURE STATE
// ==========================================

function updatePressureState(
    cellNumber,
    value
) {

    const state =
        document.getElementById(
            "state" + cellNumber
        );


    if (!state) {
        return;
    }


    // ======================================
    // NORMAL RISING
    // ======================================

    if (
        value < ELEVATED_THRESHOLD
    ) {

        state.textContent =
            "PRESSURE RISING";


        state.classList.remove(
            "elevated"
        );


        state.classList.remove(
            "warning"
        );


        setMonitor(
            "rising",
            "MONITORING"
        );

    }


    // ======================================
    // ELEVATED
    // ======================================

    else if (
        value >= ELEVATED_THRESHOLD &&
        value < WARNING_THRESHOLD
    ) {

        state.textContent =
            "ELEVATED";


        state.classList.add(
            "elevated"
        );


        state.classList.remove(
            "warning"
        );


        setMonitor(
            "elevated",
            "ELEVATED"
        );

    }


    // ======================================
    // DEMO THRESHOLD EXCEEDED
    // ======================================

    else {

        state.textContent =
            "HIGH PRESSURE";


        state.classList.remove(
            "elevated"
        );


        state.classList.add(
            "warning"
        );


        setMonitor(
            "danger",
            "⚠ THRESHOLD EXCEEDED"
        );

    }

}


// ==========================================
// REINFLATE PREVIOUS CELL
// ==========================================

function reinflateCell(cellNumber) {

    const cell =
        document.getElementById(
            "cell" + cellNumber
        );


    const state =
        document.getElementById(
            "state" + cellNumber
        );


    const card =
        document.getElementById(
            "readingCard" + cellNumber
        );


    const bar =
        document.getElementById(
            "bar" + cellNumber
        );


    if (
        !cell ||
        !state
    ) {

        return;

    }


    state.classList.remove(
        "warning"
    );


    state.classList.remove(
        "elevated"
    );


    state.textContent =
        "VALVE CLOSED • INFLATING";


    // Visually reinflate the air cell.

    cell.classList.remove(
        "deflated"
    );


    if (card) {

        card.classList.remove(
            "active"
        );

    }


    if (bar) {

        bar.classList.remove(
            "high"
        );

    }


    const startingValue =
        pressureValues[
            cellNumber - 1
        ];


    const startTime =
        performance.now();


    function animateInflation(
        currentTime
    ) {

        const progress =
            Math.min(

                (
                    currentTime -
                    startTime
                )
                /
                INFLATION_TIME,

                1

            );


        const smoothProgress =

            progress *
            progress *
            (
                3 -
                2 * progress
            );


        const value =

            startingValue +

            (
                BASE_PRESSURE -
                startingValue
            )

            * smoothProgress;


        pressureValues[
            cellNumber - 1
        ] = value;


        updatePressure(
            cellNumber,
            value
        );


        if (progress < 1) {

            requestAnimationFrame(
                animateInflation
            );

        }

        else {

            pressureValues[
                cellNumber - 1
            ] = BASE_PRESSURE;


            updatePressure(
                cellNumber,
                BASE_PRESSURE
            );


            state.textContent =
                "INFLATED";

        }

    }


    requestAnimationFrame(
        animateInflation
    );

}


// ==========================================
// UPDATE PRESSURE DISPLAY
// ==========================================

function updatePressure(
    cellNumber,
    value
) {

    const displayValue =
        value.toFixed(1);


    const pressureDisplay =
        document.getElementById(
            "pressure" + cellNumber
        );


    if (pressureDisplay) {

        pressureDisplay.textContent =
            displayValue + " mmHg";

    }


    // ======================================
    // PRESSURE BAR
    // ======================================

    const percentage =
        Math.min(
            Math.max(
                (value / 50) * 100,
                0
            ),
            100
        );


    const bar =
        document.getElementById(
            "bar" + cellNumber
        );


    if (bar) {

        bar.style.width =
            percentage + "%";

    }


    // ======================================
    // MAIN ACTIVE SENSOR DISPLAY
    // ======================================

    if (
        cellNumber === activeCell
    ) {

        const mainPressure =
            document.getElementById(
                "mainPressure"
            );


        if (mainPressure) {

            mainPressure.textContent =
                displayValue + " mmHg";

        }


        const graphSensor =
            document.getElementById(
                "graphSensor"
            );


        if (graphSensor) {

            graphSensor.textContent =
                "SENSOR " + cellNumber;

        }


        // Add data to graph at a controlled rate.

        updateGraphData(value);

    }

}


// ==========================================
// NORMAL IDLE SENSOR FLUCTUATION
// ==========================================

function updateIdleSensors() {

    for (
        let cellNumber = 1;
        cellNumber <= 4;
        cellNumber++
    ) {

        // Don't interfere with active cell.

        if (
            cellNumber === activeCell
        ) {

            continue;

        }


        const state =
            document.getElementById(
                "state" + cellNumber
            );


        // Don't interfere during reinflation.

        if (
            state &&
            state.textContent.includes(
                "INFLATING"
            )
        ) {

            continue;

        }


        const target =

            BASE_PRESSURE +

            (
                Math.random() * 1.2
                - 0.6
            );


        pressureValues[
            cellNumber - 1
        ] +=

            (
                target -

                pressureValues[
                    cellNumber - 1
                ]

            )

            * 0.35;


        updatePressure(
            cellNumber,
            pressureValues[
                cellNumber - 1
            ]
        );

    }

}


// Update idle sensors every 500 ms.

setInterval(
    updateIdleSensors,
    500
);


// ==========================================
// LIVE GRAPH
// ==========================================

let lastGraphUpdate = 0;


function updateGraphData(value) {

    const now =
        performance.now();


    // Prevent hundreds of points per second.

    if (
        now -
        lastGraphUpdate <
        100
    ) {

        return;

    }


    lastGraphUpdate = now;


    addGraphPoint(
        value
    );

}


// ==========================================
// ADD GRAPH POINT
// ==========================================

function addGraphPoint(value) {

    const graph =
        document.getElementById(
            "graphLine"
        );


    // If graph HTML hasn't been added,
    // simulator still works normally.

    if (!graph) {
        return;
    }


    graphValues.push(
        value
    );


    if (
        graphValues.length >
        MAX_GRAPH_POINTS
    ) {

        graphValues.shift();

    }


    drawGraph();

}


// ==========================================
// DRAW GRAPH
// ==========================================

function drawGraph() {

    const graph =
        document.getElementById(
            "graphLine"
        );


    if (
        !graph ||
        graphValues.length < 2
    ) {

        return;

    }


    const width = 300;

    const height = 80;

    const maxPressure = 50;


    const points =
        graphValues.map(

            function (
                value,
                index
            ) {

                const x =

                    (
                        index /
                        (MAX_GRAPH_POINTS - 1)
                    )

                    * width;


                const y =

                    height -

                    (
                        value /
                        maxPressure
                    )

                    * height;


                return (

                    x.toFixed(1)

                    + ","

                    + y.toFixed(1)

                );

            }

        );


    graph.setAttribute(
        "points",
        points.join(" ")
    );

}


// ==========================================
// CLEAR GRAPH
// ==========================================

function clearGraph() {

    const graph =
        document.getElementById(
            "graphLine"
        );


    if (graph) {

        graph.setAttribute(
            "points",
            ""
        );

    }

}


// ==========================================
// MONITOR STATUS
// ==========================================

function setMonitor(
    status,
    text
) {

    const monitor =
        document.getElementById(
            "monitorStatus"
        );


    if (!monitor) {
        return;
    }


    monitor.className =
        "monitor-status "
        + status;


    monitor.textContent =
        text;

}


// ==========================================
// MESSAGE BOX
// ==========================================

function setMessage(
    title,
    message
) {

    const titleElement =
        document.getElementById(
            "warningTitle"
        );


    const messageElement =
        document.getElementById(
            "warningMessage"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }

}


// ==========================================
// WAIT
// ==========================================

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


// ==========================================
// INITIAL DISPLAY
// ==========================================

for (
    let cellNumber = 1;
    cellNumber <= 4;
    cellNumber++
) {

    updatePressure(
        cellNumber,
        pressureValues[
            cellNumber - 1
        ]
    );

}
