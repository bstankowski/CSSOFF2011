$.fn.extend({
	/* Show/hide labels on field focus */
	labels: function() {
		return this.each(function() {
			var label = $(this),
				input = $('#' + label.attr('for'));
				
				input
					.focus(function() {
						label.hide();
					})
					.blur(function() {
						if(this.value === '') {
							label.show();
						}
					});
					
					window.setTimeout(function() {
						if(input.val() !== '') {
							label.hide();
						}
					}, 50);
		});
	}
});

var Engine = {
	init: function() {
		this.navigation();
		this.ie.fixes();
		this.obstacles();
		this.form();
		this.countDown();
	},
	
	ie: {
		browser: $.browser.msie && parseInt($.browser.version, 10) < 9 ? 'ie' : '',
		fixes: function() {
			$('.prizes li:last-child').addClass('last');
		}
	},
	
	location: function(hash) {
		if(history.pushState) {
			history.pushState(null, null, hash);
		}
		else {
			location.hash = hash;
		}
	},

	navigation: function() {
		var nav = $('#navigation');
	
		/* Navigation position */
		$('header').waypoint(function(event, direction) {
			nav.toggleClass('scroll', direction === "down");
			event.stopPropagation();
		}, {
			offset: '-1px'
		});
		
		$('section').waypoint(function() {
			$('a', nav).removeClass('current').filter('[href$="' + this.id + '"]').addClass('current');
			
			Engine.location('#' + this.id);
		});
		
		/* Scroll to section */
		$('a', nav).click(function(e) {
			e.preventDefault();
				
			var target = this.hash;
				
			$('html, body').stop().animate({'scrollTop': $(target).offset().top }, 500, function() {
				Engine.location(target);
			});
			
			$(this).blur();
		});
	},

	/* Obstacles List */
	obstacles: function() {
		/* Don’t initialize on small screens */
		if(screen.width < 640) {
			$('.current', thumbs).removeClass('current');
			return;
		}
	
		var thumbs = $('.obstacles'),
			large = $('<div class="large" aria-live="polite" />'),
			header = $('<div class="header" />').appendTo(large),
			fade = Engine.ie.browser === 'ie' ? 0 : 'fast',
			image, src, caption;

		large.insertAfter(thumbs);

		$('a', thumbs).click(function(e) {
			e.preventDefault();
			
			caption = $('.caption', this).clone();

			if($(this).is('.current') && thumbs.is('.initialized')) {
				return false;
			}
							
			$('.current', thumbs).removeClass('current');
			$(this).addClass('current');

			image = new Image();
			src = this.href;

			$(image)
				.load(function() {
					$(this).hide();
					large.find('img').remove().end().append(this);
					$(this).fadeIn(fade);
					$('.caption', large).remove();
					header.empty().prepend(caption);
				})
				.attr('src', src);
		});
		
		if($('.current', thumbs).length) {
			thumbs.find('.current').click().end().addClass('initialized');
		} else {
			$('a:first', thumbs).click();
		}
	},
	
	form: function() {
		$('.text label').labels();
		
		/* Custom select */
		$('select')
			.bind('focus', function() {
				$(this).closest('.select').addClass('focus');
			})
			.bind('blur', function() {
				$(this).closest('.select').removeClass('focus');
			});

		var createCustomSelect = function() {
			$('.select select').each(function(){
				var selected = $(this).find("option:selected"),
					options = $("option", this),
					target = $('<dl class="custom-select" />').insertAfter(this),
					text;
				
				target
					.append('<dt>' + selected.text() + '</dt>')
					.append('<dd><ul /></dd>');
	
				options.each(function(){
					$("dd ul", target).append('<li><a href="#" data-value="' + this.value + '">' + $(this).text() + '</a></li>');
				});
			});
			
			$('.custom-select').each(function(){
				var s = $(this).attr('tabindex', 0),
					source = $(this).closest('.select').find('select');
				
				$('dd a', s).click(function(e){
					e.preventDefault();
					
					text = $(this).html();
					$('dt', s).html(text);
					$('.selected', s).removeClass('selected');
					$(this).addClass('selected');
					
					source.val($(this).data('value'));
					s.blur();
				});
			});
		};
		
		createCustomSelect();
		
		$('.custom-select')
			.hover(
				function(){ $(this).addClass('hover'); },
				function(){ $(this).removeClass('hover'); }
			)
			.focus(
				function(){ $(this).addClass('hover'); }
			)
			.blur(
				function(){ $(this).removeClass('hover'); }
			);
	},
	
	/* Your first challenge in the contest – fill in the form in 60 seconds! */
	countDown: function() {
		$('form', section).append('<div class="overlay" />');	
	
		var section = $('#contestant'),
			fields = $('input, select', section),
			clock = $('.clock span', section),
			seconds = {
				start: parseInt(clock.text(), 10),
				current: parseInt(clock.text(), 10)
			},
			msg = {
				el: $('.timer strong'),
				ticking: '<strong id="clock-status">The clock is&nbsp;ticking!</strong>',
				again: $('<button class="again" id="clock-status"><span>Time’s up! <span>Try again!</span></span></button>')
			},
			run;

		var timer = {
			start: function() {
				section.addClass('ticking');
				
				seconds.current -= 1;
				seconds.current = seconds.current < 10 ? '0' + seconds.current : seconds.current;
				
				if (seconds.current <= 0) {
					/* Time’s up! */
					clearTimeout(run);
					
					clock.text(seconds.current);
					run = setInterval(function() {
						clock.toggleClass('time-up');
						fields.blur();
					}, 500);

					section.addClass('times-up').removeClass('ticking');
					$('button[type="submit"]', section).add(fields).attr('disabled', 'disabled');
					msg.el.replaceWith(msg.again);
					section.removeClass('ticking');
				} else {
					/* Ticking */
					clock.text(seconds.current);
					run = setTimeout(function() {
						timer.start();
					}, 1000);
				}
			},
			
			reset: function() {
				section.removeClass('times-up').addClass('ticking');
				clock.removeClass('time-up').text(seconds.start);
				seconds.current = seconds.start;
				
				fields.removeAttr('disabled').filter(':first').focus();
				
				clearInterval(run);
				run = setTimeout(function() {
					timer.start();
				}, 1000);
				
				section.removeClass('times-up');
				msg.again.replaceWith(msg.el);
			}
		};
			
		/* Start timer */
		$('.custom-select').add(fields).focus(function() {
			if(!section.is('.ticking')) {
				section.addClass('ticking');
				msg.el.show();
				setTimeout(function() {
					timer.start();
				}, 1000);
			}
		});
		
		/* Try again button */
		section.delegate('.again', 'click', function() {
			timer.reset();
		});
	}
};

$(function() {
	Engine.init();
});