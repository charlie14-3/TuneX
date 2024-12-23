let currentsong = new Audio()
let currfolder;
let songs = []


async function getSong(folder) {
    currfolder = folder
    let a = await fetch(`/${folder}/`)

    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }

    //show all songs in playlist
    let songul = document.querySelector(".list").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        let cleanName = song
            .split("/songs/")[1] // Extract only the filename part
            .replaceAll("%20", " ")
            .replaceAll("128", " ")
            .replace("-", " ")

            .replaceAll("Kbps.mp3", " ")
            .trim();
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${cleanName}
            </div>
            <div>Sourabh</div>
        </div> 
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
    </li>`;
    }

    //attach event listener to each song 
    Array.from(document.querySelector(".list").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            // console.log(`Playing: ${songs[index]}`)
            playmusic(songs[index])
        })
    })
    return songs
}
const playmusic = (track) => {
    currentsong.src = track


    currentsong.play()
    play.src = "pause.svg"
    document.querySelector(".songinfo").innerHTML = track
        .split("/songs/")[1] // Extract only the filename part
        .replaceAll("%20", " ")
        .replaceAll("128", " ")
        .replace("-", " ")
        .replaceAll("Kbps.mp3", " ")
        .trim();
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayalbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    width="50" height="50" viewBox="0 0 64 64" xml:space="preserve">
                    <circle cx="32" cy="32" r="30" fill="green" />
                    <g transform="translate(8,8) scale(0.8)">
                        <path
                            d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30   c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15   C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"
                            fill="white" />
                        <path
                            d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30   S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"
                            fill="transparent" />
                    </g>
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //load song when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSong(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}
async function main() {
    //get songs
    // await getSong("songs/romance")

    displayalbum()

    //attach event listener to play next prev
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    function convertToMinutesSeconds(seconds) {
        // Calculate full minutes
        const minutes = Math.floor(seconds / 60);

        // Calculate remaining seconds (including milliseconds)
        const remainingSeconds = seconds % 60;

        // Split the remaining seconds into integer part (for seconds) and decimal part (for milliseconds)
        const intSeconds = Math.floor(remainingSeconds);
        const milliseconds = Math.round((remainingSeconds - intSeconds) * 1000);

        // Format minutes and seconds
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = intSeconds.toString().padStart(2, '0');
        const formattedMilliseconds = milliseconds.toString().padStart(3, '0');

        // Return the formatted time as "MM:SS.mmm"
        return `${formattedMinutes}:${formattedSeconds}`;
    }





    const timeInSeconds = 125;
    // console.log(convertToMinutesSeconds(timeInSeconds));  // Output: "02:05"


    //time update event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentsong.currentTime)}/${convertToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "% "
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    //previous button and next also
    prev.addEventListener("click", () => {
        // console.log("Previos clicked")
        // console.log(currentsong)
        let filename = new URL(currentsong.src).pathname.split("/").pop();

        let index = songs.findIndex(song => song.includes(filename))

        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        // console.log("next")
        // console.log(currentsong)
        let filename = new URL(currentsong.src).pathname.split("/").pop();

        let index = songs.findIndex(song => song.includes(filename))

        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e)
        currentsong.volume = parseInt(e.target.value) / 100
    })


    //event listener to mute song
    document.querySelector(".volume > img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            //as strings are in mutable
            e.target.src=e.target.src.replace("mute.svg","volume.svg")

            currentsong.volume= 0.1
        }
    })











}
main()