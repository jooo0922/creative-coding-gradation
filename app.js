"use strict";

import { GlowParticle } from "./glowparticle.js";

// gradation 효과에 사용할 컬러들을 배열로 정리함.
const COLORS = [
  {
    r: 45,
    g: 74,
    b: 227,
  }, // blue
  {
    r: 250,
    g: 255,
    b: 89,
  }, // yellow
  {
    r: 255,
    g: 104,
    b: 248,
  }, // pupple
  {
    r: 44,
    g: 209,
    b: 252,
  }, // skyblue
  {
    r: 54,
    g: 233,
    b: 84,
  }, // green
];

class App {
  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    /**
     * Window.devicePixelRatio 읽기 전용 속성은 현재 표시 장치의 물리적 픽셀과 CSS 픽셀의 비율을 반환함.
     * CSS 픽셀의 크기를 모니터의 물리적 픽셀의 크기로 나눈 값으로 해석해도 됩니다.
     * 또 다른 해석은, 하나의 CSS 픽셀을 그릴 때 사용해야 하는 장치 픽셀의 수라고 할 수 있습니다.
     *
     * devicePixelRatio 속성은 HiDPI/Retina 디스플레이처럼 같은 객체를 그릴 때 더 많은 픽셀을 사용해
     * 보다 선명한 이미지를 표현하는 화면과, 표준 디스플레이의 렌더링 차이에 대응할 때 유용합니다.
     *
     * 예를 들어, CSS 픽셀 크기가 3mm 정도 된다고 치자. 근데 내 모니터의 픽셀 크기가 2mm야
     * 그러면 CSS 픽셀 크기 / 내 모니터 물리적 픽셀 크기 = 3 / 2 = 1.5
     * 또 다른 해석으로는, CSS 픽셀 하나를 그릴려면 내 모니터에서는 픽셀 1.5개가 필요하다는 뜻이기도 하지.
     *
     * 이게 무슨 뜻이냐면, devicePixelRatio에서 return받는 값이 크면 클수록 뭐다?
     * 사용자 모니터의 픽셀 집적도가 높다는, 즉 고해상도라는 뜻임.
     * 그래서 해상도가 서로 다른 모니터에서 이 값을 콘솔로 출력해보면 값이 다 다름.
     *
     * 즉, 'CSS 픽셀 크기 / 사용자마다 모니터에서 지원하는 물리적 픽셀의 크기'의 값이 1보다 크다면, 2를 return하여 pixelRatio에 할당하고,
     * 1과 같거나 1보다 작다면 1을 return하여 pixelRatio에 할당하라는 뜻.
     *
     * 즉, 값이 크다면 고해상도, 즉 CSS픽셀 개수보다 더 많은 픽셀들로 캔버스를 표현할 수 있으니까
     * canvas 사이즈 설정 시 브라우저 사이즈에 2를 곱해줘서 레티나 디스플레이를 고려한 사이즈를 설정하고,
     *
     * 값이 작거나 같다면 CSS 픽셀 개수와 같거나, 또는 그보다 적은 개수로 캔버스를 표현할 수 밖에 없으니까
     * canvas 사이즈 설정 시 굳이 브라우저 사이즈에 2를 곱해줄 필요가 없다는 뜻.
     * 그냥 1을 곱해줘서 원래 브라우저 사이즈대로 설정하라는 뜻.
     */

    this.totalParticles = 15;
    this.particles = [];
    this.maxRadius = 900;
    this.minRadius = 400;

    window.addEventListener("resize", this.resize.bind(this), false);
    // // false로 지정하면 이벤트 버블링, true로 지정하면 이벤트 캡쳐링이 발생함.
    this.resize();

    window.requestAnimationFrame(this.animate.bind(this)); // 인스턴스 생성되자마자 애니메이션 바로 걸어서 호출해주고
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    // 이번에는 그냥 레티나 디스플레이 고려해서 무조건 * 2를 한 것이 아니라,
    // devicePixelRatio 속성에서 return받은 값을 이용하여, 사용자의 모니터 환경에 따라
    // 사용자의 모니터가 레티나를 지원할만큼 높은 해상도를 지원하면 1를 곱하고, 그렇지 않으면 2를 곱하도록 한 것.

    /**
     * CanvasRenderingContext2D.globalCompositeOperation = 'type'
     * 새로 그리는 도형은 언제나 이미 그려진 도형의 위에 그려졌음.
     * 대부분의 상황에서는 이렇게 하는 것이 적절하지만, 만약 도형끼리 합성(compostion)효과를 내고 싶다면?
     *
     * globalCompositeOperation = type
     * 이걸 이용해서 새로운 도형을 그릴 때, 도형 합성 방법을 설정함.
     * type 자리에는 26가지의 합성 방법을 지정해줄 수 있음.
     *
     * saturation은 아래쪽 레이어의 색상과 명도를 보존하고 위쪽 레이어의 채도를 적용함.
     * 이거는 사실 그냥 MDN에 나와있는 type 26개 참고해서
     * 다 지정해보면서 원하는 효과가 적용되는 걸로 조정하는 게 제일 나을거 같음.
     */
    this.ctx.globalCompositeOperation = "saturation";

    this.creatParticles();
  }

  creatParticles() {
    let curColor = 0;
    this.particles = [];

    for (let i = 0; i < this.totalParticles; i++) {
      const item = new GlowParticle(
        Math.random() * this.stageWidth,
        Math.random() * this.stageHeight, // GlowParticle의 x, y 좌표값은 stage의 width와 height 내에서 각각 무작위로 지정될 것.
        Math.random() * (this.maxRadius - this.minRadius) + this.minRadius, // GlowParticle의 반지름값은 40 ~ 90 사이의 숫자들 중에서 무작위로 지정될 것. (랜덤값 범위 구하는 공식 알지?)
        COLORS[curColor]
      );

      if (++curColor >= COLORS.length) {
        // if 조건문 내에서 바로 curColor값, 즉 COLORS의 index로 접근할 때 쓰일 값 증가연산 함.
        curColor = 0; // 만약 그 값이 COLORS의 배열 개수(5개) 보다 같아지거나 커지면 다시 0번 index로 reset하라는 거.
      }
      // 그니까 결과적으로는 COLORS 안에 있는 5개의 색깔들로만 GlowParticle들이 생성되겠지?

      this.particles[i] = item; // 이거는 for loop 돌때마다 해당 index에 생성된 GlowParticle 인스턴스를 집어넣으란 거지?
    }
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this)); // 내부에서 스스로를 반복 호출해주고

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 이전 프레임은 항상 지워주고

    // totalParticles에 지정한 개수만큼 for loop로 반복해서 GlowParticle의 애니메이션을 그려주는 거
    for (let i = 0; i < this.totalParticles; i++) {
      const item = this.particles[i];
      // 여기서 사용된 const item은 createParticles()의 item과 관련이 없음. global scope에서 정의한 게 아니라면 이름을 똑같이 써도 상관 없음.

      item.animate(this.ctx, this.stageWidth, this.stageHeight);
      // 매 프레임을 그릴때마다 totalParticles에 지정된 갯수만큼 GlowParticle들을 그려주는 데,
      // 이때 각각의 GlowParticle들 마다 x, y좌표값과 반지름값을 바꿔서 실제 캔버스에 그려줌!
    }
  }
}

window.onload = () => {
  new App();
};
