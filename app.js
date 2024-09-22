document.getElementById('generate').addEventListener('click', function () {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    if (isNaN(floors) || isNaN(lifts)) {
        alert("Please enter valid numbers for floors and lifts.");
        return;
    }
    const liftSystem = document.getElementById('lift-system');
    while (liftSystem.firstChild) {
        liftSystem.removeChild(liftSystem.firstChild); // Clear previous UI properly
    }

    // Initialize the lift data store
    initializeLifts(lifts);

    // Create UI for floors and buttons
    createFloorsUI(floors, lifts, liftSystem);

    // Attach event listeners to floor buttons
    attachButtonListeners();
});

// Lift Data Store
const liftDataStore = {
    lifts: [], // Stores the current state of each lift
    taskQueue: [], // Queue to handle multiple floor requests
};

// Initialize the lifts with their default positions (Ground floor)
function initializeLifts(lifts) {
    liftDataStore.lifts = []; // Reset lift data
    for (let i = 0; i < lifts; i++) {
        liftDataStore.lifts.push({
            id: i + 1,
            currentFloor: 0, // Starting at Ground Floor
            isMoving: false, // Indicates whether the lift is in transit
            targetFloor: null // Holds the target floor of the lift
        });
    }
}

// Create the floors UI
function createFloorsUI(floors, lifts, liftSystem) {
    for (let i = 0; i < floors; i++) { 
        let floorDiv = createFloorDiv(i, floors - 1); // Create a floor box

        // Add lift containers to the Ground Floor
        if (i === 0) {
            let liftContainer = createLiftContainer((floors === 1) ? 1 : lifts);
            floorDiv.appendChild(liftContainer);
        }

        liftSystem.appendChild(floorDiv);
    }
}

// Create a single floor UI
function createFloorDiv(floorNumber, totalFloors) {
    let floorDiv = document.createElement('div');
    floorDiv.classList.add('flex', 'items-center', 'border', 'border-black', 'p-4', 'mb-4', 'relative', 'floor-div');

    // Add the background floor label
    let floorLabel = createFloorLabel(floorNumber);
    floorDiv.appendChild(floorLabel);

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('floor-button-container', 'relative', 'z-40'); // Ensure buttons are on top of the label

    if (floorNumber === 0) {
        buttonContainer.appendChild(createUpButton(floorNumber));
    } else if (floorNumber === totalFloors) {
        buttonContainer.appendChild(createDownButton(floorNumber));
    } else {
        buttonContainer.appendChild(createUpButton(floorNumber));
        buttonContainer.appendChild(createDownButton(floorNumber));
    }

    floorDiv.appendChild(buttonContainer);
    return floorDiv;
}

// Create a label for the floor
function createFloorLabel(floorNumber) {
    let floorLabel = document.createElement('div');
    floorLabel.classList.add('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'text-gray-700', 'font-bold', 'z-0', 'opacity-20', 'sm:text-1xl', 'md:text-3xl');
    floorLabel.innerText = `Floor ${floorNumber}`;
    return floorLabel;
}

// Create an 'Up' button
function createUpButton(floor) {
    let upButton = document.createElement('button');
    upButton.classList.add('bg-green-500', 'lift-button', 'up-button');
    upButton.dataset.floor = floor;

    let upIcon = document.createElement('img');
    upIcon.src = './up-arrow.png'; // Set the path to your PNG file
    upIcon.alt = 'Up';
    upIcon.classList.add('h-2', 'w-2', 'md:h-2', 'md:w-2');

    upButton.appendChild(upIcon);
    return upButton;
}

// Create a 'Down' button
function createDownButton(floor) {
    let downButton = document.createElement('button');
    downButton.classList.add('bg-red-500', 'lift-button', 'down-button');
    downButton.dataset.floor = floor;

    let downIcon = document.createElement('img');
    downIcon.src = './down-arrow.png'; // Set the path to your PNG file
    downIcon.alt = 'Down';
    downIcon.classList.add('h-2', 'w-2', 'md:h-2', 'md:w-2');

    downButton.appendChild(downIcon);
    return downButton;
}

// Create the lift container for the Ground floor
function createLiftContainer(lifts) {
    let liftContainer = document.createElement('div');
    liftContainer.classList.add('relative', 'lift-container');

    for (let j = 0; j < lifts; j++) {
        let liftDiv = createLiftDiv(j + 1);
        liftContainer.appendChild(liftDiv);
    }
    return liftContainer;
}

// Create an individual lift UI
function createLiftDiv(id) {
    let liftDiv = document.createElement('div');
    liftDiv.classList.add('w-12', 'bg-gray-400', 'flex', 'items-center', 'justify-center', 'lift', 'mx-2'); // Added mx-2 for spacing
    liftDiv.dataset.id = id;
    liftDiv.dataset.currentFloor = 0;

    let leftDoor = document.createElement('div');
    leftDoor.classList.add('left-door', 'door');
    liftDiv.appendChild(leftDoor);

    let rightDoor = document.createElement('div');
    rightDoor.classList.add('right-door', 'door');
    liftDiv.appendChild(rightDoor);

    return liftDiv;
}

// Attach event listeners to buttons
function attachButtonListeners() {
    document.querySelectorAll('.up-button, .down-button').forEach(button => {
        button.addEventListener('click', function () {
            const floor = parseInt(this.dataset.floor);
            const direction = this.classList.contains('up-button') ? 'up' : 'down'; // Determine direction
            handleFloorRequest(floor, this, direction);
        });
    });
}

// Handle the floor request when a button is clicked
function handleFloorRequest(floor, button, direction) {
    button.classList.add('bg-gray-500');
    button.disabled = true;

    liftDataStore.taskQueue.push({ floor, direction, button });

    processNextTask(); // Ensure task processing starts
}

// Process the next task in the queue
function processNextTask() {
    if (liftDataStore.taskQueue.length === 0) return;

    liftDataStore.lifts.forEach(lift => {
        if (!lift.isMoving && liftDataStore.taskQueue.length > 0) {
            const nextTask = liftDataStore.taskQueue.shift();
            const { floor, button, direction } = nextTask;

            moveLift(lift, floor, button, direction);
        }
    });
}

// Move the lift to the target floor
function moveLift(lift, targetFloor, button, direction) {
    if (lift.isMoving) return;

    lift.isMoving = true;
    lift.targetFloor = targetFloor;

    const floorElement = document.querySelector('.floor-div');
    let floorHeight = floorElement ? floorElement.getBoundingClientRect().height : 120; // Default to 120px if not found
    const distance = Math.abs(lift.currentFloor - targetFloor);
    const travelTime = distance * 2000; // 2 seconds per floor

    const liftElement = document.querySelector(`.lift[data-id="${lift.id}"]`);
    liftElement.style.transition = `transform ${travelTime}ms linear`;
    liftElement.style.transform = `translateY(-${(targetFloor * (floorHeight + 16))}px)`; // Adjust to layout

    setTimeout(() => {
        lift.currentFloor = targetFloor;
        openLiftDoors(liftElement, () => {
            setTimeout(() => {
                closeLiftDoors(liftElement, () => {
                    lift.isMoving = false;
                    button.classList.remove('bg-gray-500');
                    button.disabled = false;
                    lift.targetFloor = null;

                    processNextTask(); // Continue with the next task in the queue
                });
            }, 2500); // Keep doors open for 2.5 seconds
        });
    }, travelTime);
}

// Open the lift doors
function openLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');

    leftDoor.style.transition = 'transform 2.5s';
    rightDoor.style.transition = 'transform 2.5s';

    leftDoor.style.transform = 'translateX(-100%)';
    rightDoor.style.transform = 'translateX(100%)';

    setTimeout(() => {
        if (callback) callback();
    }, 2500);
}

// Close the lift doors
function closeLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');

    leftDoor.style.transform = 'translateX(0)';
    rightDoor.style.transform = 'translateX(0)';

    setTimeout(() => {
        if (callback) callback();
    }, 2500);
}
