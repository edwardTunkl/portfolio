import * as THREE from 'three';
import Experience from '../Experience.js';
import GSAP from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import ASScroll from '@ashthornton/asscroll';

export default class Controls {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.room = this.experience.world.room.actualRoom;
    this.room.children.forEach((child) => {
      if (child.type === 'RectAreaLight' && child.width === 0.6) {
        this.rectLight = child;
      }
    });
    this.circleFirst = this.experience.world.floor.circleFirst;
    this.circleSecond = this.experience.world.floor.circleSecond;
    this.circleThird = this.experience.world.floor.circleThird;

    GSAP.registerPlugin(ScrollTrigger);

    document.querySelector('.page').style.overflow = 'visible';

    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.setSmoothScroll();
    }
    this.setScrollTrigger();
  }

  setupASScroll() {
    // https://github.com/ashthornton/asscroll
    const asscroll = new ASScroll({
      ease: 0.5,
      disableRaf: true,
    });

    GSAP.ticker.add(asscroll.update);

    ScrollTrigger.defaults({
      scroller: asscroll.containerElement,
    });

    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
      scrollTop(value) {
        if (arguments.length) {
          asscroll.currentPos = value;
          return;
        }
        return asscroll.currentPos;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      fixedMarkers: true,
    });

    asscroll.on('update', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', asscroll.resize);

    requestAnimationFrame(() => {
      asscroll.enable({
        newScrollElements: document.querySelectorAll('.gsap-marker-start, .gsap-marker-end, [asscroll]'),
      });
    });
    return asscroll;
  }

  setSmoothScroll() {
    this.asscroll = this.setupASScroll();
  }

  setScrollTrigger() {
    ScrollTrigger.matchMedia({
      //---DESKTOP---
      '(min-width: 969px)': () => {
        this.room.scale.set(0.11, 0.11, 0.11);
        this.rectLight.width = 0.6;
        this.rectLight.height = 0.7;
        this.camera.orthographicCamera.position.set(0, 6.5, 10);
        this.room.position.set(0, 0, 0);
        //First section-----------

        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.first-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            // markers: true,
            invalidateOnRefresh: true,
          },
        });
        this.firstMoveTimeline.fromTo(
          this.room.position,
          { x: 0, y: 0, z: 0 },
          {
            x: () => {
              return this.sizes.width * 0.0014;
            },
          }
        );

        //Second section---------

        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.second-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
          .to(
            this.room.position,
            {
              x: () => {
                return 1;
              },
              z: () => {
                return this.sizes.height * 0.0032;
              },
            },
            'same'
          )
          .to(
            this.room.scale,
            {
              x: 0.4,
              y: 0.4,
              z: 0.4,
            },
            'same'
          )
          .to(
            this.rectLight,
            {
              width: 0.6 * 4,
              height: 0.7 * 4,
            },
            'same'
          );
        //Third section-----------

        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.third-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).to(this.camera.orthographicCamera.position, {
          x: -4.1,
          y: -2,
        });
      },

      //---MOBILE---

      '(max-width: 968px)': () => {
        //Resets
        this.room.scale.set(0.07, 0.07, 0.07);
        this.room.position.set(0, 0, 0);
        this.rectLight.width = 0.6;
        this.rectLight.height = 0.5;
        this.camera.orthographicCamera.position.set(0, 6.5, 10);
        //First section-----------

        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.first-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            //invalidateOnRefresh: true,
          },
        }).to(this.room.scale, {
          x: 0.1,
          y: 0.1,
          z: 0.1,
        });

        //Second section---------

        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.second-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
          .to(
            this.room.scale,
            {
              x: 0.25,
              y: 0.25,
              z: 0.25,
            },
            'same'
          )
          .to(
            this.rectLight,
            {
              width: 0.4 * 3.4,
              height: 0.5 * 3.4,
            },
            'same'
          )
          .to(
            this.room.position,
            {
              x: 1.5,
            },
            'same'
          );

        //Third section-----------

        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.third-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).to(this.room.position, {
          z: -4.5,
        });
      },

      //all
      all: () => {
        this.sections = document.querySelectorAll('.section');
        this.sections.forEach((section) => {
          this.progressWrapper = section.querySelector('.progress-wrapper');
          this.progressBar = section.querySelector('.progress-bar');

          if (section.classList.contains('right')) {
            GSAP.to(section, {
              borderTopLeftRadius: 10,
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top top',
                scrub: 0.6,
              },
            });
            GSAP.to(section, {
              borderBottomLeftRadius: 700,
              scrollTrigger: {
                trigger: section,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            });
          } else {
            GSAP.to(section, {
              borderTopRightRadius: 10,
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top top',
                scrub: 0.6,
              },
            });
            GSAP.to(section, {
              borderBottomRightRadius: 700,
              scrollTrigger: {
                trigger: section,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            });
          }
          GSAP.from(this.progressBar, {
            scaleY: 0,
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.4,
              pin: this.progressWrapper,
              pinSpacing: false,
            },
          });
        });

        //All Animations---

        //First section-----------

        this.firstCircle = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.first-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        }).to(this.circleFirst.scale, {
          x: 3,
          y: 3,
          z: 3,
        });

        //Second section---------

        this.secondCircle = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.second-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        })
          .to(
            this.circleSecond.scale,
            {
              x: 3,
              y: 3,
              z: 3,
            },
            'same'
          )
          .to(
            this.room.position,
            {
              y: 0.7,
            },
            'same'
          );

        //Third section-----------

        this.thirdCircle = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.third-move',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        }).to(this.circleThird.scale, {
          x: 3,
          y: 3,
          z: 3,
        });

        //Mini Platform Animations---
        this.secondPartTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: '.third-move',
            start: 'center center',
          },
        });

        this.room.children.forEach((child) => {
          if (child.name === 'Mini_Floor') {
            this.first = GSAP.to(child.position, {
              x: 1.4,
              z: -2.4,
              duration: 0.3,
            });
          }
          if (child.name === 'doormat') {
            this.second = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'Lamp') {
            this.third = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'Dirt') {
            this.fourth = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'FlowerOne') {
            this.sixth = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'FlowerTwo') {
            this.seventh = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'FlowerThree') {
            this.eighth = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(2)',
              duration: 0.3,
            });
          }
          if (child.name === 'Mailbox') {
            this.nineth = GSAP.to(child.scale, {
              x: 1,
              y: 1,
              z: 1,
              ease: 'back.out(4)',
              duration: 0.3,
            });
          }
        });
        this.secondPartTimeline.add(this.first);
        this.secondPartTimeline.add(this.second);
        this.secondPartTimeline.add(this.third);
        this.secondPartTimeline.add(this.fourth, '-=0.2');
        this.secondPartTimeline.add(this.sixth, '-=0.2');
        this.secondPartTimeline.add(this.seventh, '-=0.2');
        this.secondPartTimeline.add(this.eighth, '-=0.2');
        this.secondPartTimeline.add(this.nineth, '-=0.1');
      },
    });
  }

  resize() {}

  update() {}
}

//this.progress = 0;
//this.dummyCurve = new THREE.Vector3(0, 0, 0);

/* this.lerp = {
      current: 0,
      target: 0,
      ease: 0.1,
    };
    
    this.position = new THREE.Vector3(0, 0, 0);
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);

    this.directionalVector = new THREE.Vector3(0, 0, 0);
    this.staticVector = new THREE.Vector3(0, 1, 0);
    this.crossVector = new THREE.Vector3(0, 0, 0);

    this.setPath();
    this.onWheel();
  }

  setPath() {
    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(0, 0, -5),
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(0, 0, 5),
      ],
      true
    );

    const points = this.curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the final object to add to the scene
    const curveObject = new THREE.Line(geometry, material);
    this.scene.add(curveObject);
  }

  onWheel() {
    window.addEventListener('wheel', (e) => {
      //console.log(e);
      if (e.deltaY > 0) {
        this.lerp.target += 0.01;
      } else {
        this.lerp.target -= 0.01;
      }
    });

    update(){

    this.lerp.current = GSAP.utils.interpolate(
      this.lerp.current,
      this.lerp.target,
      this.lerp.ease
    );
    this.curve.getPointAt(this.lerp.current % 1, this.position);
    this.camera.orthographicCamera.position.copy(this.position);

    this.directionalVector.subVectors(
      this.curve.getPointAt((this.lerp.current % 1) + 0.000001),
      this.position
    );
    this.directionalVector.normalize();
    this.crossVector.crossVectors(this.directionalVector, this.staticVector);
    this.crossVector.multiplyScalar(100000);
    this.camera.orthographicCamera.lookAt(this.crossVector);
    }
    */
