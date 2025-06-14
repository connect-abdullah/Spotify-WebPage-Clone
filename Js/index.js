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
        const baseUrl = window.location.hostname === 'localhost' ? '' : '/Spotify-WebPage-Clone';
        
        // Create a list of common audio file extensions
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
        
        // Get the folder name from the path
        const folderName = folder.split('/').pop();
        
        // Create a list of songs based on the folder structure
        songs = [];
        const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        // Function to check if a file is an audio file
        const isAudioFile = (filename) => {
            return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext));
        };

        // Function to get song name from filename
        const getSongName = (filename) => {
            return filename.replace(/\.[^/.]+$/, ""); // Remove file extension
        };

        // Try to fetch the directory listing
        try {
            const response = await fetch(`${baseUrl}/${folder}/`);
            if (response.ok) {
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const links = doc.getElementsByTagName('a');
                
                for (const link of links) {
                    const href = link.getAttribute('href');
                    if (href && isAudioFile(href)) {
                        songs.push(href);
                    }
                }
            }
        } catch (error) {
            console.warn('Directory listing not available, using fallback method');
        }

        // If no songs found through directory listing, try to load them directly
        if (songs.length === 0) {
            // Try to load some common song names for the folder
            const commonSongs = {
                'ncs': [
                    'Law Lag Gaye - Jolly LLB.mp3',
                    'Dil Leke - Wanted.mp3',
                    'Desi Beat - Bodyguard.mp3',
                    'Bu Kadar Mi - Emre Altug.mp3',
                    'Banjaara - Ek Tha Tiger.mp3',
                    'Balma - Khiladi 786.mp3',
                    'Balam Pichkar - YJHD.mp3',
                    'Badtameez Dil - YJHD.mp3'
                ],
                'Atif': [
                    'Aa Bhi Jaa.mp3',
                    'Allah Duhai Hai.mp3',
                    'Be Intehaan.mp3',
                    'Dil Diyan Gallan.mp3',
                    'Dekhte Dekhte.mp3',
                    'Go.mp3',
                    'Jeena Jeena.mp3'
                ],
                'Karan': [
                    'You.mp3',
                    'WYTB.mp3',
                    'Try Me.mp3',
                    'Take It Easy.mp3',
                    'Jee Ni Lagda.mp3',
                    'Gangsta.mp3',
                    'Champions Anthem.mp3',
                    'Bachke Bachke.mp3',
                    'Admirin You.mp3'
                ],
                'Diljit': [
                    'Whatcha Doin.mp3',
                    'Stars.mp3',
                    'Psychotic.mp3',
                    'Poppin.mp3',
                    'Kinni Kinni.mp3',
                    'Kehkashan.mp3',
                    'Jatt Vailly.mp3',
                    'Icon.mp3',
                    'Bad Habits.mp3'
                ]
            };

            if (commonSongs[folderName]) {
                songs = commonSongs[folderName];
            }
        }

        // Display songs in the UI
        if (songs.length === 0) {
            songUL.innerHTML = "<li class='songInfo'><div class='songName'>No songs found</div></li>";
            return songs;
        }

        for (const song of songs) {
            const songName = getSongName(song);
            songUL.innerHTML = songUL.innerHTML + `
            <li class="songInfo">
            <div class="songName">${songName}</div>
            <img class="libraryPlay" src="${baseUrl}/svgs/Library Play.svg" alt="playLibrary"> </li>`;
        }

        // Attaching Event Listener to the Songs
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                const songName = e.querySelector(".songName").innerHTML.trim();
                if (songName) {
                    const songFile = songs.find(s => getSongName(s) === songName);
                    if (songFile) {
                        playMusic(songFile);
                    }
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
        
        document.querySelector(".songText").innerHTML = track.replace(/\.[^/.]+$/, "");
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