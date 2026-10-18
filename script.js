// ==========================================
// PRESSUREGUARD SIMULATOR
// REPOLISHED FINAL BEHAVIOUR
// SIMULATED DEMONSTRATION DATA
// ==========================================


// ==========================================
// SETTINGS
// ==========================================

const BASE_PRESSURE = 12.0;

const ELEVATED_THRESHOLD = 28.0;
const WARNING_THRESHOLD = 35.0;

const PEAK_PRESSURE = 38.0;
const RELIEVED_PRESSURE = 8.5;

const DETECTION_TIME = 650;
const RISE_TIME = 6200;
const VERIFY_TIME = 900;
const RESPONSE_TIME = 700;
const DEFLATION_TIME = 4600;
const INFLATION_TIME = 4800;


// ==========================================
// SYSTEM STATE
// ==========================================

let activeCell = null;
let sequenceNumber = 0;

let pressureValues = [
    12.0,
    12.1,
    11.9,
    12.2
];

let reinflatingCells = new Set();


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
// MAIN EVENT
// ==========================================

async function triggerPressure(cellNumber) {

    // Ignore repeated selection
    // of the currently active cell.

    if (activeCell === cellNumber) {
        return;
    }


    sequenceNumber++;

    const mySequence = sequenceNumber;

    const previousCell = activeCell;

    activeCell = cellNumber;


    // ======================================
    // REINFLATE PREVIOUS CELL
    // ======================================

    if (
        previousCell !== null &&
        previousCell !== cellNumber
    ) {

        reinflateCell(previousCell);

    }


    // ======================================
    // GET ELEMENTS
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


    if (
        !cell ||
        !state ||
        !card ||
        !bar
    ) {
        return;
    }


    reinflatingCells.delete(
        cellNumber
    );


    cell.classList.remove(
        "deflated"
    );


    state.classList.remove(
        "warning",
        "elevated"
    );


    bar.classList.remove(
        "high",
        "elevated"
    );


    card.classList.add(
        "active"
    );


    setMainSensor(
        cellNumber
    );


    setWarningActive(
        false
    );


    // ======================================
    // LOAD DETECTION
    // ======================================

    state.textContent =
        "LOAD DETECTED";


    setMonitor(
        "rising",
        "DETECTING"
    );


    setMessage(
        "Load Change Detected — Sensor "
        + cellNumber,

        "Sensor signal is being evaluated."
    );


    await wait(
        DETECTION_TIME
    );


    if (
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // MONITORING
    // ======================================

    state.textContent =
        "PRESSURE RISING";


    setMonitor(
        "rising",
        "MONITORING"
    );


    setMessage(
        "Monitoring Sensor "
        + cellNumber,

        "Simulated contact pressure is increasing."
    );


    // ======================================
    // NATURAL PRESSURE RISE
    // ======================================

    const riseCompleted =
        await animateNaturalRise(
            cellNumber,
            pressureValues[cellNumber - 1],
            PEAK_PRESSURE,
            RISE_TIME,
            mySequence
        );


    if (
        !riseCompleted ||
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // VERIFY HIGH PRESSURE
    // ======================================

    state.textContent =
        "VERIFYING HIGH PRESSURE";


    setMonitor(
        "danger",
        "VERIFYING..."
    );


    setMessage(
        "High Pressure Detected",

        "Controller is verifying the simulated pressure reading."
    );


    await wait(
        VERIFY_TIME
    );


    if (
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // THRESHOLD CONFIRMED
    // ======================================

    state.textContent =
        "HIGH PRESSURE";


    state.classList.remove(
        "elevated"
    );


    state.classList.add(
        "warning"
    );


    bar.classList.remove(
        "elevated"
    );


    bar.classList.add(
        "high"
    );


    setWarningActive(
        true
    );


    setMonitor(
        "danger",
        "⚠ THRESHOLD EXCEEDED"
    );


    setMessage(
        "⚠ Demo Threshold Exceeded — Cell "
        + cellNumber,

        "High simulated pressure confirmed. "
        + "Controller response initiated."
    );


    await wait(
        RESPONSE_TIME
    );


    if (
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // VALVE RESPONSE
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


    cell.classList.add(
        "deflated"
    );


    // ======================================
    // NATURAL DEFLATION
    // ======================================

    const deflationCompleted =
        await animateNaturalDeflation(
            cellNumber,
            pressureValues[cellNumber - 1],
            RELIEVED_PRESSURE,
            DEFLATION_TIME,
            mySequence
        );


    if (
        !deflationCompleted ||
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // PRESSURE RELIEVED
    // ======================================

    pressureValues[cellNumber - 1] =
        RELIEVED_PRESSURE;


    updatePressure(
        cellNumber,
        RELIEVED_PRESSURE
    );


    state.textContent =
        "DEFLATED • VALVE CLOSED";


    state.classList.remove(
        "warning",
        "elevated"
    );


    card.classList.remove(
        "active"
    );


    bar.classList.remove(
        "high",
        "elevated"
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
// NATURAL PRESSURE RISE
// ==========================================

function animateNaturalRise(
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


            function animate(now) {

                if (
                    sequence !== sequenceNumber
                ) {

                    resolve(false);
                    return;

                }


                const progress =
                    Math.min(
                        (now - startTime)
                        / duration,
                        1
                    );


                // Faster initially,
                // slightly slower through middle.

                const curvedProgress =
                    progress < 0.55

                        ? 0.62 *
                          Math.pow(
                              progress / 0.55,
                              0.82
                          )

                        : 0.62 +
                          0.38 *
                          Math.pow(
                              (progress - 0.55)
                              / 0.45,
                              1.15
                          );


                const trend =
                    startValue +
                    (
                        endValue -
                        startValue
                    )
                    * curvedProgress;


                // Subtle simulated sensor noise.

                const variation1 =
                    Math.sin(
                        now / 240
                    )
                    * 0.22;


                const variation2 =
                    Math.sin(
                        now / 93
                    )
                    * 0.08;


                const fadeNoise =
                    1 - progress;


                let value =
                    trend +
                    (
                        variation1 +
                        variation2
                    )
                    * fadeNoise;


                value =
                    Math.max(
                        startValue,
                        Math.min(
                            value,
                            endValue
                        )
                    );


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

                } else {

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
// NATURAL DEFLATION
// ==========================================

function animateNaturalDeflation(
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


            function animate(now) {

                if (
                    sequence !== sequenceNumber
                ) {

                    resolve(false);
                    return;

                }


                const progress =
                    Math.min(
                        (now - startTime)
                        / duration,
                        1
                    );


                // Faster pressure reduction
                // at first, slower near end.

                const fallCurve =
                    (
                        1 -
                        Math.exp(
                            -3.7 * progress
                        )
                    )
                    /
                    (
                        1 -
                        Math.exp(-3.7)
                    );


                const trend =
                    startValue +
                    (
                        endValue -
                        startValue
                    )
                    * fallCurve;


                const variation =
                    Math.sin(
                        now / 180
                    )
                    * 0.12
                    * (1 - progress);


                let value =
                    trend + variation;


                value =
                    Math.max(
                        endValue,
                        Math.min(
                            value,
                            startValue
                        )
                    );


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

                } else {

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
    // NORMAL
    // ======================================

    if (
        value < ELEVATED_THRESHOLD
    ) {

        state.textContent =
            "PRESSURE RISING";


        state.classList.remove(
            "elevated",
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
        value < WARNING_THRESHOLD
    ) {

        state.textContent =
            "ELEVATED";


        state.classList.remove(
            "warning"
        );


        state.classList.add(
            "elevated"
        );


        setMonitor(
            "elevated",
            "ELEVATED"
        );

    }


    // ======================================
    // HIGH PRESSURE
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
            "HIGH PRESSURE"
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


    reinflatingCells.add(
        cellNumber
    );


    state.classList.remove(
        "warning",
        "elevated"
    );


    state.textContent =
        "VALVE CLOSED • INFLATING";


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
            "high",
            "elevated"
        );

    }


    const startValue =
        pressureValues[
            cellNumber - 1
        ];


    const startTime =
        performance.now();


    function animate(now) {

        // Stop reinflation if this cell
        // becomes active again.

        if (
            activeCell === cellNumber
        ) {

            reinflatingCells.delete(
                cellNumber
            );

            return;

        }


        const progress =
            Math.min(
                (now - startTime)
                / INFLATION_TIME,
                1
            );


        const curve =
            1 -
            Math.pow(
                1 - progress,
                2.2
            );


        const trend =
            startValue +
            (
                BASE_PRESSURE -
                startValue
            )
            * curve;


        const tinyVariation =
            Math.sin(
                now / 210
            )
            * 0.06
            * (1 - progress);


        const value =
            trend +
            tinyVariation;


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

        } else {

            pressureValues[
                cellNumber - 1
            ] =
                BASE_PRESSURE +
                randomBetween(
                    -0.15,
                    0.15
                );


            updatePressure(
                cellNumber,
                pressureValues[
                    cellNumber - 1
                ]
            );


            state.textContent =
                "INFLATED";


            reinflatingCells.delete(
                cellNumber
            );

        }

    }


    requestAnimationFrame(
        animate
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
    // PRESSURE BAR WIDTH + COLOUR
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


        // Reset colour state.

        bar.classList.remove(
            "elevated",
            "high"
        );


        // RED: threshold exceeded.

        if (
            value >= WARNING_THRESHOLD
        ) {

            bar.classList.add(
                "high"
            );

        }


        // AMBER: elevated.

        else if (
            value >= ELEVATED_THRESHOLD
        ) {

            bar.classList.add(
                "elevated"
            );

        }

        // Otherwise no class is added,
        // so normal CSS blue is used.

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

    }

}


// ==========================================
// IDLE SENSOR FLUCTUATION
// ==========================================

function updateIdleSensors() {

    for (
        let cellNumber = 1;
        cellNumber <= 4;
        cellNumber++
    ) {

        // Don't change active sensor.

        if (
            cellNumber === activeCell
        ) {
            continue;
        }


        // Don't interfere with reinflation.

        if (
            reinflatingCells.has(
                cellNumber
            )
        ) {
            continue;
        }


        const target =
            BASE_PRESSURE +
            randomBetween(
                -0.45,
                0.45
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
            * 0.22;


        updatePressure(
            cellNumber,
            pressureValues[
                cellNumber - 1
            ]
        );

    }

}


// Update approximately twice each second.

setInterval(
    updateIdleSensors,
    550
);


// ==========================================
// MAIN SENSOR LABEL
// ==========================================

function setMainSensor(cellNumber) {

    const label =
        document.getElementById(
            "mainSensorLabel"
        );


    if (label) {

        label.textContent =
            "SENSOR " + cellNumber;

    }

}


// ==========================================
// WARNING STRIP
// ==========================================

function setWarningActive(active) {

    const warningBox =
        document.getElementById(
            "warningBox"
        );


    if (!warningBox) {
        return;
    }


    if (active) {

        warningBox.classList.add(
            "active"
        );

    } else {

        warningBox.classList.remove(
            "active"
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
// MESSAGE STRIP
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
// HELPERS
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


function randomBetween(
    minimum,
    maximum
) {

    return (
        minimum +
        Math.random()
        * (
            maximum -
            minimum
        )
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
