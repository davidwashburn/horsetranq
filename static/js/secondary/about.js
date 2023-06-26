/* DEPENDENCY - SMOOTH SCROLLING */
// utility functions
if(!Util) function Util () {};

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;
        var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};


Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
	var SmoothScroll = function(element) {
		if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
		this.element = element;
		this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
		this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
		this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
		this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
		this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
		this.initScroll();
	};

	SmoothScroll.prototype.initScroll = function() {
		var self = this;

		//detect click on link
		this.element.addEventListener('click', function(event){
			event.preventDefault();
			var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
				target = document.getElementById(targetId),
				targetTabIndex = target.getAttribute('tabindex'),
				windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

			// scroll vertically
			if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

			var scrollElementY = self.dataElementY ? self.scrollElementY : false;

			var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
			Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
				// scroll horizontally
				self.scrollHorizontally(target, fixedHeight);
				//move the focus to the target element - don't break keyboard navigation
				Util.moveFocus(target);
				history.pushState(false, false, '#'+targetId);
				self.resetTarget(target, targetTabIndex);
			}, scrollElementY);
		});
	};

	SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
    var scrollEl = this.dataElementX ? this.scrollElementX : false;
    var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
    var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
      duration = this.scrollDuration;

    var element = scrollEl || window;
    var start = element.scrollLeft || document.documentElement.scrollLeft,
      currentTime = null;

    if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
		// return if there's no need to scroll
    if(Math.abs(start - final) < 5) return;
        
    var animateScroll = function(timestamp){
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeInOutQuad(progress, start, final-start, duration);
      element.scrollTo({
				left: val,
			});
      if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

	SmoothScroll.prototype.resetTarget = function(target, tabindex) {
		if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}	
	};

	SmoothScroll.prototype.getFixedElementHeight = function() {
		var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
    var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
		if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
			fixedElementDelta = 0;
			var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
			if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
		}
		return fixedElementDelta;
	};
	
	//initialize the Smooth Scroll objects
	var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
	if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
		// you need javascript only if css scroll-behavior is not supported
		for( var i = 0; i < smoothScrollLinks.length; i++) {
			(function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
		}
	}
}());

/* DEPENDENCY - TABLE OF CONTENTS */
// utility functions
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _2_table-of-contents
// Usage: codyhouse.co/license
(function() {
  var Toc = function(element) {
		this.element = element;
    this.list = this.element.getElementsByClassName('js-toc__list')[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.controller = this.element.getElementsByClassName('js-toc__control');
    this.controllerLabel = this.element.getElementsByClassName('js-toc__control-label');
    this.content = getTocContent(this);
    this.clickScrolling = false;
    this.intervalID = false;
    this.staticLayoutClass = 'toc--static';
    this.contentStaticLayoutClass = 'toc-content--toc-static';
    this.expandedClass = 'toc--expanded';
    this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
    this.layout = 'static';
    initToc(this);
  };

  function getSections(toc) {
    var sections = [];
    // get all content sections
    for(var i = 0; i < toc.anchors.length; i++) {
      var section = document.getElementById(toc.anchors[i].getAttribute('href').replace('#', ''));
      if(section) sections.push(section);
    }
    return sections;
  };

  function getTocContent(toc) {
    if(toc.sections.length < 1) return false;
    var content = toc.sections[0].closest('.js-toc-content');
    return content;
  };

  function initToc(toc) {
    checkTocLayour(toc); // switch between mobile and desktop layout
    if(toc.sections.length > 0) {
      // listen for click on anchors
      toc.list.addEventListener('click', function(event){
        var anchor = event.target.closest('a[href^="#"]');
        if(!anchor) return;
        // reset link apperance 
        toc.clickScrolling = true;
        resetAnchors(toc, anchor);
        // close toc if expanded on mobile
        toggleToc(toc, true);
      });

      // check when a new section enters the viewport
      var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
      if(intersectionObserverSupported) {
        var observer = new IntersectionObserver(
          function(entries, observer) { 
            entries.forEach(function(entry){
              if(!toc.clickScrolling) { // do not update classes if user clicked on a link
                getVisibleSection(toc);
              }
            });
          }, 
          {
            threshold: [0, 0.1],
            rootMargin: "0px 0px -70% 0px"
          }
        );

        for(var i = 0; i < toc.sections.length; i++) {
          observer.observe(toc.sections[i]);
        }
      }

      // detect the end of scrolling -> reactivate IntersectionObserver on scroll
      toc.element.addEventListener('toc-scroll', function(event){
        toc.clickScrolling = false;
      });
    }

    // custom event emitted when window is resized
    toc.element.addEventListener('toc-resize', function(event){
      checkTocLayour(toc);
    });

    // collapsed version only (mobile)
    initCollapsedVersion(toc);
  };

  function resetAnchors(toc, anchor) {
    if(!anchor) return;
    for(var i = 0; i < toc.anchors.length; i++) Util.removeClass(toc.anchors[i], 'toc__link--selected');
    Util.addClass(anchor, 'toc__link--selected');
  };

  function getVisibleSection(toc) {
    if(toc.intervalID) {
      clearInterval(toc.intervalID);
    }
    toc.intervalID = setTimeout(function(){
      var halfWindowHeight = window.innerHeight/2,
      index = -1;
      for(var i = 0; i < toc.sections.length; i++) {
        var top = toc.sections[i].getBoundingClientRect().top;
        if(top < halfWindowHeight) index = i;
      }
      if(index > -1) {
        resetAnchors(toc, toc.anchors[index]);
      }
      toc.intervalID = false;
    }, 100);
  };

  function checkTocLayour(toc) {
    if(toc.isStatic) return;
    toc.layout = getComputedStyle(toc.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(toc.element, toc.staticLayoutClass, toc.layout == 'static');
    if(toc.content) Util.toggleClass(toc.content, toc.contentStaticLayoutClass, toc.layout == 'static');
  };

  function initCollapsedVersion(toc) { // collapsed version only (mobile)
    if(toc.controller.length < 1) return;
    
    // toggle nav visibility
    toc.controller[0].addEventListener('click', function(event){
      var isOpen = Util.hasClass(toc.element, toc.expandedClass);
      toggleToc(toc, isOpen);
    });

    // close expanded version on esc
    toc.element.addEventListener('keydown', function(event){
      if(toc.layout == 'static') return;
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
        toggleToc(toc, true);
        toc.controller[0].focus();
      }
    });
  };

  function toggleToc(toc, bool) { // collapsed version only (mobile)
    if(toc.controller.length < 1) return;
    // toggle mobile version
    Util.toggleClass(toc.element, toc.expandedClass, !bool);
    bool ? toc.controller[0].removeAttribute('aria-expanded') : toc.controller[0].setAttribute('aria-expanded', 'true');
    if(!bool && toc.anchors.length > 0) {
      toc.anchors[0].focus();
    }
  };
  
  var tocs = document.getElementsByClassName('js-toc');

  var tocsArray = [];
	if( tocs.length > 0) {
		for( var i = 0; i < tocs.length; i++) {
			(function(i){ tocsArray.push(new Toc(tocs[i])); })(i);
    }

    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      resizeId = false,
      scrollEvent = new CustomEvent('toc-scroll'),
      resizeEvent = new CustomEvent('toc-resize');
      
    window.addEventListener('scroll', function() {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    window.addEventListener('resize', function() {
      clearTimeout(resizeId);
      scrollId = setTimeout(doneResizing, 100);
    });

    function doneScrolling() {
      for( var i = 0; i < tocsArray.length; i++) {
        (function(i){tocsArray[i].element.dispatchEvent(scrollEvent)})(i);
      };
    };

    function doneResizing() {
      for( var i = 0; i < tocsArray.length; i++) {
        (function(i){tocsArray[i].element.dispatchEvent(resizeEvent)})(i);
      };
    };
  }
}());

/* DEPENDENCY - ACCORDION */
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion'+this.version+'__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = this.items[i].classList.contains(this.showClass) ? 'true' : 'false';
			button.setAttribute('aria-expanded', isOpen);
			button.setAttribute('aria-controls', 'accordion-content-'+i);
			button.setAttribute('id', 'accordion-header-'+i);
			button.classList.add('js-accordion__trigger');
			content.setAttribute('aria-labelledby', 'accordion-header-'+i);
			content.setAttribute('id', 'accordion-content-'+i);
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if(!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) item.classList.add(this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		item.classList.toggle(this.showClass, !bool);
		content.removeAttribute("style");
		if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Array.prototype.indexOf.call(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(this.items[i].classList.contains(this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if(openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if(!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
		if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function(){trigger.scrollIntoView(true);});
		}
	};

	function getChildrenByClassName(el, className) {
		var children = el.children,
    childrenByClass = [];
		for (var i = 0; i < children.length; i++) {
			if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
		}
		return childrenByClass;
	};

	window.Accordion = Accordion;
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
