$.fn.videoPlayer = function(option) {
	var _default = {
		title: '视频播放器',
		noFullError : '您的浏览器不支持全屏播放'
	};
	$_options = $.extend(_default, option);
	$_this = $(this);
	$_video = $_this.find('video')[0];
	$_o_video = $($_video);
	$_controler = $('<div class="video-controler"><div class="video-process"><div class="video-process-total"><div class="video-process-seek"></div><div class="video-process-slider"></div></div><div class="video-process-time"><span></span>/<span></span></div></div><div class="video-control-btn"><div class="btn-play btn icon-play"></div><div class="btn-stop btn icon-stop"></div><div class="btn-full btn right icon-fullscreen"></div><div class="volume-total right"><div class="volume-slider"></div></div><div class="btn-volume right btn icon-volume-off"></div></div></div>');
	$_video_title = $('<div class="video-title">' + $_options.title + '</div>');
	$_video_no_full_error = $('<div class="video-no-full-error">'+$_options.noFullError+'</div>')
	//按钮
	$_btn_play = $_controler.find('.btn-play');
	$_btn_stop = $_controler.find('.btn-stop');
	$_btn_volume = $_controler.find('.btn-volume');
	$_btn_full = $_controler.find('.btn-full');
	//进度条
	$_video_process_total = $_controler.find('.video-process-total');
	$_video_process_seek = $_controler.find('.video-process-seek');
	$_video_process_slider = $_controler.find('.video-process-slider');
	//音量条
	$_volume_total = $_controler.find('.volume-total');
	$_volume_slider = $_controler.find('.volume-slider');
	//时间
	$_video_process_time = $_controler.find('.video-process-time');
	$_total_time = $($_video_process_time.find('span')[1]);
	$_current_time = $($_video_process_time.find('span')[0]);
	var _init = function() {
		//取消右键菜单
		$_o_video.bind('contextmenu', function() {
			return false;
		});
		$_o_video.before($_video_title);
		$_o_video.after($_controler);
		var _timer;
		var _listenHide = function(){
			 _timer= setTimeout(function(){
				$_video_title.fadeOut();
				$_controler.fadeOut();
			}, 3000);
		};
		var _showControl = function(){
			$_video_title.fadeIn();
			$_controler.fadeIn();
			_listenHide();
		};
		_showControl();
		//视频的初始化
		$_o_video.on('loadedmetadata', function() {
			$_current_time.html(_timeFormat(0));
			$_total_time.html(_timeFormat($_video.duration));
		});
		//播放进度
		$_o_video.on('timeupdate', function() {
			$_current_time.html(_timeFormat($_video.currentTime));
			var _play_percentage = $_video.currentTime / $_video.duration * 100;
			$_video_process_slider.css('width', _play_percentage + '%');
		});
		$_o_video.on('play', function() {
			$_btn_play.removeClass('icon-play').addClass('icon-pause');
		});
		$_o_video.on('pause', function() {
			$_btn_play.removeClass('icon-pause').addClass('icon-play');
		});
		$_o_video.click(function(e) {
			if ($_video.paused || $_video.ended)
				$_video.play();
			else
				$_video.pause();
		});
		$_o_video.dblclick(function(event) {
			_updateFull();
		});
		$_o_video.mousemove(function(e) {
			clearTimeout(_timer);
			_showControl();
		});
		$_controler.mousemove(function(e){
			clearTimeout(_timer);
			_showControl();
		});

		//更新缓冲进度
		var _startBuffer = function() {
			try {
				var _buffer_percentage = $_video.buffered.end(0) / $_video.duration * 100;
				$_video_process_seek.css('width', _buffer_percentage + '%');
				if (_buffer_percentage < 100) {
					setTimeout(_startBuffer, 500);
				}
			} catch (e) {
				$_video_process_seek.css('width', '100%');
			}
		};
		_startBuffer();

		//用户拖动进度条
		var _timeDrag = false;
		$_video_process_total.on('mousedown', function(e) {
			_timeDrag = true;
			_updateTime(e.pageX);
		});
		$(document).on('mouseup', function(e) {
			if (_timeDrag) {
				_timeDrag = false;
				_updateTime(e.pageX);
			}
		});
		$(document).on('mousemove', function(e) {
			if (_timeDrag) {
				_updateTime(e.pageX);
			}
		});
		var _updateTime = function(x) {
			var _duration = $_video.duration;
			var _position = x - $_video_process_total.offset().left;
			var _play_percentage = _position / $_video_process_total.width() * 100;
			if (_play_percentage > 100)
				_play_percentage = 100;
			if (_play_percentage < 0)
				_play_percentage = 0;
			$_video_process_slider.css('width', _play_percentage + '%');
			$_video.currentTime = _duration * _play_percentage / 100;
		};
		//用户拖动声音
		var _volumeDrag = false;
		$_volume_total.on('mousedown', function(e) {
			_volumeDrag = true;
			_updateVolume(e.pageX);
		});
		$(document).on('mouseup', function(e) {
			if (_volumeDrag) {
				_volumeDrag = false;
				_updateVolume(e.pageX);
			}
		});
		$(document).on('mousemove', function(e) {
			if (_volumeDrag) {
				_updateVolume(e.pageX);
			}
		});
		var _updateVolume = function(x, vol) {
			var _volume_percentage;
			if (vol) {
				_volume_percentage = vol * 100;
			} else {
				var _position = x - $_volume_total.offset().left;
				_volume_percentage = _position / $_volume_total.width() * 100;
			}
			if(_volume_percentage > 100)
				_volume_percentage = 100;
			if(_volume_percentage < 0)
				_volume_percentage = 0;
			$_video.volume = _volume_percentage / 100;
			if (_volume_percentage >= 50)
				$_btn_volume.removeClass('icon-volume-off').removeClass('icon-volume-down').addClass('icon-volume-up');
			else if (_volume_percentage == 0)
				$_btn_volume.removeClass('icon-volume-off').removeClass('icon-volume-up').removeClass('icon-volume-down').addClass('icon-volume-off');
			else
				$_btn_volume.removeClass('icon-volume-off').removeClass('icon-volume-up').addClass('icon-volume-down');
			$_volume_slider.css({
				'width': _volume_percentage + '%'
			});
		}
		_updateVolume(null, $_video.volume);


		//按钮监听
		$_btn_play.click(function(e) {
			if ($(this).hasClass('icon-play') && ($_video.paused || $_video.ended))
				$_video.play();
			else
				$_video.pause();
		});
		$_btn_volume.click(function(e) {
			if (($(this).hasClass('icon-volume-up') || $(this).hasClass('icon-volume-down')) && !$_video.muted) {
				$(this).removeClass('icon-volume-up').removeClass('icon-volume-down').addClass('icon-volume-off');
				$_volume_slider.animate({
					'width': '0%'
				});
				$_video.muted = true;
			} else {
				$_video.muted = false;
				var _volume_percentage = $_video.volume * 100;
				if (_volume_percentage >= 50)
					$(this).removeClass('icon-volume-off').addClass('icon-volume-up');
				else if (_volume_percentage == 0)
					$(this).removeClass('icon-volume-off').addClass('icon-volume-off');
				else
					$(this).removeClass('icon-volume-off').addClass('icon-volume-down');
				$_volume_slider.animate({
					'width': _volume_percentage + '%'
				});
			}
		});
		$_btn_stop.click(function (e) {
			_updateTime($_video_process_total.offset().left);
			$_video.pause();
		});
		$_btn_full.click(function (e) {
			_updateFull();
		});
		var _updateFull = function(){
			if($.isFunction($_video.webkitEnterFullscreen))
				$_video.webkitEnterFullscreen();
			else if($.isFunction($_video.mozRequestFullScreen))
				$_video.mozRequestFullScreen();
			else{
				$_o_video.after($_video_no_full_error);
				$_video_no_full_error.fadeIn(function(){
					setTimeout(function(){
						$_video_no_full_error.fadeOut(function(){
							$_video_no_full_error.remove();
						});
					}, 1500);
				});
			}
		};
	};
	var _timeFormat = function(seconds) {
		var _h = Math.floor(seconds / 3600) < 10 ? '0' + Math.floor(seconds / 3600) : Math.floor(seconds / 3600);
		var _m = Math.floor((seconds - _h * 3600) / 60) < 10 ? '0' + Math.floor((seconds - _h * 3600) / 60) : Math.floor((seconds - _h * 3600) / 60);
		var _s = Math.floor(seconds - _h * 3600 - _m * 60) < 10 ? '0' + Math.floor(seconds - _h * 3600 - _m * 60) : Math.floor(seconds - _h * 3600 - _m * 60);
		return _h + ':' + _m + ':' + _s;
	};
	_init();
}