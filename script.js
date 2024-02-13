// Define a global variable to track the number of attempts
var attempts = 3;
var wrongAttempts = 0;
var correctGuesses = 0;

document.addEventListener('DOMContentLoaded', function() {
    nextPhoto(); // Call nextPhoto function to display a random image
});

function displayImage(imagePath) {
    var imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = ""; // Clear previous image

    // Create image element
    var img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Image'; // Set alt attribute for accessibility

    // Append image to container
    imageContainer.appendChild(img);

    // Extract year, month, and photo number from the image path
    var year = extractYearFromImagePath(imagePath);
    var month = extractMonthFromImagePath(imagePath);
    var photoNumber = extractPhotoNumberFromImagePath(imagePath);

    // Display the date
    var dateElement = document.getElementById('imageDate');
    dateElement.textContent = getMonthName(month) + " " + year + " - Photo " + photoNumber;
}


// Function to extract the year from the image path
function extractYearFromImagePath(imagePath) {
    var yearIndex = imagePath.indexOf("images/") + "images/".length;
    return parseInt(imagePath.substring(yearIndex, yearIndex + 4));
}

// Function to extract the month from the image path
function extractMonthFromImagePath(imagePath) {
    var monthIndex = imagePath.indexOf("/", imagePath.indexOf("images/") + "images/".length + 1) + 1;
    var monthString = imagePath.substring(monthIndex, monthIndex + imagePath.substring(monthIndex).indexOf("/"));
    return getMonthIndex(monthString);
}

// Function to extract the photo number from the image path
function extractPhotoNumberFromImagePath(imagePath) {
    var startIndex = imagePath.lastIndexOf("_") + 1;
    var endIndex = imagePath.lastIndexOf(".");
    return parseInt(imagePath.substring(startIndex, endIndex));
}

// Function to convert month name to its index (1-12)
function getMonthIndex(monthName) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
}

// Function to get month name from its numeric value
function getMonthName(month) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
}

function checkGuess() {
    var slider = document.getElementById('timelineSlider');

    // Convert slider value to month and year
    var year = Math.floor(slider.value / 12) + 2020;
    var monthIndex = slider.value % 12; // Month index (0-11)
    var month = getMonthName(monthIndex + 1); // Get month name from index

    // Get the currently displayed image path
    var imagePath = document.getElementById('imageContainer').querySelector('img').src;

    // Extract year and month from the image path
    var photoYear = extractYearFromImagePath(imagePath);
    var photoMonth = extractMonthFromImagePath(imagePath);

    // Check if the guess is correct
    var resultElement = document.getElementById('result');
    if (month.toLowerCase() === getMonthName(photoMonth).toLowerCase() && year === photoYear) {
        resultElement.textContent = "Correct!";
        correctGuesses++;
        displayCorrectGuesses();
    } else {
        resultElement.textContent = "Wrong!";
        wrongAttempts++; // Increment wrong attempts
        displayAttempts(); // Update circles display
        
        // Disable the Check button after 3 wrong attempts
        if (wrongAttempts >= 3) {
            document.getElementById('checkButton').disabled = true;
            resultElement.textContent = "Wrong, the correct date is: " + getMonthName(photoMonth) + " " + photoYear;
        } else {
            resultElement.textContent = "Wrong!";
        }
    }
}

function displayCorrectGuesses() {
    var correctGuessesElement = document.getElementById('correctGuesses');
    correctGuessesElement.textContent = "Correct Guesses: " + correctGuesses;
}


function updateSliderValue() {
    var slider = document.getElementById('timelineSlider');
    var sliderValue = document.getElementById('sliderValue');

    var year = Math.floor(slider.value / 12) + 2020;
    var month = slider.value % 12 + 1;

    sliderValue.textContent = month + "/" + year;
}

async function nextPhoto() {
    // Reset the attempt counter
    attempts = 3; // Reset attempts to 3

    // Reset wrong attempts
    wrongAttempts = 0;

    // Re-enable the Check button
    document.getElementById('checkButton').disabled = false;

    var imagePath;

    // Clear the result text content
    var resultElement = document.getElementById('result');
    resultElement.textContent = "";

    do {
        // Generate a random year between 2020 and 2024
        var randomYear = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;
        // Generate a random month index between 0 and 11
        var randomMonthIndex = Math.floor(Math.random() * 12);
        // Get the month name from the random month index
        var randomMonth = getMonthName(randomMonthIndex + 1);
        // Get the number of photos in the selected month
        var numPhotosInMonth = await getNumPhotosInMonth(randomYear, randomMonth);
        // Generate a random photo number between 1 and the number of photos in the selected month
        var randomPhotoNumber = Math.floor(Math.random() * numPhotosInMonth) + 1;
        // Construct the path for the random image
        imagePath = "images/" + randomYear + "/" + randomMonth + "/" + randomMonth.toUpperCase() + "_" + randomYear + "_" + randomPhotoNumber + ".jpg";
    } while (!(await isValidImagePath(imagePath))); // Check if the generated imagePath is valid

    // Display the random image
    displayImage(imagePath);

    // Update the attempts display after resetting attempts
    displayAttempts();
}



function getNumPhotosInMonth(year, monthName) {
    // Return a Promise to handle the asynchronous operation
    return new Promise((resolve, reject) => {
        // Construct the path for the month
        var monthPath = "images/" + year + "/" + monthName + "/";
        // Assuming your photos follow the naming convention "MONTH_YYYY_X.jpg"
        // Count the number of images in the folder
        var numPhotos = 0;
        var i = 1;
        // Recursive function to check image existence synchronously
        function checkImageExistence() {
            var imagePath = monthPath + monthName.toUpperCase() + "_" + year + "_" + i + ".jpg";
            // Make a HEAD request to check if the image exists
            fetch(imagePath, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        numPhotos++;
                        i++;
                        checkImageExistence(); // Continue checking for the next image
                    } else {
                        resolve(numPhotos); // Resolve the Promise with the total number of photos
                    }
                })
                .catch(error => {
                    console.error('Error checking image path:', error);
                    resolve(numPhotos); // Resolve the Promise with the total number of photos in case of an error
                });
        }
        // Start checking for image existence
        checkImageExistence();
    });
}


function isValidImagePath(imagePath) {
    return new Promise((resolve, reject) => {
        // Create a new image element
        var img = new Image();
        // Set the source of the image
        img.src = imagePath;
        // Set up event listeners to check if the image exists
        img.onload = function() {
            resolve(true); // Image exists
        };
        img.onerror = function() {
            resolve(false); // Image does not exist
        };
    });
}

function displayAttempts() {
    var attemptsElement = document.getElementById('attempts');
    attemptsElement.innerHTML = ''; // Clear previous circles

    // Add filled circles for remaining attempts
    for (var i = 0; i < attempts - wrongAttempts; i++) {
        var filledCircle = document.createElement('span');
        filledCircle.className = 'circle filled-circle';
        attemptsElement.appendChild(filledCircle);
    }

    // Add outlined circles for wrong attempts
    for (var j = 0; j < wrongAttempts; j++) {
        var outlinedCircle = document.createElement('span');
        outlinedCircle.className = 'circle outlined-circle';
        attemptsElement.appendChild(outlinedCircle);
    }
}

