//adding songs from playlist to the library
async function getSongs(cardindex) {
    let a = await fetch(`http://127.0.0.1:5500/songs/album${cardindex}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let ai = div.getElementsByTagName("img")

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index].href
        if (element.endsWith(".mp3")) {
            songs.push(element)
        }
    }
    return songs;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}


//playMusic function
const playMusic = (track, pause = false) => {
    console.log(currentIndex)
    currentSong.src = track
    if (!pause) {
        currentSong.play()
        playbutton.src = "svg/pause.svg"
    }
    const partsArray = track.split("/");
    const lastPart = partsArray[partsArray.length - 1];

    document.querySelector(".currentsongname").innerHTML = lastPart.replaceAll("%20", " ").replaceAll("(PagalWorld)", "").replaceAll("_64-", "").split(".mp3")[0]
    document.querySelector(".currentsongimage").src = track.split("mp3")[0] + "jpeg"
    document.querySelector(".currentartist").innerHTML = "Omkar"

    currentSong.onloadedmetadata = function () {
        console.log(currentSong.duration);
        document.querySelector(".duration").innerHTML = formatTime(currentSong.duration);
    };
}

function playNextSong() {
    if (currentIndex < songs.length - 1) {
        currentIndex++;
        playMusic(songs[currentIndex]);
    } else {
        // If it's the last song, stop playing or loop to the first song
        currentIndex = 0; // Reset to the first song
        playMusic(songs[0]);
    }

}
function playPreviousSong() {
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(songs[currentIndex]);
    } else {
        // If it's the last song, stop playing or loop to the first song
        currentIndex = songs.length - 1; // Reset to the first song
        playMusic(songs[currentIndex]);
    }

}

function toggleMute() {
    if (currentSong) {
        isMuted = !isMuted;
        currentSong.muted = isMuted;

        // Update UI or do additional actions if needed
        if (isMuted) {
            // Update UI for muted state (e.g., change mute icon)
            document.querySelector(".mute").src = "svg/unmute.svg"
            console.log('Audio is muted');
        } else {
            // Update UI for unmuted state (e.g., change unmute icon)
            document.querySelector(".mute").src = "svg/mute.svg"
            console.log('Audio is unmuted');
        }
    }
}

function setVolume(percent) {
    if (currentSong) {

        // Set the volume property of the Audio object
        currentSong.volume = percent / 100;
        console.log(currentSong.volume)

    }
}

function handleDrag(e) {
    const seekbarRect = seekbar.getBoundingClientRect();
    const percent = (e.clientX - seekbarRect.left) / seekbarRect.width;

    // Ensure the percentage is within the valid range [0, 1]
    const validPercent = Math.min(1, Math.max(0, percent));

    // Update the position of the circle and set the audio current time
    circle.style.left = `${validPercent * 100}%`;
    currentSong.currentTime = validPercent * currentSong.duration;
}


let currentSong = new Audio
let cardisclicked = false;
let currentIndex = 0;
let songs = []
let isMuted = false
currentSong.volume = 1
let isDraggingseekbar = false;
const seekbar = document.querySelector('.seekbar'); // Replace with the actual class or ID of your seekbar element
const circle = document.querySelector('.circle'); // Replace with the actual class or ID of your circle element

//main function
async function main() {
    const cards = document.getElementsByClassName("card");
    const cardsArray = [...cards];

    // Add an event listener to each card
    cardsArray.forEach(async (card, index) => { // Added async here
        card.addEventListener("click", async function () { // Added async here
            
            // Remove glow class from all cards
        cardsArray.forEach(otherCard => {
            otherCard.classList.remove('glow');
        });

        // Add glow class to the clicked card
        card.classList.add('glow');
            // Get the index of the clicked card in the array
            const clickedIndex = cardsArray.indexOf(card); // Added "const" here
            
            console.log(`Clicked on card at index ${clickedIndex}`);
            cardisclicked = true;
            currentSong.pause()
            playbutton.src = "svg/play.svg"
            currentSong.currentTime = 0
            songs = await getSongs(clickedIndex);
            console.log(songs);
            let songUL = document.querySelector(".list");
            songUL.innerHTML = ""
            songUL.scrollTop

            for (const song of songs) {
                const songElement = document.createElement("li");
                songElement.className = "song reset";
                songElement.innerHTML =
                    `<img class="songimage" src="${song.split(".mp3")[0]}.jpeg" alt = "" >
                        <div class="info">
                            <div class="songname">
                            ${song.split(`album${clickedIndex}/`)[1].replaceAll("%20", " ").replaceAll("(PagalWorld)", "").replaceAll("_64-", "").split(".mp3")[0]}
                            </div>
                            <div class="artist">
                            Omkar
                            </div>
                        </div>
                        <img class="songplay" src="svg/play.svg" alt="">`


                songUL.appendChild(songElement);

                songElement.addEventListener("click", () => {

                    console.log(song);
                    currentIndex = songs.indexOf(song)
                    playMusic(song);
                });

            }

            playMusic(songs[0], true)



        }); // Added closing parenthesis here

    });



    playbutton.addEventListener("click", () => {
        if (cardisclicked) {
            if (currentSong.paused) {
                currentSong.play()
                playbutton.src = "svg/pause.svg"
            }
            else {
                currentSong.pause()
                playbutton.src = "svg/play.svg"
            }
        }

    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currenttime").innerHTML = formatTime(currentSong.currentTime);

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        const targetDiv = document.querySelector(".seekbar");
        const gradientStop = (currentSong.currentTime / currentSong.duration) * 100;
        targetDiv.style.background = `linear-gradient(to right, green ${gradientStop}%, #b3b3b3 ${gradientStop}%, #b3b3b3 100%)`;
        if (currentSong.currentTime >= currentSong.duration - 0.5) {
            playNextSong();
        }

    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        if (cardisclicked) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
            document.querySelector(".circle").style.left = percent + "%"
            currentSong.currentTime = ((currentSong.duration) * percent) / 100
        }
    })

    document.querySelector(".nxt").addEventListener("click", playNextSong)
    document.querySelector(".prev").addEventListener("click", playPreviousSong)

    document.querySelector(".mute").addEventListener("click", toggleMute)


    document.querySelector(".volume").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".volumecircle").style.left = percent + "%"
        setVolume(percent)
    })




    circle.addEventListener('mousedown', (e) => {
        if (cardisclicked) {
            isDraggingseekbar = true;
            handleDrag(e);
            circle.style.transition = ""
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingseekbar) {
            handleDrag(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingseekbar = false;
        circle.style.transition = "left 0.3s"
    });

}

//add an eventlistener to open menu when hamburger icon is pressed
document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "0";
})
document.querySelector(".closemenu").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "-110%";
})

window.addEventListener('resize', function() {
    // Get the current height of the viewport
    var screenHeight = window.innerHeight;

    // Log the height to the console for demonstration purposes
    console.log('Screen height: ' + screenHeight);

    // Check if the screen height is less than a certain value (e.g., 600px)
    if (screenHeight < 510 ) {
        // Execute actions specific to screen heights less than 600px
        console.log('Screen height is less than 600px');
        // Add your logic here
        this.document.querySelector(".home").innerHTML = `<img class="invert" src="svg/home.svg" alt="">
    `;
        this.document.querySelector(".search").innerHTML =  `
        <img class="invert" src="svg/search.svg" alt="">
    `;
    }
    else{
        this.document.querySelector(".home").innerHTML = `
        <img class="invert" src="svg/home.svg" alt="">
        Home
    `;
        this.document.querySelector(".search").innerHTML =  `
        <img class="invert" src="svg/search.svg" alt="">
        Search
    `;
    }
});










main();