// ==========================================
// PRESSUREGUARD SIMULATOR
// SIMULATED DEMONSTRATION DATA
// ==========================================

const BASE_PRESSURE = 12;
const WARNING_THRESHOLD = 35;
const ELEVATED_THRESHOLD = 28;

const PRESSURE_RISE_TIME = 5000;
const WARNING_PAUSE_TIME = 1200;
const DEFLATION_TIME = 4000;
const INFLATION_TIME = 4000;

let activeCell = null;

let pressureValues = [
    12.1,
    11.8,
    12.3,
    12.0
];

let sequenceNumber = 0;


// ==========================================
// BUTTON CONTROLS
// ==========================================

document
    .querySelectorAll("[data-cell]")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

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
    function(event) {

        if (["1", "2", "3", "4"].includes(event.key)) {

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

    // Ignore repeated selection of same active cell

    if (activeCell === cellNumber) {
        return;
    }


    sequenceNumber++;

    const mySequence =
        sequenceNumber;

    const previousCell =
        activeCell;

    activeCell =
        cellNumber;


    // --------------------------------------
    // PREVIOUS CELL REINFLATES
    // --------------------------------------

    if (previousCell !== null) {

        reinflateCell(
            previousCell
        );

    }


    // --------------------------------------
    // NEW ACTIVE CELL
    // --------------------------------------

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


    cell.classList.remove(
        "deflated"
    );

    state.classList.remove(
        "warning"
    );

    state.classList.remove(
        "elevated"
    );

    state.textContent =
        "PRESSURE RISING";

    card.classList.add(
        "active"
    );


    document
        .getElementById(
            "mainSensorLabel"
        )
        .textContent =
        "SENSOR " + cellNumber;


    document
        .getElementById(
            "warningBox"
        )
        .classList.remove(
            "active"
        );


    setMonitor(
        "rising",
        "MONITORING"
    );


    setMessage(
        "Monitoring Sensor " + cellNumber,
        "Simulated contact pressure is increasing."
    );


    // ======================================
    // IRREGULAR PRESSURE RISE
    // ======================================

    const completed =
        await animateIrregularRise(
            cellNumber,
            pressureValues[cellNumber - 1],
            38.2,
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


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.add(
            "high"
        );


    document
        .getElementById(
            "warningBox"
        )
        .classList.add(
            "active"
        );


    setMessage(

        "⚠ Demo Threshold Exceeded — Cell "
        + cellNumber,

        "Simulated reading exceeded "
        + WARNING_THRESHOLD
        + " mmHg. Controller response initiated."

    );


    await wait(
        WARNING_PAUSE_TIME
    );


    if (
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // DEFLATION
    // ======================================

    state.textContent =
        "VALVE OPEN • DEFLATING";


    setMessage(

        "Pressure Redistribution Active",

        "Exhaust valve opened. Cell "
        + cellNumber
        + " is deflating."

    );


    cell.classList.add(
        "deflated"
    );


    const deflated =
        await animatePressure(
            cellNumber,
            pressureValues[cellNumber - 1],
            8.4,
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

    state.textContent =
        "DEFLATED • VALVE CLOSED";


    state.classList.remove(
        "warning"
    );


    card.classList.remove(
        "active"
    );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.remove(
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
        function(resolve) {

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
                        (currentTime - startTime)
                        / duration,
                        1
                    );


                /*
                   General upward trend
                */

                const trend =
                    startValue +
                    (endValue - startValue)
                    * progress;


                /*
                   Small simulated variation.

                   It decreases near the end so
                   the final value remains stable.
                */

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
// GENERAL PRESSURE ANIMATION
// ==========================================

function animatePressure(
    cellNumber,
    startValue,
    endValue,
    duration,
    sequence
) {

    return new Promise(
        function(resolve) {

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
                        (currentTime - startTime)
                        / duration,
                        1
                    );


                const smoothProgress =
                    progress *
                    progress *
                    (3 - 2 * progress);


                const value =
                    startValue +
                    (endValue - startValue)
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
                        animate
                    );

                } else {

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


    if (
        value >= ELEVATED_THRESHOLD &&
        value < WARNING_THRESHOLD
    ) {

        state.textContent =
            "ELEVATED";

        state.classList.add(
            "elevated"
        );


        setMonitor(
            "elevated",
            "ELEVATED"
        );

    }


    if (
        value >= WARNING_THRESHOLD
    ) {

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

function reinflateCell(
    cellNumber
) {

    const cell =
        document.getElementById(
            "cell" + cellNumber
        );

    const state =
        document.getElementById(
            "state" + cellNumber
        );


    state.classList.remove(
        "warning"
    );

    state.classList.remove(
        "elevated"
    );


    state.textContent =
        "VALVE CLOSED • INFLATING";


    cell.classList.remove(
        "deflated"
    );


    document
        .getElementById(
            "readingCard" + cellNumber
        )
        .classList.remove(
            "active"
        );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.remove(
            "high"
        );


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
                (currentTime - startTime)
                / INFLATION_TIME,
                1
            );


        const value =
            startingValue +
            (BASE_PRESSURE - startingValue)
            * progress;


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

        } else {

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


    document
        .getElementById(
            "pressure" + cellNumber
        )
        .textContent =
        displayValue + " mmHg";


    const percentage =
        Math.min(
            (value / 50) * 100,
            100
        );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .style.width =
        percentage + "%";


    if (
        cellNumber === activeCell
    ) {

        document
            .getElementById(
                "mainPressure"
            )
            .textContent =
            displayValue + " mmHg";

    }

}


// ==========================================
// NORMAL SENSOR FLUCTUATION
// ==========================================

function updateIdleSensors() {

    for (
        let cellNumber = 1;
        cellNumber <= 4;
        cellNumber++
    ) {

        /*
           Do not interfere with the
           currently active sensor.
        */

        if (
            cellNumber === activeCell
        ) {
            continue;
        }


        const state =
            document.getElementById(
                "state" + cellNumber
            );


        /*
           Do not interfere while a previous
           cell is visibly reinflating.
        */

        if (
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


        /*
           Move gradually rather than
           instantly jumping.
        */

        pressureValues[
            cellNumber - 1
        ] +=
            (
                target -
                pressureValues[
                    cellNumber - 1
                ]
            ) * 0.35;


        updatePressure(
            cellNumber,
            pressureValues[
                cellNumber - 1
            ]
        );

    }

}


// Update idle sensors roughly twice per second.

setInterval(
    updateIdleSensors,
    500
);


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

    document
        .getElementById(
            "warningTitle"
        )
        .textContent =
        title;


    document
        .getElementById(
            "warningMessage"
        )
        .textContent =
        message;

}


// ==========================================
// TIMER
// ==========================================

function wait(milliseconds) {

    return new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}
