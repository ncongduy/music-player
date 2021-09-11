//Improve app
//1. Hanlde when change current playback position more smoothier. - Done
//2. When choosing random feature, we don't want repeat immediately, we want
// repeat after a cycle.

//Declare global variable
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'user_1';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const songs = [
	{
		name: 'Giọt Sương',
		singer: 'NCD',
		path: './assets/audio/giot-suong.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Hoa Quả Không Màu',
		singer: 'NCD',
		path: './assets/audio/hoa-qua-khong-mau.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Hơn Cả Yêu',
		singer: 'NCD',
		path: './assets/audio/hon-ca-yeu.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Mẹ Yêu',
		singer: 'Duy & Nhi',
		path: './assets/audio/me-yeu.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Nhé Em',
		singer: 'NCD',
		path: './assets/audio/nhe-em.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Nothing Gonna Change My Love For You',
		singer: 'Duy & Nhi',
		path: './assets/audio/nothing-gonna-change-my-love-for-you.mp3',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Tám Chữ Có',
		singer: 'NCD',
		path: './assets/audio/tam-chu-co.m4a',
		image: './assets/img/background.jpeg',
	},
	{
		name: 'Thương',
		singer: 'NCD',
		path: './assets/audio/thuong.m4a',
		image: './assets/img/background.jpeg',
	},
];

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	isSeek: false,
	configure: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
	songs,
	setConfigure(key, value) {
		this.configure[key] = value;
		localStorage.setItem(
			PLAYER_STORAGE_KEY,
			JSON.stringify(this.configure)
		);
	},
	render() {
		const htmls = this.songs.map(
			(song, index) => `
		<div class="song ${
			index === this.currentIndex ? 'active' : ''
		}" data-index="${index}">
			<div class="thumb"
				style="background-image: url('${song.image}')">
			</div>
			<div class="body">
				<h3 class="title">${song.name}</h3>
				<p class="author">${song.singer}</p>
			</div>
			<div class="option">
				<i class="fas fa-ellipsis-h"></i>
			</div>
		</div>
		`
		);

		playList.innerHTML = htmls.join('');
	},
	defineProperties() {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex];
			},
		});
	},
	handleEvents() {
		const _this = this;
		const cdWidth = cd.offsetWidth;

		//Handle rotate image and stop rotate
		const cdThumbAnimate = cdThumb.animate(
			[{ transform: 'rotate(360deg)' }],
			{
				duration: 20000, // 20 secondes
				iterations: Infinity,
			}
		);

		cdThumbAnimate.pause();

		//Handle when scroll
		document.addEventListener('scroll', () => {
			const scrollTop =
				window.scrollY || document.documentElement.scrollTop;

			const newCdWidth = cdWidth - scrollTop;

			cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
			cd.style.opacity = newCdWidth / cdWidth;
		});

		//Handle when play music
		playBtn.addEventListener('click', () => {
			if (_this.isPlaying) {
				audio.pause();
			} else {
				audio.play();
			}
		});

		//When play song
		audio.addEventListener('play', () => {
			_this.isPlaying = true;
			player.classList.add('playing');
			cdThumbAnimate.play();
		});

		//When pause song
		audio.addEventListener('pause', () => {
			_this.isPlaying = false;
			player.classList.remove('playing');
			cdThumbAnimate.pause();
		});

		//when the current playback position has changed
		const updateProgress = () => {
			if (audio.duration && !_this.isSeek) {
				const percentProgress = Math.floor(
					(audio.currentTime / audio.duration) * 100
				);

				progress.value = percentProgress;
			} else if (_this.isSeek) {
				const seekTime = (progress.value * audio.duration) / 100;
				audio.currentTime = seekTime;
			}
		};

		audio.addEventListener('timeupdate', updateProgress);

		//Hanlde when change current playback position
		progress.addEventListener('mousedown', () => {
			_this.isSeek = true;
			if (_this.isSeek) {
				audio.pause();
			}
		});

		progress.addEventListener('mouseup', () => {
			_this.isSeek = false;
			if (!_this.isSeek) {
				audio.play();
			}
		});

		//When click next button
		nextBtn.addEventListener('click', () => {
			if (_this.isRandom) {
				_this.randomSong();
			} else {
				_this.nextSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		});

		//When click previous button
		prevBtn.addEventListener('click', () => {
			if (_this.isRandom) {
				_this.randomSong();
			} else {
				_this.prevSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		});

		//When click random button
		randomBtn.addEventListener('click', () => {
			_this.isRandom = !_this.isRandom;
			_this.setConfigure('isRandom', _this.isRandom);
			randomBtn.classList.toggle('active');
		});

		//When click repeat button
		repeatBtn.addEventListener('click', () => {
			_this.isRepeat = !_this.isRepeat;
			_this.setConfigure('isRepeat', _this.isRepeat);
			repeatBtn.classList.toggle('active');
		});

		//Handle when song end
		audio.addEventListener('ended', () => {
			if (_this.isRepeat) {
				audio.play();
			} else {
				nextBtn.click();
			}
		});

		//Create listener in playList
		playList.addEventListener('click', (evt) => {
			const songNode = evt.target.closest('.song:not(.active)');
			const optionNode = evt.target.closest('.option');
			if (songNode || optionNode) {
				//Handle when click another song
				if (songNode) {
					_this.currentIndex = Number(songNode.dataset.index);
					_this.loadCurrentSong();
					_this.render();
					_this.scrollToActiveSong();
					audio.play();
				}
				//Handle when click song option button
				if (optionNode) {
					console.log('option button');
				}
			}
		});
	},
	scrollToActiveSong() {
		setTimeout(() => {
			$('.song.active').scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}, 500);
	},
	loadCurrentSong() {
		heading.textContent = this.currentSong.name;
		cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
		audio.src = this.currentSong.path;
	},
	loadConfigure() {
		this.isRandom = this.configure.isRandom;
		this.isRepeat = this.configure.isRepeat;

		if (this.isRandom) {
			randomBtn.classList.add('active');
		} else {
			randomBtn.classList.remove('active');
		}

		if (this.isRepeat) {
			repeatBtn.classList.add('active');
		} else {
			repeatBtn.classList.remove('active');
		}
	},
	nextSong() {
		this.currentIndex++;
		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0;
		}

		this.loadCurrentSong();
	},
	prevSong() {
		this.currentIndex--;
		if (this.currentIndex < 0) {
			this.currentIndex = this.songs.length - 1;
		}

		this.loadCurrentSong();
	},
	randomSong() {
		let newIndex;
		do {
			newIndex = Math.floor(Math.random() * this.songs.length);
		} while (newIndex === this.currentIndex);

		this.currentIndex = newIndex;
		this.loadCurrentSong();
	},
	start() {
		//Load configure
		this.loadConfigure();

		//Define properties for app
		this.defineProperties();

		//Handle events
		this.handleEvents();

		//Load current song to UI
		this.loadCurrentSong();

		//Render playlist
		this.render();
	},
};

app.start();
