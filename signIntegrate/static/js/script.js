const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const playAudioBtn = document.getElementById('play-audio-btn');
const detectedSign = document.getElementById('detected-sign');
const outputText = document.getElementById('detected-string');

// Make sure DOM is loaded before accessing elements
document.addEventListener("DOMContentLoaded", function() {
    const clearBtn = document.getElementById('clear-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const spaceBtn = document.getElementById('space-btn');

    // Clear button
    clearBtn.addEventListener('click', () => {
        outputText.textContent = 'Waiting for input...';
    });

    // Delete button
    deleteBtn.addEventListener('click', () => {
        const currentString = outputText.textContent.trim();
        outputText.textContent = currentString.slice(0, -1) || 'Waiting for input...';
    });

    // Space button
    spaceBtn.addEventListener('click', () => {
        const currentString = outputText.textContent.trim();
        if (currentString !== 'Waiting for input...') {
            outputText.textContent += ' ';
        }
    });
});

// Webcam access
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        setInterval(checkForSign, 1000);
    })
    .catch(err => {
        alert('Error accessing camera. Please enable access to proceed.');
        console.error('Error accessing camera: ', err);
    });

// Sign detection function
function checkForSign() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'gesture.png');

        fetch('/detect', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.letter) {
                detectedSign.textContent = `Detected Sign: ${data.letter}`;
                outputText.textContent += data.letter;
            } else {
                detectedSign.textContent = 'Detected Sign: Waiting...';
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

// Play detected string as audio
playAudioBtn.addEventListener('click', () => {
    const detectedText = outputText.textContent.trim();
    
    if (detectedText && detectedText !== 'Waiting for input...') {
        fetch('/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: detectedText })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const audio = new Audio(data.audio_url);
                audio.play();
            } else {
                console.error('Error playing audio:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

// Slideshow and Sign Gallery remain unchanged

// Sign language gallery functionality
document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById('sign-gallery');
    const searchBar = document.getElementById('search-bar');

    // Sample data for signs (replace with actual image URLs and names)
    const signs = [
        { name: "Sign A", image: "/static/images/A.png" },
        { name: "Sign B", image: "/static/images/B.png" },
        { name: "Sign C", image: "/static/images/C.png"},
        { name: "Sign D", image: "/static/images/D.png" },
        { name: "Sign E", image: "/static/images/E.png" },
        { name: "Sign F", image: "/static/images/F.png"},
        { name: "Sign G", image: "/static/images/G.png" },
        { name: "Sign H", image: "/static/images/H.png" },
        { name: "Sign I", image: "/static/images/I.png" },
        { name: "Sign J", image: "/static/images/J.png" },
        { name: "Sign K", image: "/static/images/K.png" },
        { name: "Sign L", image: "/static/images/L.png" },
        { name: "Sign M", image: "/static/images/M.png" },
        { name: "Sign N", image: "/static/images/N.png" },
        { name: "Sign O", image: "/static/images/O.png" },
        { name: "Sign P", image: "/static/images/P.png" },
        { name: "Sign Q", image: "/static/images/Q.png" },
        { name: "Sign R", image: "/static/images/R.png" },
        { name: "Sign S", image: "/static/images/S.png" },
        { name: "Sign T", image: "/static/images/T.png" },
        { name: "Sign U", image: "/static/images/U.png" },
        { name: "Sign V", image: "/static/images/V.png" },
        { name: "Sign W", image: "/static/images/W.png" },
        { name: "Sign X", image: "/static/images/X.png" },
        { name: "Sign Y", image: "/static/images/Y.png"},
        { name: "Sign Z", image: "/static/images/Z.png" },
        // { name: "Sign 1", image: "images/1.png" },
        // { name: "Sign 2", image: "images/2.png" },
        // { name: "Sign 3", image: "images/3.png"},
        // { name: "Sign 4", image: "images/4.png" },
        // { name: "Sign 5", image: "images/5.png" },
        // { name: "Sign 6", image: "images/6.png"},
        // { name: "Sign 7", image: "images/7.png" },
        // { name: "Sign 8", image: "images/8.png" },
        // { name: "Sign 9", image: "images/9.png" },

        // Add more sign data here
    ];

    let loadedSigns = 0;

    // Function to load more signs dynamically
    function loadSigns(limit = 16) {
        const fragment = document.createDocumentFragment();

        for (let i = loadedSigns; i < loadedSigns + limit && i < signs.length; i++) {
            const signItem = document.createElement('div');
            signItem.classList.add('sign-item');

            const img = document.createElement('img');
            img.src = signs[i].image;
            img.alt = signs[i].name;

            const name = document.createElement('p');
            name.textContent = signs[i].name;

            signItem.appendChild(img);
            signItem.appendChild(name);
            fragment.appendChild(signItem);
        }

        gallery.appendChild(fragment);
        loadedSigns += limit;
    }

    // Infinite scroll logic
    gallery.addEventListener('scroll', () => {
        if (gallery.scrollTop + gallery.clientHeight >= gallery.scrollHeight) {
            loadSigns(); // Load more signs as user scrolls down
        }
    });

    // Initial load of signs
    loadSigns();

    // Search functionality to filter signs
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const signItems = document.querySelectorAll('.sign-item');

        signItems.forEach((item) => {
            const name = item.querySelector('p').textContent.toLowerCase();
            if (name.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

function startDetection() {
    // Show the detection container and the main content container
    document.querySelector('.detection-container').style.display = 'block';
    document.querySelector('.container').style.display = 'block';

    // You can add other code here to initialize the detection process
}

function toggleDetection() {
    const container = document.getElementById('detection-container');
    const detectionBtn = document.getElementById('detection-btn');

    if (container.style.display === "none" || container.style.display === "") {
        container.style.display = "block";
        detectionBtn.textContent = "Stop Detection";
        // Add additional start detection logic here (e.g., starting webcam)
    } else {
        container.style.display = "none";
        detectionBtn.textContent = "Start Detection";
        // Add additional stop detection logic here (e.g., stopping webcam)
    }
}   


//slide 14oct chatgpt
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll('.slides');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active-slide')); // Remove active class from all slides
        if (index >= slides.length) {
            currentSlide = 0; // Reset to first slide
        } else if (index < 0) {
            currentSlide = slides.length - 1; // Go to last slide
        } else {
            currentSlide = index;
        }
        slides[currentSlide].classList.add('active-slide'); // Show current slide
    }

    document.getElementById('next-btn').addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });

    // Show the first slide initially
    showSlide(currentSlide);

    // Optionally, add auto-sliding functionality
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000); // Change slide every 5 seconds
});
