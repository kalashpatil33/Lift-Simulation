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
    requests: {}, // Track requests (button press)
    taskQueue: [] // Queue to handle multiple floor requests
};

// Initialize the lifts with their default positions (Ground floor)
function initializeLifts(lifts) {
    liftDataStore.lifts = []; // Reset lift data
    for (let i = 0; i < lifts; i++) {
        liftDataStore.lifts.push({
            id: i + 1,
            currentFloor: 0, // Starting at Ground Floor
            isMoving: false,
            targetFloor: null
        });
    }
}

// Create the floors UI
function createFloorsUI(floors, lifts, liftSystem) {
    for (let i = 0; i <= floors; i++) {
        let floorDiv = createFloorDiv(i, floors);

        // Add lift containers to the Ground Floor
        if (i === 0) {
            let liftContainer = createLiftContainer(lifts);
            floorDiv.appendChild(liftContainer);
        }

        liftSystem.appendChild(floorDiv);
    }
}
// Create a single floor UI
function createFloorDiv(floorNumber, totalFloors) {
    let floorDiv = document.createElement('div');
    // Use relative positioning for the floor div to properly position child elements
    floorDiv.classList.add('flex', 'items-center', 'border', 'border-black', 'p-4', 'mb-4', 'relative', 'h-16', 'w-full', 'sm:h-16', 'md:h-16');

    // Add the background floor label
    let floorLabel = createFloorLabel(floorNumber);
    floorDiv.appendChild(floorLabel);

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('floor-button-container', 'relative', 'z-10'); // Ensure buttons are on top of the label

    if (floorNumber === 0) {
        buttonContainer.appendChild(createUpButton(floorNumber));
    } else if (floorNumber === totalFloors) {
        buttonContainer.appendChild(createDownButton(floorNumber));
    } else {
        buttonContainer.appendChild(createUpButton(floorNumber));
        buttonContainer.appendChild(createDownButton(floorNumber));
    }

    // Use Tailwind's responsive flex classes to make the layout responsive
    // buttonContainer.classList.add('flex', 'flex-col', 'items-center', 'sm:flex-row', 'sm:space-x-2', );

    // Append button container after the label
    floorDiv.appendChild(buttonContainer);

    return floorDiv;
}

// Create a label for the floor
function createFloorLabel(floorNumber) {
    let floorLabel = document.createElement('div');
    // Center the label in the middle of the floor div, behind the content
    floorLabel.classList.add('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'text-gray-700', 'text-3xl', 'font-bold', 'z-0', 'opacity-20', 'sm:text-1xl', 'md:text-3xl');
    floorLabel.innerText = floorNumber === 0 ? 'Ground Floor' : `Floor ${floorNumber}`;
    return floorLabel;
}


// Create an 'Up' button
function createUpButton(floor) {
    let upButton = document.createElement('button');
    upButton.classList.add('bg-green-500', 'text-white', 'px-1', 'py-1', 'rounded', 'up-button', 'sm:px-1.5', 'md:px-4', 'py-1.5');
    upButton.dataset.floor = floor;

    // Create an image element for the "up" icon
    let upIcon = document.createElement('img');
    upIcon.src = './up-arrow.png'; // Set the path to your PNG file
    upIcon.alt = 'Up';
    upIcon.classList.add('h-2', 'w-2', 'md:h-2', 'md:w-2'); // Adjust the size of the image

    // Append the image to the button
    upButton.appendChild(upIcon);

    return upButton;
}



// Create a 'Down' button
function createDownButton(floor) {
    let downButton = document.createElement('button');
    downButton.classList.add('bg-red-500', 'text-white', 'px-1', 'py-1', 'rounded', 'down-button', 'sm:px-1.5', 'md:px-4', 'py-1.5');
    downButton.dataset.floor = floor;
    // Create an image element for the "up" icon
    let downIcon = document.createElement('img');
    downIcon.src = './down-arrow.png'; // Set the path to your PNG file
    downIcon.alt = 'Down';
    downIcon.classList.add('h-2', 'w-2', 'md:h-2', 'md:w-2'); // Adjust the size of the image

    // Append the image to the button
    downButton.appendChild(downIcon);
    return downButton;
}


// Create the lift container for the Ground floor
function createLiftContainer(lifts) {
    let liftContainer = document.createElement('div');
    liftContainer.classList.add('relative', 'flex', 'gap-4', 'p-2');

    for (let j = 0; j < lifts; j++) {
        let liftDiv = createLiftDiv(j + 1);
        liftContainer.appendChild(liftDiv);
    }

    return liftContainer;
}

// Create an individual lift UI
function createLiftDiv(id) {
    let liftDiv = document.createElement('div');
    liftDiv.classList.add('w-12', 'h-12', 'bg-gray-400', 'flex', 'items-center', 'justify-center', 'lift');
    liftDiv.dataset.id = id;
    liftDiv.dataset.currentFloor = 0;

    // Add doors for visual effect
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
            handleFloorRequest(floor, this);
        });
    });
}

// Handle the floor request when a button is clicked
function handleFloorRequest(floor, button) {
    button.classList.add('bg-gray-500');
    button.disabled = true;
    liftDataStore.requests[floor] = button;
    liftDataStore.taskQueue.push(floor);
    processNextTask();
}

// Process the next task in the queue
function processNextTask() {
    const nextFloor = liftDataStore.taskQueue.shift();
    if (nextFloor === undefined) return;

    const availableLift = findNearestAvailableLift(nextFloor);
    if (availableLift !== null) {
        moveLift(availableLift, nextFloor, liftDataStore.requests[nextFloor]);
    }
}

// Find the nearest available lift
function findNearestAvailableLift(targetFloor) {
    let nearestLift = null;
    let minDistance = Infinity;

    liftDataStore.lifts.forEach(lift => {
        if (!lift.isMoving) {
            const distance = Math.abs(lift.currentFloor - targetFloor);
            if (distance < minDistance) {
                nearestLift = lift;
                minDistance = distance;
            }
        }
    });

    return nearestLift;
}

// Move the lift to the target floor
function moveLift(lift, targetFloor, button) {
    if (lift.isMoving) return;

    lift.isMoving = true;
    lift.targetFloor = targetFloor;
    const distance = Math.abs(lift.currentFloor - targetFloor);
    const travelTime = distance * 2000; // 2 seconds per floor
    const liftElement = document.querySelector(`.lift[data-id="${lift.id}"]`);

    // Set up animation
    const floorHeight = 80;
    liftElement.style.transition = `transform ${travelTime}ms linear`;
    liftElement.style.transform = `translateY(-${targetFloor * floorHeight}px)`;

    setTimeout(() => {
        lift.currentFloor = targetFloor;
        openLiftDoors(liftElement, () => {
            setTimeout(() => {
                closeLiftDoors(liftElement, () => {
                    lift.isMoving = false;
                    lift.targetFloor = null;
                    button.classList.remove('bg-gray-500');
                    button.disabled = false;
                    delete liftDataStore.requests[targetFloor];
                    processNextTask();
                });
            }, 2500); // 2.5 seconds for doors open
        });
    }, travelTime);
}

// Open the lift doors
function openLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');
    leftDoor.classList.add('animate-door-open-left');
    rightDoor.classList.add('animate-door-open-right');

    setTimeout(() => {
        leftDoor.classList.remove('animate-door-open-left');
        rightDoor.classList.remove('animate-door-open-right');
        callback();
    }, 2500);
}

// Close the lift doors
function closeLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');
    leftDoor.classList.add('animate-door-close-left');
    rightDoor.classList.add('animate-door-close-right');

    setTimeout(() => {
        leftDoor.classList.remove('animate-door-close-left');
        rightDoor.classList.remove('animate-door-close-right');
        callback();
    }, 2500);
}