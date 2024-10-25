(function ($) {
	"use-strict";

	window.onload = function () {
		// set animations and smooth scroll only for pages, not for posts
		const bodyEl = document.body;
		const headerEl = document.querySelector("#header");

		let isSmoothScroll = true;

		if (bodyEl.classList.contains("single")) {
			isSmoothScroll = false;
		}

		if (!isSmoothScroll) {
			const scrollThreshold = 30;

			window.addEventListener("scroll", () => {
				if (window.scrollY > scrollThreshold) {
					if (!headerEl.classList.contains("--compact")) {
						headerEl.classList.add("--compact");
					}
				} else {
					if (headerEl.classList.contains("--compact")) {
						headerEl.classList.remove("--compact");
					}
				}
			});
		}

		// gsap is used for animations
		// controls the launch of animations by scrolling ScrollTrigger
		// Locomotive Scroll is used for smooth scrolling

		const containerEl = document.querySelector(".scroll-container");

		// Hang a smooth scroll on the site wrapper
		// FF can't work properly with virtual scroll
		let multiplier = 0.9;
		let lerp = 0.05;

		// for FF
		const ifFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
		// Safari 3.0+ "[object HTMLElementConstructor]"
		const isSafari =
			/constructor/i.test(window.HTMLElement) ||
			(function (p) {
				return p.toString() === "[object SafariRemoteNotification]";
			})(!window["safari"] || (typeof safari !== "undefined" && safari.pushNotification));

		// for mobile and tablets
		const mediaQuery = window.matchMedia("(max-width: 992px)");
		if (mediaQuery.matches) {
			multiplier = 2;
			lerp = 0.07;
		}

		const locoScroll = new LocomotiveScroll({
			el: containerEl,
			smooth: isSmoothScroll,
			lerp: lerp,
			multiplier: multiplier,
			touchMultiplier: 1.5,
			firefoxMultiplier: 100,
			smartphone: { smooth: true },
			tablet: { smooth: true },
		});

		gsap.registerPlugin(ScrollTrigger);
		gsap.registerPlugin(SplitText);

		locoScroll.on("scroll", ScrollTrigger.update);

		ScrollTrigger.scrollerProxy(containerEl, {
			scrollTop(value) {
				return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
			},

			getBoundingClientRect() {
				return {
					top: 0,
					left: 0,
					width: window.innerWidth,
					height: window.innerHeight,
				};
			},
			pinType: containerEl.style.transform ? "transform" : "fixed",
		});

		// styled cursor
		const sjgButton = document.querySelector(".sjg_button");
		const sjgPointer = document.querySelector(".sjg_pointer");

		const moveCircle = (e) => {
			gsap.to(sjgPointer, 0.25, {
				css: {
					left: e.clientX,
					top: e.clientY,
				},
			});

			gsap.to(sjgButton, 0.37, {
				css: {
					left: e.clientX,
					top: e.clientY,
				},
			});
		};

		bodyEl.addEventListener("mousemove", moveCircle);

		// header compact view
		if (isSmoothScroll) {
			ScrollTrigger.create({
				start: "top top",
				end: 99999,
				scroller: ".scroll-container",
				onUpdate: (self) => {
					if (containerEl.getBoundingClientRect().top.toFixed(3) > -100) {
						if (headerEl.classList.contains("--compact")) {
							headerEl.classList.remove("--compact");
						}
					} else {
						if (!headerEl.classList.contains("--compact")) {
							headerEl.classList.add("--compact");
						}
					}
				},
			});
		}

		const animatedTextNodes = document.querySelectorAll(".js-animated-text");

		if (animatedTextNodes.length) {
			animatedTextNodes.forEach((node) => {
				const paragraphs = node.querySelectorAll("p");

				node.style.opacity = 1;

				paragraphs.forEach((pNode) => {
					node.split = new SplitText(pNode, {
						type: "lines,words",
						linesClass: "split-line",
					});
				});
			});
		}

		const splitLettersNodes = document.querySelectorAll(".js-split-letters");

		if (splitLettersNodes.length) {
			splitLettersNodes.forEach((elem) => {
				elem.style.opacity = 1;
			});

			new SplitText(splitLettersNodes, {
				type: "words, chars",
			});
		}

		document.body.style.overflow = "";

		// Preloader
		const preloaderEl = document.querySelector(".preloader");
		const preloaderImageEl = document.querySelector(".preloader__img");

		if (preloaderEl) {
			locoScroll.stop();

			let preloaderPosition = {
				left: 16,
				top: 24,
				width: "142px",
			};

			if (window.innerWidth >= 768 && window.innerWidth < 992) {
				preloaderPosition.width = "180px";
			} else if (window.innerWidth >= 992) {
				preloaderPosition.left = 40;
				preloaderPosition.top = 32;
				preloaderPosition.width = "214px";
			}

			gsap.timeline().to(
				preloaderImageEl,
				{
					duration: 1,
					left: preloaderPosition.left,
					top: preloaderPosition.top,
					width: preloaderPosition.width,
					ease: "power2.out",
					onComplete: () => {
						preloaderEl.classList.add("--ready");

						locoScroll.start();
					},
				},
				0,
			);
		}

		// block: Hero title
		const heroTitleEl = document.querySelector(".hero-title");
		let heroTitlesAnimTL = null;

		heroTitlesAnim();

		function heroTitlesAnim() {
			if (heroTitleEl) {
				const heroTitles = heroTitleEl.querySelectorAll(".hero-title__text");
				let delay = heroTitleEl.dataset.delay ? Number(heroTitleEl.dataset.delay) : 0;

				if (heroTitlesAnimTL) {
					delay = 0;
					heroTitlesAnimTL.kill();
					gsap.set(heroTitles, { clearProps: "all" });
				}

				heroTitlesAnimTL = gsap.timeline({ delay: delay }).fromTo(
					heroTitles,
					{
						x: (index, target) => {
							let parentWidth = target.closest(".hero-title__row").clientWidth;
							let elemWidth = target.clientWidth;
							return (parentWidth - elemWidth) / 2;
						},
					},
					{
						duration: 0.9,
						ease: "power2.out",
						y: 0,
						stagger: 0.2,
						onComplete: () => {
							textAnimations(".hero-title", "90%");
						},
					},
					0,
				);

				if (heroTitleEl.classList.contains("large") || heroTitleEl.classList.contains("medium") || heroTitleEl.classList.contains("small")) {
					heroTitlesAnimTL.to(
						heroTitles,
						{
							x: (index, target) => {
								let parentWidth = target.closest(".hero-title__row").clientWidth;
								let elemWidth = target.clientWidth;
								return index % 2 === 0 ? 0 : parentWidth - elemWidth;
							},
							duration: 1.1,
							ease: "power2.inOut",
						},
						"1",
					);
				}
			}
		}

		// Block: Block with balls
		const blockWithBallsElems = document.querySelectorAll(".block-with-balls");

		if (blockWithBallsElems) {
			blockWithBallsElems.forEach((elem) => {
				const tickerEl = elem.querySelector(".block-with-balls__content");
				const delay = elem.dataset.delay ? Number(elem.dataset.delay) : 0;
				const ticker = scrollTicker(60, tickerEl);

				gsap.timeline({ delay: delay }).to(
					elem,
					{
						opacity: 1,
						duration: 1,
						ease: "power2.inOut",
					},
					0,
				);

				let tl = gsap.timeline({ paused: true }).to(tickerEl, { xPercent: -10 }, 0);

				ScrollTrigger.create({
					trigger: elem,
					start: "top bottom",
					end: "bottom top",
					scroller: ".scroll-container",
					// markers: true,
					animation: tl,
					scrub: 0.8,
					onEnter: () => {
						ticker.play();
					},
					onLeave: () => {
						ticker.pause();
					},
					onLeaveBack: () => {
						ticker.pause();
					},
					onEnterBack: () => {
						ticker.play();
					},
				});
			});
		}

		// Block: Animated title
		titlesAnimation(".animated-title", "98%", 0.035);
		setTimeout(() => {
			textAnimations(".animated-title", "90%");
		}, 2000);

		// Block: Our services
		const ourServicesEl = document.querySelector(".our-services");

		if (ourServicesEl) {
			const ourServicesCards = ourServicesEl.querySelector(".our-services__cards");

			const allowableShift = ourServicesCards.scrollWidth - window.innerWidth;

			const tl = gsap.timeline().to(
				ourServicesCards,
				{
					x: -allowableShift,
				},
				0,
			);

			ScrollTrigger.create({
				trigger: ourServicesEl,
				start: "top bottom",
				bottom: "bottom top",
				scroller: ".scroll-container",
				// markers: true,
				animation: tl,
				scrub: true,
			});
		}

		// Block: Title subtitle
		titlesAnimation(".title-subtitle__title", "80%", 0.035);

		// Block: Projects cards
		titlesAnimation(".projects-cards__title", "98%");

		const projectsCardsEl = document.querySelector(".projects-cards__content");

		if (projectsCardsEl) {
			ScrollTrigger.matchMedia({
				"(min-width: 768px)": function () {
					gsap.utils.toArray(".projects-cards__column").forEach((column, index) => {
						const scrubValue = column.dataset.scrub || 1;
						const speedValue = column.dataset.speed || 1;
						const direction = index % 2 === 0 ? `+=${100 * speedValue}%` : `-=${100 * speedValue}%`;

						gsap.to(column, {
							y: direction,
							ease: "none",
							scrollTrigger: {
								scroller: ".scroll-container",
								trigger: projectsCardsEl,
								start: "top bottom",
								end: "bottom top",
								scrub: scrubValue,
							},
						});
					});
				},

				"(max-width: 767px)": function () {
					gsap.utils.toArray(".projects-cards__column").forEach((column, index) => {
						const scrubValue = column.dataset.scrub || 1;
						const speedValue = column.dataset.speed || 1;
						const direction = index % 2 === 0 ? `+=${100 * speedValue + 50}%` : `-=${100 * speedValue + 50}%`;

						gsap.to(column, {
							x: direction,
							ease: "none",
							scrollTrigger: {
								scroller: ".scroll-container",
								trigger: projectsCardsEl,
								start: "top bottom",
								end: "bottom top",
								scrub: scrubValue,
							},
						});
					});
				},
			});
		}

		// Block: Block with balls and info slides
		titlesAnimation(".block-with-balls-and-info", "98%");

		const blockWithBallsAndInfoContent = document.querySelector(".block-with-balls-and-info__content");

		if (blockWithBallsAndInfoContent) {
			// add balls to browser window width
			// get block sizes
			const spacingBetweenBlocks = 6;
			const emptyBallWidth = blockWithBallsAndInfoContent.querySelector(".js-empty-ball").offsetWidth + spacingBetweenBlocks * 2;
			const ballWithTextWidth = blockWithBallsAndInfoContent.querySelector(".js-not-empty-ball").offsetWidth + spacingBetweenBlocks * 2;
			// Width of already added blocks
			const initialWidth = 2 * emptyBallWidth + ballWithTextWidth;
			// Calculate the remaining width
			const remainingWidth = window.innerWidth - initialWidth;

			// Calculate the number of additional emptyBallWidth blocks
			let additionalEmptyBalls = Math.ceil(remainingWidth / emptyBallWidth);
			// min balls for adding - 3
			if (additionalEmptyBalls < 3) {
				additionalEmptyBalls = 3;
			}
			if (additionalEmptyBalls % 2 === 0) {
				additionalEmptyBalls += 1;
			}

			const fragment = document.createDocumentFragment();

			for (let i = 0; i < additionalEmptyBalls; i++) {
				const newBall = document.createElement("div");
				newBall.classList.add("block-with-balls-and-info__circle");
				fragment.appendChild(newBall);
			}

			const ballsContainers = document.querySelectorAll(".block-with-balls-and-info__balls");
			ballsContainers.forEach((container) => {
				container.appendChild(fragment.cloneNode(true));
			});

			// animations
			const balls = gsap.utils.toArray(blockWithBallsAndInfoContent.querySelectorAll(".block-with-balls-and-info__balls"));
			const slides = blockWithBallsAndInfoContent.querySelector(".block-with-balls-and-info__slides");

			let previousSlideIndex = 0;
			let ticker = null;

			gsap.to(balls, {
				x: () => -1 * (blockWithBallsAndInfoContent.scrollWidth - innerWidth),
				ease: "none",
				scrollTrigger: {
					scroller: ".scroll-container",
					trigger: blockWithBallsAndInfoContent,
					pin: true,
					start: "top 61px", // header height
					scrub: 1,
					// markers: true,
					end: () => "+=" + (blockWithBallsAndInfoContent.scrollWidth - innerWidth),
					onUpdate: (self) => {
						const currentSlideIndex = Math.floor(self.progress * (balls.length - 1));

						if (currentSlideIndex !== slides.children.length) {
							Array.from(slides.children).forEach((child) => {
								child.classList.remove("--active");
							});

							slides.children[currentSlideIndex].classList.add("--active");
						}

						previousSlideIndex = currentSlideIndex;
					},
					onEnter: () => {
						ticker.play();
					},
					onLeave: () => {
						ticker.pause();
					},
					onLeaveBack: () => {
						ticker.pause();
					},
					onEnterBack: () => {
						ticker.play();
					},
				},
			});

			// title-and-text
			const titleAndTextElem = document.querySelector(".title-and-text");

			if (titleAndTextElem) {
				const tickerEl = titleAndTextElem.querySelector(".title-and-text__ticker");

				ticker = scrollTicker(65, tickerEl);
			}
		}

		// Block: Content section one
		const contentSectOneEl = document.querySelector(".content-sect-one");

		if (contentSectOneEl) {
			titlesAnimation(".content-sect-one", "98%", 0.035);
			textAnimations(".content-sect-one", "90%");

			// Spotlight on the image
			const imgBlock = contentSectOneEl.querySelector(".content-sect-one__img");
			const mask = imgBlock.querySelector(".content-sect-one__img-mask");

			const centerX = imgBlock.clientWidth / 2;
			const centerY = imgBlock.clientHeight / 2;

			let mouseX = centerX;
			let mouseY = centerY;
			let targetX = centerX;
			let targetY = centerY;
			const easing = 0.1;

			function animate() {
				mouseX += (targetX - mouseX) * easing;
				mouseY += (targetY - mouseY) * easing;

				mask.style.setProperty("--mouse-x", mouseX + "px");
				mask.style.setProperty("--mouse-y", mouseY + "px");

				requestAnimationFrame(animate);
			}

			requestAnimationFrame(animate);

			imgBlock.addEventListener("pointermove", (pos) => {
				const rect = imgBlock.getBoundingClientRect();

				targetX = pos.clientX - rect.left;
				targetY = pos.clientY - rect.top;
			});

			imgBlock.addEventListener("pointerleave", () => {
				targetX = centerX;
				targetY = centerY;
			});
		}

		// Block: Block: Content section two
		const contentSectTwoEl = document.querySelector(".content-sect-two");

		if (contentSectTwoEl) {
			const title = contentSectTwoEl.querySelector(".content-sect-two__title");

			if (title) {
				const allLetters = title.querySelectorAll("div > div");
				const textLabelOne = contentSectTwoEl.querySelector(".js-img-label-0");
				const textLabelTwo = contentSectTwoEl.querySelector(".js-img-label-1");
				const textLabelThree = contentSectTwoEl.querySelector(".js-img-label-2");

				gsap
					.timeline({
						scrollTrigger: {
							scroller: ".scroll-container",
							trigger: contentSectTwoEl,
							start: "top top",
							end: "+=150%",
							pin: true,
							scrub: 0.1,
							// markers: true,
							onEnter: () => {
								textLabelOne.classList.add("--ready");
							},
							onUpdate: (self) => {
								if (self.progress >= 0.5 && !self.middleLogged) {
									textLabelTwo.classList.add("--ready");
									self.middleLogged = true;
								}
							},
							onLeave: () => {
								textLabelThree.classList.add("--ready");
							},
						},
					})
					.set(
						allLetters,
						{
							color: "#575756",
							stagger: 0.1,
						},
						0.1,
					);
			}
		}

		// Block: Content section three
		titlesAnimation(".content-sect-three", "98%", 0.035);
		textAnimations(".content-sect-three", "90%");

		// Block: Content section four
		const contentSectFourElems = document.querySelectorAll(".content-sect-four");

		if (contentSectFourElems) {
			titlesAnimation(".content-sect-four", "98%");
			textAnimations(".content-sect-four", "90%");

			contentSectFourElems.forEach((elem) => {
				const tickerElems = elem.querySelectorAll(".content-sect-four__titles");

				tickerElems.forEach((tickerElem) => {
					const ticker = scrollTicker(60, tickerElem);

					let tl = gsap.timeline({ paused: true }).to(tickerElem, { xPercent: -20 }, 0);

					ScrollTrigger.create({
						trigger: elem,
						start: "top bottom",
						end: "bottom top",
						scroller: ".scroll-container",
						// markers: true,
						animation: tl,
						scrub: 0.8,
						onEnter: () => {
							ticker.play();
						},
						onLeave: () => {
							ticker.pause();
						},
						onLeaveBack: () => {
							ticker.pause();
						},
						onEnterBack: () => {
							ticker.play();
						},
					});
				});
			});
		}

		// Block: Team member
		titlesAnimation(".team-member", "98%");

		// Block: Client work
		const clientWorkEl = document.querySelector(".client-work");

		if (clientWorkEl) {
			const categoriesLinks = clientWorkEl.querySelectorAll(".client-work__link a");

			titlesAnimation(".client-work", "98%", 0.035);

			const tl = gsap.timeline({ delay: 1.5 });

			tl.to(".client-work__text-inner", {
				translateY: 0,
				duration: 1,
				stagger: 0,
				ease: "power2.out",
			})
				.to(
					categoriesLinks,
					{
						translateY: 0,
						duration: 0.4,
						stagger: 0.1,
						ease: "power2.out",
					},
					"-=.9",
				)
				.to(
					".js-post-cards-wrap",
					{
						translateY: 0,
						opacity: 1,
						duration: 1,
						ease: "power2.out",
					},
					"+=0.1",
				);
		}

		// Page: Services
		const pageServicesEl = document.querySelector(".page-services");

		if (pageServicesEl) {
			pageServicesEl.classList.add("--ready");
		}

		// Block: Block services
		const blockServicesEl = document.querySelector(".services");

		if (blockServicesEl) {
			const blockServicesRows = blockServicesEl.querySelectorAll(".services__list-item");

			if (blockServicesRows.length) {
				blockServicesRows.forEach((elem, index) => {
					const title = elem.querySelector(".services__list-item-title");
					const text = elem.querySelector(".services__list-item-text");

					const delay = blockServicesEl.dataset.delay && index < 1 ? Number(blockServicesEl.dataset.delay) : 0;

					const tl = gsap.timeline({ delay: delay });

					tl.to(title, {
						translateY: 0,
						opacity: 1,
						duration: 1.5,
						ease: "power2.out",
					}).to(
						text,
						{
							translateY: 0,
							opacity: 1,
							duration: 1,
							ease: "power2.out",
						},
						0.3,
					);

					ScrollTrigger.create({
						trigger: elem,
						start: "top 80%",
						end: "bottom top",
						scroller: ".scroll-container",
						// markers: true,
						animation: tl,
					});
				});
			}
		}

		// Block: Team members
		const teamMembersEls = document.querySelectorAll(".team-members");

		if (teamMembersEls.length) {
			teamMembersEls.forEach((elem, index) => {
				const photoLeftCards = elem.querySelectorAll(".js-photo-left");

				if (photoLeftCards.length) {
					photoLeftCards.forEach((card) => {
						const img = card.querySelector(".team-members__item-image");
						const textRows = card.querySelectorAll(".js-team-members-text");

						const tl = gsap
							.timeline()
							.to(
								img,
								{
									translateX: 0,
									opacity: 1,
									duration: 1.5,
									ease: "power2.out",
								},
								0,
							)
							.to(
								textRows,
								{
									translateY: 0,
									duration: 1,
									stagger: 0.2,
									ease: "power2.out",
								},
								0.6,
							);

						ScrollTrigger.create({
							trigger: card,
							start: "top 80%",
							bottom: "bottom top",
							scroller: ".scroll-container",
							// markers: true,
							animation: tl,
							onEnter: () => {
								card.classList.add("--ready");
							},
						});
					});
				}

				const photoRightCards = elem.querySelectorAll(".js-photo-right");

				if (photoRightCards.length) {
					photoRightCards.forEach((card) => {
						const img = card.querySelector(".team-members__item-image");
						const textRows = card.querySelectorAll(".js-team-members-text");

						const tl = gsap
							.timeline()
							.to(
								img,
								{
									translateX: 0,
									opacity: 1,
									duration: 1.5,
									ease: "power2.out",
								},
								0,
							)
							.to(
								textRows,
								{
									translateY: 0,
									duration: 1,
									stagger: 0.2,
									ease: "power2.out",
								},
								0.6,
							);

						ScrollTrigger.create({
							trigger: card,
							start: "top 80%",
							bottom: "bottom top",
							scroller: ".scroll-container",
							// markers: true,
							animation: tl,
							onEnter: () => {
								card.classList.add("--ready");
							},
						});
					});
				}
			});
		}

		// Block: Navigation
		const navigationEl = document.querySelector(".navigation");

		if (navigationEl) {
			const delay = navigationEl.dataset.delay ? Number(navigationEl.dataset.delay) : 0;

			setTimeout(() => {
				navigationEl.classList.add("--ready");
			}, delay * 1000);
		}

		// Block: Two columns
		const twoColumnsEls = document.querySelectorAll(".two-columns");

		if (twoColumnsEls.length) {
			twoColumnsEls.forEach((elem) => {
				const delay = elem.dataset.delay ? Number(elem.dataset.delay) * 1000 : 0;

				horizontalAnimation(elem, delay);
			});
		}

		// Block: Two columns repeater
		const twoColumnsRepeaterEls = document.querySelectorAll(".two-columns-repeater");

		if (twoColumnsRepeaterEls.length) {
			twoColumnsRepeaterEls.forEach((elem) => {
				const delay = elem.dataset.delay ? Number(elem.dataset.delay) * 1000 : 0;

				horizontalAnimation(elem, delay);
			});
		}

		// Block: Text modal list
		const textModalListEl = document.querySelector(".text-modal-list");

		if (textModalListEl) {
			const list = document.querySelectorAll(".text-modal-list__list-item");

			const tl = gsap.timeline().to(list, {
				translateY: 0,
				opacity: 1,
				duration: 1.5,
				stagger: 0.2,
				ease: "power2.out",
			});

			ScrollTrigger.create({
				trigger: textModalListEl,
				start: "top 80%",
				bottom: "bottom top",
				scroller: ".scroll-container",
				// markers: true,
				animation: tl,
			});
		}

		// Block: Audio modal
		horizontalAnimation(document.querySelector(".audio-modal"));

		// Block: Contact
		horizontalAnimation(document.querySelector(".contact"));

		// Block: Contact secondary
		horizontalAnimation(document.querySelector(".contact-secondary"));

		// Page: Services
		const pageNewsEl = document.querySelector(".app-blog");

		if (pageNewsEl) {
			pageNewsEl.classList.add("--ready");

			const links = pageNewsEl.querySelectorAll(".app-blog__categories-item a");

			const tl = gsap.timeline({ delay: 1.5 });

			tl.to(
				links,
				{
					translateY: 0,
					duration: 0.4,
					stagger: 0.1,
					ease: "power2.out",
				},
				"-=.9",
			);
		}

		// Helper functions
		function titlesAnimation(triggerNode, startPos = "top", speed = 0.05) {
			const parent = document.querySelector(triggerNode);

			if (!parent) return false;

			const titleNodes = parent.querySelectorAll(".js-split-letters > div > div");
			const delay = parent.dataset.delay ? Number(parent.dataset.delay) : 0;

			const anim = gsap.timeline({ delay: delay }).from(titleNodes, {
				opacity: 0,
				y: 50,
				ease: "back(4)",
				stagger: speed,
			});

			anim.pause();

			ScrollTrigger.create({
				trigger: triggerNode,
				start: `top ${startPos}`,
				bottom: "bottom top",
				scroller: ".scroll-container",
				once: true,
				// markers: true,
				onToggle: (self) => {
					if (!self.isActive) return false;
					anim.play();
				},
				scrub: true,
			});
		}

		function textAnimations(triggerNode, startPos = "80%") {
			const parent = document.querySelector(triggerNode);

			if (!parent) return false;

			const textNodes = parent.querySelectorAll(".js-animated-text div > div");
			const delay = parent.dataset.delay ? Number(parent.dataset.delay) : 0;

			const anim = gsap.timeline({ delay: delay }).to(textNodes, {
				duration: 0.7,
				// force3D: true,
				translateY: 0,
				translateX: 0,
				rotation: 0,
				ease: "circ.out",
				stagger: 0.03,
			});

			anim.pause();

			ScrollTrigger.create({
				trigger: triggerNode,
				start: `top ${startPos}`,
				bottom: "bottom top",
				scroller: ".scroll-container",
				once: true,
				// markers: true,
				onToggle: (self) => {
					if (!self.isActive) return false;
					anim.play();
				},
				scrub: true,
			});
		}

		// ticker function
		function scrollTicker(speed, wrapper) {
			if (!wrapper) return;

			let items = wrapper.querySelector(".js-ticker-row");
			let cloned = items.cloneNode(true);

			wrapper.appendChild(cloned);

			let tickerLocal = gsap.timeline().to(wrapper, {
				x: -cloned.offsetWidth,
				repeat: -1,
				duration: speed,
				ease: Linear.easeNone,
			});

			tickerLocal.pause();

			return tickerLocal;
		}

		function horizontalAnimation(parent, delay = 0) {
			if (!parent) return;

			const leftElems = parent.querySelectorAll(".js-fade-left");
			const rightElems = parent.querySelectorAll(".js-fade-right");

			setTimeout(() => {
				if (leftElems.length) {
					leftElems.forEach((elem, index) => {
						const tl1 = gsap.timeline().to(elem, {
							translateX: 0,
							opacity: 1,
							duration: 0.5,
							ease: "power2.out",
							delay: index * 0.2,
						});

						ScrollTrigger.create({
							trigger: elem,
							start: "top bottom",
							end: "bottom top",
							scroller: ".scroll-container",
							// markers: true,
							animation: tl1,
						});
					});
				}

				if (rightElems.length) {
					rightElems.forEach((elem, index) => {
						const tl2 = gsap.timeline().to(elem, {
							translateX: 0,
							opacity: 1,
							duration: 0.5,
							ease: "power2.out",
							delay: index * 0.2,
						});

						ScrollTrigger.create({
							trigger: elem,
							start: "top bottom",
							end: "bottom top",
							scroller: ".scroll-container",
							// markers: true,
							animation: tl2,
						});
					});
				}
			}, delay);
		}

		// smooth scroll to id without adding data in hash
		$('a[href*="#"]').on("click", function (e) {
			if ($(this.hash).length) {
				e.preventDefault();
				locoScroll.scrollTo(document.querySelector(this.hash));
			}
		});

		// smooth scroll to id when page loaded
		if (location.hash) {
			setTimeout(() => {
				locoScroll.scrollTo(document.querySelector(location.hash));
			}, 1000);
		}

		ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

		ScrollTrigger.refresh();

		// update animations when window resized with debounce
		function debounce(func, wait) {
			let timeout;
			return function (...args) {
				clearTimeout(timeout);
				timeout = setTimeout(() => func.apply(this, args), wait);
			};
		}

		const handleResize = debounce(() => {
			heroTitlesAnim();
		}, 200);

		window.addEventListener("resize", handleResize);

		const resizeObserver = new ResizeObserver(() => {
			ScrollTrigger.refresh();
		});

		resizeObserver.observe(containerEl);
	};
})(jQuery);
