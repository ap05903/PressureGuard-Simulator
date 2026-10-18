// ==========================================
// PRESSUREGUARD SIMULATOR
// ==========================================

// Keeps track of the cell currently experiencing
// simulated high pressure.
let activeCell = null;


// ==========================================
// HIGH-PRESSURE RESPONSE
// ==========================================

function triggerPressure(cellNumber) {

    // --------------------------------------
    // 1. RESET ALL CELLS
    // --------------------------------------
    // This reinflates the previously
    // deflated cell.

    for (let i = 1; i <= 4; i++) {

        const cell =
            document.getElementById("cell" + i);

        const state =
            document.getElementById("state" + i);


        cell.classList.remove("deflated");

        state.classList.remove("warning");

        state.textContent = "INFLATED";
    }


    // --------------------------------------
    // 2. SELECT NEW HIGH-PRESSURE CELL
    // --------------------------------------

    const selectedCell =
        document.getElementById(
            "cell" + cellNumber
        );

    const selectedState =
        document.getElementById(
            "state" + cellNumber
        );


    // --------------------------------------
    // 3. DEFLATE SELECTED CELL
    // --------------------------------------

    selectedCell.classList.add(
        "deflated"
    );

    selectedState.classList.add(
        "warning"
    );

    selectedState.textContent =
        "DEFLATING";


    activeCell = cellNumber;


    // --------------------------------------
    // 4. DISPLAY WARNING
    // --------------------------------------

    const warningBox =
        document.getElementById(
            "warningBox"
        );

    const warningTitle =
        document.getElementById(
            "warningTitle"
        );

    const warningMessage =
        document.getElementById(
            "warningMessage"
        );


    warningBox.classList.add(
        "active"
    );


    warningTitle.textContent =
        "⚠ HIGH PRESSURE DETECTED — CELL "
        + cellNumber;


    warningMessage.textContent =
        "Pressure redistribution activated. "
        + "Cell "
        + cellNumber
        + " is deflating while the other "
        + "cells remain inflated.";
}


// ==========================================
// BUTTON CONTROLS
// ==========================================

const buttons =
    document.querySelectorAll(
        "[data-cell]"
    );


buttons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const cellNumber =
                Number(
                    button.dataset.cell
                );

            triggerPressure(
                cellNumber
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
