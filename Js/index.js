console.log("JavaScript for Spotify")
let currentSong = new Audio();
let songs;
let currFolder;

// A function to convert Song Seconds into Minute:Second type value:
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    // Here we assigned a to fetch api which is a folder in which songs are available.
    // Then we converted the fetched data into text() and assigned it to response.
    // Then we assigned div that when ever we call div, it creates an element in the document and that element will be div.
    // After then we targeted the innerHTML of div and told that let the innerHTML be equal to Response(which are the songs in text format).
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    // Here we use a for loop to get the song names which are being ended by .mp3. 
    // Then by let the songs equal to an array and pushed the songs using (songs.push) into the array. Also we splited text after /songs/ in the url so we can get only name of the song.
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // In this, we are telling to grab each song from .songList (which is in main html) by their ul tag and add them into the inner html of the document into li's.
    // We also replaced the keywords in songs url like (%20) with space (" "). So each time li is inserted into the songlist, we get only the name of song.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li class="songInfo">
        <div class="songName">${song.replaceAll("%20", " ")}</div>
        <img class="libraryPlay" src="svgs/Library Play.svg" alt="playLibrary"> </li>`;
    }

    // Attaching Event Listner to the Songs.
    // We are telling to make array from li's of .songList and for each li e is the variable declared using forEach function. After that, by using e we can select all li's and after selecting all li's, we can target the first element child holding the name of the song. In this way, we will get the name of the song when we click on it. and .Trim() at the end removes all extra spaces from back and forward

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songName").innerHTML)
            playMusic(e.querySelector(".songName").innerHTML.trim())
        })
    });
    return songs
}

// A Function by which we will be able to click and play only one song at a time.
// Adding pause=false because it will help us to play the music only by pressing the play button once the page is reloaded.
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg";
    }
    document.querySelector(".songText").innerHTML = decodeURI(track)
    document.querySelector(".songDuration").innerHTML = "00:00 / 00:00"
}


async function main() {

    // Get List of the Songs.
    await getSongs("songs/ncs")
    console.log(getSongs)
    playMusic(songs[0], true)



    // Attaching Event Listner to Play or Pause Song.
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svgs/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "svgs/play.svg";
        }
    })

    // Adding TimeUpdate Event for listening time.
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        // Moving the circle of the seekbar. Using with this currentSong function as it is also associated with song.
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add an event listener to seekbar
    // We used (e.offsetX) as it tells the value of x when we click at a point on seekbar and (target.getBoundingClientRect().width) tells that at which point at the page we are clicking (width-wise).

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        // This will move the seekbar circle to the point where we click by adding % into its left.
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

main()