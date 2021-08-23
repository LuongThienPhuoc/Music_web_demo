const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PHUOC';

const heading =$('header h2');
const cdThumb = $('.cd-thumb');
const cd = $('.cd');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

var currentIndex = 0;
var currentSong;

isPlaying = false;
isRandom = false;
isRepeat = false;
// Lưu local, vào Apllication, Local Storage coi 
config= JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {};
setConfig = function(key, value){
    config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(config));
}

const songs = [
        {
            name: "Tháng 7 Của Anh, Em Và Cô Đơn",
            singer: "Khói",
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: "Ghé Qua",
            singer: "Dick",
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: "Buồn Của Anh",
            singer: "Khói",
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: "Sao Cũng Được",
            singer: "Binz",
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: "Sài Gòn Đau Lòng Quá",
            singer: "Hoàng Duyên",
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: "Em Là Bad Girl Trong Bộ Váy Ngắn",
            singer: "Trần Huyền Diệp",
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: "Độ Tộc 2",
            singer: "Độ Mixi",
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        },
        {
            name: "Mẹ ơi 2 ",
            singer: "Jack",
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg'
        },
        {
            name: "3107",
            singer: "W/n",
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.jpg'
        }
    ]

function render(){
        var htmls = songs.map(function(song, index){
            return `<div class="song ${index === currentIndex? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url(./assets/img/song${index+1}.jpg);"></div>
                
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>

                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });

        $('.playlist').innerHTML= htmls.join('');

};

function handleEvents(){
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)'}
    ],{
        duration: 10000, // 10s
        iterations: Infinity, // số lần lặp lại, Infinity : vô hạn
    })
    cdThumbAnimate.pause();


    // Scroll xử lý phóng to thu nhỏ cái ảnh
    document.onscroll = function(){
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - scrollTop;
        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
        cd.style.opacity = newCdWidth / cdWidth;
    }

    // Xử lý khi click play
    playBtn.onclick = function(){
        if(isPlaying) {
            audio.pause();
            cdThumbAnimate.pause();
        } else {
            audio.play();
            cdThumbAnimate.play();
        }
    }
    // Khi song được play
    audio.onplay = function(){
         isPlaying = true; 
        player.classList.add('playing');
    }

    audio.onpause = function(){
        player.classList.remove('playing');
        isPlaying = false;
    }

    // Khi tiến độ bài hát thay đổi 
    audio.ontimeupdate = function(){
        if(audio.duration){
            const progressPercent = Math.floor((audio.currentTime/ audio.duration)*100)
            progress.value = progressPercent;
            if (progressPercent == 100) {
                cdThumbAnimate.pause();
            }
        }
    }


    // Xử lý tua song
    progress.onchange = function (e){
        if (audio.duration)
        {
        audio.currentTime = (e.target.value/ 100) * audio.duration;
        
        }
    }

    // Next bài hát
    nextBtn.onclick = function() {
        if(isRandom){
            randomSong()
        }else {
            nextSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    // Prev bài hát
    prevBtn.onclick = function() {
        if(isRandom){
            randomSong();
        } else{
            prevSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    // Random bài hát
    randomBtn.onclick = function(){
        if(isRandom){
            randomBtn.classList.remove('active');
            isRandom = false;
        } else {
            randomBtn.classList.add('active');
            isRandom = true;
        }
        if(isRepeat){
            repeatBtn.classList.remove('active');
            isRepeat = false;
        }

        setConfig('isRandom', isRandom);
        setConfig('isRepeat', isRepeat);
    }

    // Sau khi audio ended
    audio.onended = function(){
        if(isRepeat)
        {
            againSong();
            audio.play();
        }else{
            nextBtn.click();
        }
    }

    // Repeat bài hát
    repeatBtn.onclick = function(){
        if(isRepeat){
            repeatBtn.classList.remove('active');
            isRepeat = false;
        } else {
            repeatBtn.classList.add('active');

            isRepeat = true;
        }
        if(isRandom){
            randomBtn.classList.remove('active');
            isRandom = false;  
        }
        setConfig('isRandom', isRandom);
        setConfig('isRepeat', isRepeat);
    }
    
    // Lắng nghe hành vi click vào playList
    playList.onclick = function(e){
        const songElement = e.target.closest('.song:not(.active)');
        // tìm từ từ ngược ra thằng cha cho tới khi thấy song
        if (e.target.closest('.song:not(.active)') || e.target.closest('.option')){
            if (e.target.closest('.song:not(.active)')){
                currentIndex = Number(songElement.dataset.index);
                loadCurrentSong();
                render();
                audio.play();
            }
            // click vào option
            else if (e.target.closest('.option')){

            }
        }
    }

}


function defineProperties(){
    return songs[currentIndex];
}

function loadCurrentSong(){

    heading.textContent = songs[currentIndex].name;
    audio.src = songs[currentIndex].path;
    cdThumb.style.backgroundImage = `url('${songs[currentIndex].image}')`;
}

function nextSong(){
    currentIndex++;
    if (currentIndex > songs.length -1){
        currentIndex = 0;
    }
    loadCurrentSong();
}

function prevSong(){
    
    if (currentIndex == 0){
        currentIndex = songs.length -1;
    } else {
        currentIndex--;
    }
    loadCurrentSong();

}

function againSong(){
    loadCurrentSong();
}

function loadConfig(){
    isRandom = config.isRandom;
    isRepeat = config.isRepeat;

    if(isRandom){
      randomBtn.classList.add('active');
    } 
    if(isRepeat){
      repeatBtn.classList.add('active');
    }
    
}

function randomSong(){
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * songs.length)
    } while (newIndex === currentIndex)
    currentIndex = newIndex;
    loadCurrentSong();
}

function scrollToActiveSong(){
    setTimeout(function(){
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    },250)    
}

function start(){
   

    // định nghĩa các thuốc tính cho object
    currentSong = defineProperties();
    // render playlist
    render();
    // lắng nghe sự kiện
    handleEvents();

    // tải thông tín bài hát đầu tiền vào UI khi chạy ứng dụng
    loadCurrentSong();

     // load setting 
     loadConfig();
}

start();



