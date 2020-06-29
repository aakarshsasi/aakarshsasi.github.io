var firstInit = true;

function mobileConditions() {
	return !($(window).width() > 900 && $(window).height() < $(window).width());
}

function bgInit(useCSSbg) {	
	$('.works-card').each(function() {
		var $el = $(this);
		
		if(firstInit) {
			var bg =  $el.css('background-image');
			if(bg == 'none') bg = $el.css('background-color');
			$el.attr('data-bg', bg);
			var el = $('<div class="bg"></div>');
			el.css('background', bg);
			$('.bg-scroller').append(el);
		}
		
		
		if(useCSSbg) {
			$el.css('background', $el.attr('data-bg'));
			$el.find('.text-container').css('opacity', '1');
		}
		else {
			$el.css('background', '');
		}
	});
	
	firstInit = false;
}

bgInit(false);

var scrolledWindows, minBg, maxBg, delta, ogDelta;

function calculateBg() {
	if(!mobileConditions()) {
		bgInit(false);
		
		$('.bg-scroller').find('.bg').each(function() {
			$(this).css('opacity', '0');
		});

		scrolledWindows = $(window).scrollTop() / $(window).height();
		// start hax: subtract number of sections above changing background 
		scrolledWindows -= $($('.works-card')[0]).offset().top / $(window).height();
		scrolledWindows = Math.max(scrolledWindows, 0);
		// end hax
		minBg = Math.floor(scrolledWindows);
		maxBg = minBg + 1;
		delta = scrolledWindows - minBg;
		ogDelta = delta;
		if(delta < 0.4) {
			delta = 0;
		}
		else if(delta < 0.6) {
			delta = 5*(delta-0.4);
		}
		else {
			delta = 1;
		}

		delta = -1 * Math.cos(delta/1 * (Math.PI/2)) + 1;
		
		$('.bg-scroller').find('.bg:nth-child(' + (minBg+1) + ')').css('opacity', 1);
		$('.bg-scroller').find('.bg:nth-child(' + (maxBg+1) + ')').css('opacity', delta);


		$('.works-card:nth-child(' + (minBg+2) + ') .text-container').css({
			opacity: 1 - delta,
		});
		$('.works-card:nth-child(' + (maxBg+2) + ') .text-container').css({
			opacity: delta,
		});
	}
	
	else {
		bgInit(true);
	}
}

calculateBg();

var timer;

$(window).on('scroll', function() {
	scrollAnimations();

	clearTimeout(timer);

	timer = setTimeout(function() {
		var sections = $('section');

		var hash = '';

		sections.each(function() {
			var $el = $(this);
			var viewportPos = ($(window).scrollTop() - $el.offset().top) / $(window).height();

			if(viewportPos < 0.4 && viewportPos > -0.6) {
				hash = $el.attr('id');
			} 
		});

		if(hash) {
			history.replaceState({
				page: hash
			}, $('title').html(), '#' + hash);
		}
	}, 200);
});

function scrollAnimations() {
	calculateBg();

	if(!mobileConditions()) {
		$('.main h1, .main h3').each(function() {
			var scrolledFrac = $(window).scrollTop() / $(window).height();
			$(this).css({
				opacity: Math.min(1, 1.2 - 1.5*scrolledFrac),
				position: 'relative',
				// fun fact: using transforms here causes weird rendering bugs in Chrome
				top: (scrolledFrac * $(window).height() / 2) + 'px'
			});
		});
	}
}

var canvas = $('canvas#bg')[0];

canvas.width = $(window).width();
canvas.height = $(window).height();

var ctx = canvas.getContext('2d');

$(window).on('resize', function() {
	canvas.width = $(window).width();
	canvas.height = $(window).height();
})

function Point() {
	var p = this;
	
	var r = 8;
	
	// progress below 0 is neglected, negative initial
	// progress serves to introduce random delays - 
	// at 0.05 progress points per second, for example
	// a dot with initial progress -0.15 will run 2 frames
	// after a dot with initial progress -0.05
	var initialProgress = -4 * Math.random();
	
	// moves point to a random location and 
	// resets its progress
	this.init = function() {
		p.x = Math.random() * canvas.width;
		p.y = Math.random() * canvas.height;
		p.progress = initialProgress;
	}
	
	this.draw = function() {
		if(p.progress >= 0) {
			// opacity of of dot changes with progress
			ctx.fillStyle = 'rgba(0,0,0,' + Math.sqrt(p.progress*0.005) + ')';
			ctx.beginPath();
			// radius calculation: maps progress from [0, 1] to [0, pi],
			// then takes sine of that to get an increase, then decrease
			// in radius. absolute value to prevent floating point errors
			// accidentally causing negative sine values which cause ctx.arc
			// to throw errors
			ctx.arc(p.x, p.y, Math.abs(Math.sin(Math.PI*p.progress)*r), 0, 2*Math.PI);
			ctx.fill();
		}
	};
	this.render = function() {
		// stars come faster than they go
		// so user can look at them longer
		// i guess? idk this just looked pretty
		if(p.progress > 0.5)
			p.progress += 0.005;
		else
			p.progress += 0.05;
		p.draw();
		if(p.progress >= 1) p.init();
	}
}
var dots = [];

var n = 20;

for(var i = 0; i < n; i++) {
	dots[i] = new Point();
	dots[i].init();
}

function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < n; i++) {
		dots[i].render();
	}
		
	requestAnimationFrame(loop);
}

loop();

var sentences = [
	'Tried typing NOX?',
	'Best viewed in Visual Studio Code.',
	'sh -c "$(curl -sL https://aakarsh.github.io/test.sh)"',
	'This text is subject to change.',
	'Alliteration alert!',
	'Boolean logic jokes are funny, whether you laugh xor not.',
];

var counter = 1;

var ticker = $("footer .ticker");

function changeText() {
	var el = ticker,
		text = sentences[counter],
		oldText = el.text();

	var x = setInterval(function() {
		if(oldText.length != 0) {
			oldText = oldText.slice(0, -1);
			el.text(oldText);
		}
		else {
			setTimeout(function() {
				var y = setInterval(function() {
					if(el.text().length != text.length) {
						el.text(text.slice(0, el.text().length+1));
					}
					else {
						setTimeout(function() {
							if(counter >= sentences.length - 1)
								counter = 0;
							else
								counter++;

							changeText();
						}, 5000);
						clearInterval(y);
					}
				}, 60);
			}, 60);
			clearInterval(x);
		}
	}, 60);
}

ticker.html(sentences[0]);

setTimeout(changeText, 5000);

$('a[href^="#"]').on('click', function(e) {
	e.preventDefault();

	var el = $($(this).attr('href'));

	var distance = Math.abs($(window).scrollTop() - $(el).offset().top);

	var time = Math.floor( Math.sqrt(distance / $(document).height()) * 1500 );

	$('html, body').animate({
		scrollTop: el.offset().top
	}, time);
});

// slight convenience: fix the header section with my correct age automatically

var ages = [
	{
		year: 2020,
		number: ' twenty one'
	},
	{
		year: 2021,
		number: 'twenty two'
	},
	{
		year: 2022,
		number: ' twenty three',
	},
	{
		year: 2023,
		number: ' twenty four',
		extend: true
	},
	{
		year: 2031,
		number: ' thirty',
		extend: true
	},
	// should not be using this website past this age probably hmm
	{
		year: 2041,
		number: ' &lt;insert big-ass number&gt;',
	}
];

for(var i = ages.length - 1; i >= 0; i--) {
	var bday = new Date('04/23/' + ages[i].year),
		today = new Date();

	if(bday.getTime() <= today.getTime()) {
		var str = ages[i].number;

		if(ages[i].extend) {
			var numbers = ['', ' one', ' two', ' three', ' four', ' five', ' six', ' seven', ' eight', ' nine'];

			var n = today.getFullYear() - bday.getFullYear();

			str += numbers[n];
		}

		$('.age').html(str);

		break;
	}
}

// easter egg

var sequences = [
	[ 78, 79, 88 ],
	[ 76, 85, 77, 79, 83 ],
];

var mode = 0;

var eei = 0;

$(window).on('keyup', function(e) {
	var sequence = sequences[mode];
	if(e.keyCode == sequence[eei]) {
		eei++;
	}

	else {
		eei = 0;
	}

	if(eei == sequence.length) {
		if(mode === 1) {
			$('body').removeClass('dark-mode');
			mode = 0;
		}
		else {
			$('body').addClass('dark-mode');
			mode = 1;
		}
		eei = 0;
	}
})