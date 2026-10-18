// ==========================================
// PRESSUREGUARD SIMULATOR
// SIMULATED DATA ONLY
// ==========================================

// These values are for demonstration only.
// They are NOT measurements from the physical
// prototype and 35 mmHg is NOT being presented
// as a validated clinical threshold.

const BASE_PRESSURE = 12;
const DEMO_WARNING_THRESHOLD = 35;

// Animation speed
const PRESSURE_RISE_TIME = 4000; // 4 seconds
const WARNING_PAUSE = 1200;      // 1.2 seconds
const DEFLATE_TIME = 3500;        // 3.5 seconds
const INFLATE_TIME = 3500;        // 3.5 seconds

let activeCell = null;

let pressureValues = [
    BASE_PRESSURE,
    BASE_PRESSURE,
    BASE_PRESSURE,
    BASE_PRESSURE
];

// Used to cancel an old animation when
// another cell is selected.
let animationToken = 0;


// ==========================================
// BUTTON CONTROLS
// ==========================================

const buttons =
    document.querySelectorAll("[data-cell]");

buttons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const cellNumber =
                Number(button.dataset.cell);

            triggerPressure(cellNumber);
        }
    );

});


// ==========================================
// KEYBOARD CONTROLS
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
// MAIN PRESSURE EVENT
// ==========================================

async function triggerPressure(cellNumber) {

    // Cancel previous pressure-rise sequence
    animationToken++;

    const token = animationToken;

    const previousCell = activeCell;

    activeCell = cellNumber;


    // --------------------------------------
    // REINFLATE PREVIOUS CELL
    // --------------------------------------

    if (
        previousCell !== null &&
        previousCell !== cellNumber
    ) {

        inflateCell(previousCell);
    }


    // --------------------------------------
    // RESET OTHER CELLS
    // --------------------------------------

    for (let i = 1; i <= 4; i++) {

        if (
            i !== cellNumber &&
            i !== previousCell
        ) {

            setNormalCell(i);
        }
    }


    // --------------------------------------
    // SELECTED CELL:
    // PRESSURE BEGINS RISING
    // --------------------------------------

    const selectedCell =
        document.getElementById(
            "cell" + cellNumber
        );

    const selectedState =
        document.getElementById(
            "state" + cellNumber
        );

    const readingCard =
        document.getElementById(
            "readingCard" + cellNumber
        );


    // Make sure selected cell begins inflated

    selectedCell.classList.remove(
        "deflated"
    );

    selectedState.classList.remove(
        "warning"
    );

    selectedState.textContent =
        "PRESSURE RISING";

    readingCard.classList.add(
        "active"
    );


    // Monitor screen

    setMonitorStatus(
        "rising",
        "PRESSURE RISING"
    );

    document
        .getElementById("mainSensorLabel")
        .textContent =
        "SENSOR " + cellNumber;


    setWarningMessage(
        "Monitoring Cell " + cellNumber,
        "Simulated pressure is increasing."
    );


    // ======================================
    // PRESSURE RISE
    // ======================================

    const reachedThreshold =
        await animatePressure(
            cellNumber,
            pressureValues[cellNumber - 1],
            DEMO_WARNING_THRESHOLD + 3,
            PRESSURE_RISE_TIME,
            token
        );


    if (
        !reachedThreshold ||
        token !== animationToken
    ) {

        return;
    }


    // ======================================
    // WARNING
    // ======================================

    setMonitorStatus(
        "danger",
        "⚠ DEMO THRESHOLD EXCEEDED"
    );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.add("high");


    selectedState.textContent =
        "HIGH PRESSURE";


    selectedState.classList.add(
        "warning"
    );


    document
        .getElementById("warningBox")
        .classList.add("active");


    setWarningMessage(
        "⚠ Demo Threshold Exceeded — Cell "
        + cellNumber,

        "Simulated pressure has exceeded "
        + DEMO_WARNING_THRESHOLD
        + " mmHg. Automatic pressure "
        + "redistribution activated."
    );


    // Keep warning visible briefly

    await wait(WARNING_PAUSE);


    if (token !== animationToken) {
        return;
    }


    // ======================================
    // DEFLATION STARTS
    // ======================================

    selectedState.textContent =
        "DEFLATING";


    setWarningMessage(
        "Redistributing Pressure",

        "Cell "
        + cellNumber
        + " is slowly deflating while "
        + "the other cells remain inflated."
    );


    // This activates the 3.5-second
    // CSS shrinking animation.

    selectedCell.classList.add(
        "deflated"
    );


    // Simulated pressure falls while
    // the cell deflates.

    const finishedDeflation =
        await animatePressure(
            cellNumber,
            pressureValues[cellNumber - 1],
            8,
            DEFLATE_TIME,
            token
        );


    if (
        !finishedDeflation ||
        token !== animationToken
    ) {

        return;
    }


    // ======================================
    // PRESSURE RELIEVED
    // ======================================

    selectedState.textContent =
        "DEFLATED";


    readingCard.classList.remove(
        "active"
    );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.remove("high");


    setMonitorStatus(
        "normal",
        "PRESSURE RELIEVED"
    );


    setWarningMessage(
        "Pressure Relieved — Cell "
        + cellNumber,

        "The selected cell has deflated. "
        + "Select another cell to simulate "
        + "a new high-pressure area."
    );

}


// ==========================================
// ANIMATE PRESSURE VALUE
// ==========================================

function animatePressure(
    cellNumber,
    startValue,
    endValue,
    duration,
    token
) {

    return new Promise(function(resolve) {

        const startTime =
            performance.now();


        function animate(currentTime) {

            // Stop old animation if a
            // new cell was selected.

            if (token !== animationToken) {

                resolve(false);

                return;
            }


            const progress =
                Math.min(
                    (currentTime - startTime)
                    / duration,
                    1
                );


            const value =
                startValue +
                (endValue - startValue)
                * progress;


            pressureValues[
                cellNumber - 1
            ] = value;


            updatePressureDisplay(
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

    });

}


// ==========================================
// REINFLATE PREVIOUS CELL
// ==========================================

function inflateCell(cellNumber) {

    const cell =
        document.getElementById(
            "cell" + cellNumber
        );

    const state =
        document.getElementById(
            "state" + cellNumber
        );


    state.textContent =
        "INFLATING";


    state.classList.remove(
        "warning"
    );


    // Removing "deflated" makes CSS
    // slowly return the cell to full height.

    cell.classList.remove(
        "deflated"
    );


    document
        .getElementById(
            "readingCard" + cellNumber
        )
        .classList.remove("active");


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.remove("high");


    const startingPressure =
        pressureValues[
            cellNumber - 1
        ];


    const startTime =
        performance.now();


    function animateInflation(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime)
                / INFLATE_TIME,
                1
            );


        const value =
            startingPressure +
            (BASE_PRESSURE - startingPressure)
            * progress;


        pressureValues[
            cellNumber - 1
        ] = value;


        updatePressureDisplay(
            cellNumber,
            value
        );


        if (progress < 1) {

            requestAnimationFrame(
                animateInflation
            );

        } else {

            pressureValues[
                cellNumber - 1
            ] = BASE_PRESSURE;


            updatePressureDisplay(
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
// RESET NORMAL CELL
// ==========================================

function setNormalCell(cellNumber) {

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


    updatePressureDisplay(
        cellNumber,
        BASE_PRESSURE
    );


    document
        .getElementById(
            "readingCard" + cellNumber
        )
        .classList.remove("active");


    document
        .getElementById(
            "bar" + cellNumber
        )
        .classList.remove("high");

}


// ==========================================
// UPDATE PRESSURE SCREEN
// ==========================================

function updatePressureDisplay(
    cellNumber,
    value
) {

    const rounded =
        Math.round(value);


    // Individual sensor reading

    document
        .getElementById(
            "pressure" + cellNumber
        )
        .textContent =
        rounded + " mmHg";


    // Bar scale:
    // 50 mmHg = full visual bar

    const barPercentage =
        Math.min(
            (rounded / 50) * 100,
            100
        );


    document
        .getElementById(
            "bar" + cellNumber
        )
        .style.width =
        barPercentage + "%";


    // Large central reading

    if (cellNumber === activeCell) {

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

function setMonitorStatus(
    statusClass,
    text
) {

    const monitorStatus =
        document.getElementById(
            "monitorStatus"
        );


    monitorStatus.className =
        "monitor-status "
        + statusClass;


    monitorStatus.textContent =
        text;

}


// ==========================================
// WARNING BOX
// ==========================================

function setWarningMessage(
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
