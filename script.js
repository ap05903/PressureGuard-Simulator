// ==========================================
// PRESSUREGUARD SIMULATOR
// SIMULATED DEMONSTRATION DATA
// ==========================================

const BASE_PRESSURE = 12;
const WARNING_THRESHOLD = 35;

const PRESSURE_RISE_TIME = 4000;
const WARNING_PAUSE_TIME = 1200;
const DEFLATION_TIME = 3500;
const INFLATION_TIME = 3500;


// Current selected cell

let activeCell = null;


// Current simulated values

let pressureValues = [
    BASE_PRESSURE,
    BASE_PRESSURE,
    BASE_PRESSURE,
    BASE_PRESSURE
];


// Used to cancel an old event when
// another cell is selected.

let sequenceNumber = 0;


// ==========================================
// BUTTONS
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
// KEYBOARD
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "1" ||
            event.key === "2" ||
            event.key === "3" ||
            event.key === "4"
        ) {

            triggerPressure(
                Number(event.key)
            );

        }

    }
);


// ==========================================
// MAIN SEQUENCE
// ==========================================

async function triggerPressure(cellNumber) {

    sequenceNumber++;

    const mySequence =
        sequenceNumber;

    const previousCell =
        activeCell;


    // Do nothing if the same active
    // cell is selected again.

    if (
        previousCell === cellNumber
    ) {
        return;
    }


    activeCell =
        cellNumber;


    // --------------------------------------
    // REINFLATE PREVIOUS CELL
    // --------------------------------------

    if (previousCell !== null) {

        reinflateCell(
            previousCell
        );

    }


    // --------------------------------------
    // RESET CELLS THAT ARE NOT INVOLVED
    // --------------------------------------

    for (let i = 1; i <= 4; i++) {

        if (
            i !== cellNumber &&
            i !== previousCell
        ) {

            resetCell(i);

        }

    }


    // --------------------------------------
    // NEW CELL STARTS NORMAL
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

    state.textContent =
        "PRESSURE RISING";

    card.classList.add(
        "active"
    );


    // Start selected cell from baseline.

    pressureValues[
        cellNumber - 1
    ] = BASE_PRESSURE;


    updatePressure(
        cellNumber,
        BASE_PRESSURE
    );


    // --------------------------------------
    // MONITOR
    // --------------------------------------

    setMonitor(
        "rising",
        "PRESSURE RISING"
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


    setMessage(
        "Monitoring Cell " + cellNumber,
        "Simulated pressure is increasing."
    );


    // ======================================
    // RISE FROM 12 TO 38 mmHg
    // ======================================

    const riseCompleted =
        await animatePressure(
            cellNumber,
            BASE_PRESSURE,
            38,
            PRESSURE_RISE_TIME,
            mySequence
        );


    if (
        !riseCompleted ||
        mySequence !== sequenceNumber
    ) {
        return;
    }


    // ======================================
    // WARNING
    // ======================================

    setMonitor(
        "danger",
        "⚠ THRESHOLD EXCEEDED"
    );


    state.textContent =
        "HIGH PRESSURE";


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

        "Simulated pressure has exceeded "
        + WARNING_THRESHOLD
        + " mmHg. Pressure redistribution activated."

    );


    // Let judges see warning

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
        "DEFLATING";


    setMessage(

        "Redistributing Pressure",

        "Cell "
        + cellNumber
        + " is slowly deflating while "
        + "the other cells remain inflated."

    );


    // CSS performs physical shrinking.

    cell.classList.add(
        "deflated"
    );


    // Reading falls simultaneously.

    const deflationCompleted =
        await animatePressure(
            cellNumber,
            38,
            8,
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

    state.textContent =
        "DEFLATED";


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

        "Cell "
        + cellNumber
        + " has deflated. Select another "
        + "cell to simulate a new "
        + "high-pressure area."

    );

}


// ==========================================
// ANIMATE PRESSURE
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


            function animate(
                currentTime
            ) {

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
                        ) / duration,
                        1
                    );


                const value =
                    startValue +
                    (
                        endValue -
                        startValue
                    ) * progress;


                pressureValues[
                    cellNumber - 1
                ] = value;


                updatePressure(
                    cellNumber,
                    value
                );


                if (
                    progress < 1
                ) {

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


    state.textContent =
        "INFLATING";


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
                (
                    currentTime -
                    startTime
                ) / INFLATION_TIME,
                1
            );


        const value =
            startingValue +
            (
                BASE_PRESSURE -
                startingValue
            ) * progress;


        pressureValues[
            cellNumber - 1
        ] = value;


        updatePressure(
            cellNumber,
            value
        );


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                animateInflation
            );

        } else {

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
// RESET CELL
// ==========================================

function resetCell(
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


    cell.classList.remove(
        "deflated"
    );


    state.classList.remove(
        "warning"
    );


    state.textContent =
        "INFLATED";


    pressureValues[
        cellNumber - 1
    ] = BASE_PRESSURE;


    updatePressure(
        cellNumber,
        BASE_PRESSURE
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

}


// ==========================================
// UPDATE PRESSURE DISPLAY
// ==========================================

function updatePressure(
    cellNumber,
    value
) {

    const rounded =
        Math.round(value);


    // Sensor number

    document
        .getElementById(
            "pressure" + cellNumber
        )
        .textContent =
        rounded + " mmHg";


    // Pressure bar
    // 50 mmHg fills entire visual bar.

    const percentage =
        Math.min(
            (rounded / 50) * 100,
            100
        );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .style.width =
        percentage + "%";


    // Large monitor number

    if (
        cellNumber === activeCell
    ) {

        document
            .getElementById(
                "mainPressure"
            )
            .textContent =
            rounded + " mmHg";

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

function wait(
    milliseconds
) {

    return new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}
