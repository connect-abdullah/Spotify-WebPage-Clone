console.log("JavaScript for Spotify")
let currentSong = new Audio();
let songs = [];
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
    try {
        currFolder = folder;
        // Use relative path for local development and absolute path for production
        const baseUrl = window.location.hostname === 'localhost' ? '' : '/Spotify-WebPage-Clone';
        const response = await fetch(`${baseUrl}/${folder}/`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch songs from ${folder}`);
        }

        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;

        const as = div.getElementsByTagName("a");
        songs = [];
        
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                const songPath = element.href.split(`/${folder}/`)[1];
                if (songPath) {
                    songs.push(songPath);
                }
            }
        }

        const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        
        if (songs.length === 0) {
            songUL.innerHTML = "<li class='songInfo'><div class='songName'>No songs found</div></li>";
            return songs;
        }

        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `
            <li class="songInfo">
            <div class="songName">${decodeURIComponent(song.replaceAll("%20", " "))}</div>
            <img class="libraryPlay" src="${baseUrl}/svgs/Library Play.svg" alt="playLibrary"> </li>`;
        }

        // Attaching Event Listener to the Songs
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                const songName = e.querySelector(".songName").innerHTML.trim();
                if (songName) {
                    playMusic(songName);
                }
            });
        });
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "<li class='songInfo'><div class='songName'>Error loading songs</div></li>";
        return [];
    }
}

// A Function by which we will be able to click and play only one song at a time.
const playMusic = (track, pause = false) => {
    try {
        if (!track) {
            console.error("No track provided");
            return;
        }

        const baseUrl = window.location.hostname === 'localhost' ? '' : '/Spotify-WebPage-Clone';
        currentSong.src = `${baseUrl}/${currFolder}/${track}`;
        
        if (!pause) {
            currentSong.play()
                .catch(error => {
                    console.error("Error playing audio:", error);
                    document.querySelector(".songText").innerHTML = "Error playing song";
                });
            play.src = `${baseUrl}/svgs/pause.svg`;
        }
        
        document.querySelector(".songText").innerHTML = decodeURIComponent(track);
        document.querySelector(".songDuration").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Error in playMusic:", error);
    }
}

async function main() {
    try {
        // Get List of the Songs.
        await getSongs("songs/ncs");
        
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }

        // Attaching Event Listener to Play or Pause Song.
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play()
                    .catch(error => console.error("Error playing audio:", error));
                play.src = `${window.location.hostname === 'localhost' ? '' : '/Spotify-WebPage-Clone'}/svgs/pause.svg`;
            } else {
                currentSong.pause();
                play.src = `${window.location.hostname === 'localhost' ? '' : '/Spotify-WebPage-Clone'}/svgs/play.svg`;
            }
        });

        // Adding TimeUpdate Event for listening time.
        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songDuration").innerHTML = `
            ${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

            // Moving the circle of the seekbar. Using with this currentSong function as it is also associated with song.
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        });

        // Add an event listener to seekbar
        // We used (e.offsetX) as it tells the value of x when we click at a point on seekbar and (target.getBoundingClientRect().width) tells that at which point at the page we are clicking (width-wise).

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            // This will move the seekbar circle to the point where we click by adding % into its left.
            currentSong.currentTime = ((currentSong.duration) * percent) / 100
        });

        // Add an event listener for hamburger
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0"
        });

        // Add an event listener for close button
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%"
        });

        // Add an event listener to previous
        previous.addEventListener("click", () => {
            currentSong.pause()
            console.log("Previous clicked")
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }
        });

        // Add an event listener to next
        next.addEventListener("click", () => {
            currentSong.pause()
            console.log("Next clicked")

            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
        });

        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => { 
            e.addEventListener("click", async item => {
                console.log("Fetching Songs")
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
                playMusic(songs[0])
            })
        })
    } catch (error) {
        console.error("Error in main:", error);
    }
}

main()