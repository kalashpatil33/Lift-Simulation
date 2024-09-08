document.getElementById('generate').addEventListener('click', function () {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);

    const liftSystem = document.getElementById('lift-system');
    liftSystem.innerHTML = ''; // Clear previous UI

    // Initialize the data store for lifts
    initializeLifts(lifts);

    // Create floors and buttons
    for (let i = 0; i <= floors; i++) {
        let floorDiv = document.createElement('div');
        floorDiv.classList.add('flex', 'items-center', 'border', 'border-black', 'p-4', 'mb-4', 'relative', 'h-16', 'w-full');

        // Floor label
        let floorLabel = document.createElement('div');
        floorLabel.classList.add('mr-6', 'w-32', 'text-right');
        floorLabel.innerText = i === 0 ? 'Ground Floor' : `Floor ${i}`;
        floorDiv.appendChild(floorLabel);

        // Add buttons for each floor (except Ground and Top floors)
        if (i > 0 && i < floors) {
            let buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'flex-col', 'mr-6');

            let upButton = document.createElement('button');
            upButton.classList.add('bg-green-500', 'text-white', 'px-2', 'py-1', 'mb-2', 'rounded', 'up-button');
            upButton.dataset.floor = i;
            upButton.innerText = 'Up';
            buttonContainer.appendChild(upButton);

            let downButton = document.createElement('button');
            downButton.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded', 'down-button');
            downButton.dataset.floor = i;
            downButton.innerText = 'Down';
            buttonContainer.appendChild(downButton);

            floorDiv.appendChild(buttonContainer);
        } else if (i === 0) { // Ground floor (only up button)
            let buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'flex-col', 'mr-6');

            let upButton = document.createElement('button');
            upButton.classList.add('bg-green-500', 'text-white', 'px-2', 'py-1', 'rounded', 'up-button');
            upButton.dataset.floor = i;
            upButton.innerText = 'Up';
            buttonContainer.appendChild(upButton);

            floorDiv.appendChild(buttonContainer);
        } else if (i === floors) { // Top floor (only down button)
            let buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'flex-col', 'mr-6');

            let downButton = document.createElement('button');
            downButton.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded', 'down-button');
            downButton.dataset.floor = i;
            downButton.innerText = 'Down';
            buttonContainer.appendChild(downButton);

            floorDiv.appendChild(buttonContainer);
        }

        // Only on the ground floor (floor 0), place the lifts
        if (i === 0) {
            let liftContainer = document.createElement('div');
            liftContainer.classList.add('relative', 'right-0', 'top-0', 'left-2', 'flex', 'gap-4', 'p-2');

            for (let j = 0; j < lifts; j++) {
                let liftDiv = document.createElement('div');
                liftDiv.classList.add('w-12', 'h-12', 'bg-gray-400', 'flex', 'items-center', 'justify-center', 'relative', 'lift');
                liftDiv.dataset.id = j + 1; // Assign unique ID to each lift
                liftDiv.dataset.currentFloor = 0; // Initialize lift on ground floor
                
                // Add lift doors (for visual effect)
                let leftDoor = document.createElement('div');
                leftDoor.classList.add('left-door', 'door');
                liftDiv.appendChild(leftDoor);

                let rightDoor = document.createElement('div');
                rightDoor.classList.add('right-door', 'door');
                liftDiv.appendChild(rightDoor);

                // Add direction label
                let directionLabel = document.createElement('div');
                directionLabel.classList.add('direction-label');
                liftDiv.appendChild(directionLabel);

                liftContainer.appendChild(liftDiv);
            }

            floorDiv.appendChild(liftContainer);
        }

        liftSystem.appendChild(floorDiv);
    }

    // Event listeners for buttons
    document.querySelectorAll('.up-button, .down-button').forEach(button => {
        button.addEventListener('click', function() {
            const floor = parseInt(this.dataset.floor);
            handleFloorRequest(floor, this);
        });
    });
});

const liftDataStore = {
    lifts: [], // Array to store each lift's current state
    requests: {}, // Track button states
    taskQueue: [] // Queue to store floor requests
};

// Initialize lifts with their positions (all start at Ground Floor)
function initializeLifts(lifts) {
    liftDataStore.lifts = []; // Reset lift data
    for (let i = 0; i < lifts; i++) {
        liftDataStore.lifts.push({
            id: i + 1,
            currentFloor: 0, // Start at Ground Floor
            isMoving: false,
            targetFloor: null,
            label: null // Add a label for each lift
        });
    }
}

// Function to handle floor requests
function handleFloorRequest(targetFloor, button) {
    // Disable button
    button.classList.add('bg-gray-500'); // Add class to indicate disabled state
    button.disabled = true; // Ensure button is disabled
    liftDataStore.requests[targetFloor] = button;

    // Add the request to the queue
    liftDataStore.taskQueue.push(targetFloor);

    // Process the next task from the queue
    processNextTask();
}

// Function to process the next task from the queue
function processNextTask() {
    // Find the next task in the queue
    const nextFloor = liftDataStore.taskQueue.shift(); // Remove the first item from the queue

    if (nextFloor === undefined) return; // No more tasks

    // Find the nearest available lift
    const availableLift = findNearestAvailableLift(nextFloor);
    
    if (availableLift !== null) {
        moveLift(availableLift, nextFloor, liftDataStore.requests[nextFloor]);
    }
}

// Function to find the nearest available lift
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

// Function to move the lift to the target floor
function moveLift(lift, targetFloor, button) {
    if (lift.isMoving) return; // Prevent moving if already moving

    // Check if another lift is already handling this target floor
    const otherLifts = liftDataStore.lifts.filter(l => l.isMoving && l.targetFloor === targetFloor);
    if (otherLifts.length > 0) {
        // Another lift is already handling this target floor
        // Re-add the request to the queue for future processing
        liftDataStore.taskQueue.push(targetFloor);
        return;
    }

    lift.isMoving = true;
    lift.targetFloor = targetFloor; // Set the target floor
    const distance = Math.abs(lift.currentFloor - targetFloor);
    const travelTime = distance * 2000; // 2 seconds per floor
    const liftElement = document.querySelector(`.lift[data-id="${lift.id}"]`);
    
    // Calculate exact floor position
    const floorHeight = 80; // Replace with actual height of the floor in pixels
    const offset = 0; // Additional offset to align lift precisely

    // Move the lift (animate the lift movement)
    liftElement.style.transition = `transform ${travelTime}ms linear`;
    liftElement.style.transform = `translateY(-${(targetFloor * floorHeight) + offset}px)`;

    // After movement is completed
    setTimeout(() => {
        lift.currentFloor = targetFloor;

        // Open the lift doors
        openLiftDoors(liftElement, () => {
            // After doors are opened, set a timeout to close them
            setTimeout(() => {
                closeLiftDoors(liftElement, () => {
                    lift.isMoving = false;
                    lift.targetFloor = null; // Clear the target floor after finishing

                    // Re-enable the button
                    button.classList.remove('bg-gray-500'); // Remove disabled state class
                    button.disabled = false; // Enable button
                    delete liftDataStore.requests[targetFloor];

                    // Process remaining requests
                    processNextTask();
                });
            }, 2500); // Wait for doors to remain open before closing (2.5 seconds)
        });
    }, travelTime); // After lift reaches the target floor
}

// Function to open the lift doors
function openLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');

    leftDoor.classList.add('animate-door-open-left');
    rightDoor.classList.add('animate-door-open-right');

    // Callback to execute after doors are fully opened
    setTimeout(() => {
        leftDoor.classList.remove('animate-door-open-left');
        rightDoor.classList.remove('animate-door-open-right');
        callback(); // Proceed to closing doors
    }, 2500); // 2.5 seconds for opening
}

// Function to close the lift doors
function closeLiftDoors(liftElement, callback) {
    const leftDoor = liftElement.querySelector('.left-door');
    const rightDoor = liftElement.querySelector('.right-door');

    leftDoor.classList.add('animate-door-close-left');
    rightDoor.classList.add('animate-door-close-right');

    // Callback to execute after doors are fully closed
    setTimeout(() => {
        leftDoor.classList.remove('animate-door-close-left');
        rightDoor.classList.remove('animate-door-close-right');
        callback(); // Complete the lift operation
    }, 2500); // 2.5 seconds for closing
}
