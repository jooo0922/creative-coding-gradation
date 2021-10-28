'use strict';

const PI2 = Math.PI * 2; // 360도 값을 radian 단위로 표현함. 원을 만들 때 쓰려고 한거겠지?

export class GlowParticle {
  constructor(x, y, radius, rgb) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.rgb = rgb;

    this.vx = Math.random() * 4;
    this.vy = Math.random() * 4; // 0 ~ 4 사이의 난수를 return받음. x, y좌표값에 더해주려는 속도값인 것 같음.

    this.sinValue = Math.random(); // 0 ~ 1 사이의 난수를 sinValue에 할당
  }

  animate(ctx, stageWidth, stageHeight) {
    this.sinValue += 0.01; // 이 함수를 호출할 때마다 sinValue는 0.01씩 늘어남

    this.radius += Math.sin(this.sinValue);
    // 예를 들어서 0.01 rad, 0.02 rad, 0.03 rad, 이런 식으로 0.01씩 늘어나는 radian값을 전달해서 
    // -1 ~ 1 사이의 sin값을 return받고, 그걸 radius(즉, 반지름값)에 더해서 넣어줌.
    // 결과적으로는 매 프레임마다 1 ~ -1 사이에서 늘어났다 줄어났다 하는 값을 반지름값에 누산해주겠지?
    // 0더해주고 그 다음에는 0.1 더해주고 그 다음에는 0.2, 0.3 ... 이런 식으로 쭉쭉 나가겠지? 그냥 예를 들자면 이런 거.

    this.x += this.vx;
    this.y += this.vy;
    // 0 ~ 1 사이로 return받은 난수값을 할당받은 속도값(vx,vy)을 계속 더해주면서 위치가 이동하겠지?

    if (this.x < 0) {
      this.vx *= -1; // x 좌표값(원의 중심점이) stage의 왼쪽 끝을 벗어나려고 할 경우 vx만큼 이동하는 '방향'을 바꿔줌
      this.x += 10; // 방향을 바꿔줌과 동시에 x좌표값을 10으로 옮겨줌. 약간 튕겨지는 느낌. 갑자기 한 번에 10만큼 이동하니까.
    } else if (this.x > stageWidth) {
      this.vx *= -1; // y 좌표값(원의 중심점이)이 stage 오른쪽 끝을 벗어나려고 할 때 '이동 방향'을 또 바꿔 줌.
      this.x -= 10; // 동시에 x좌표값을 stageWidth - 10으로 옮기려는 것. 
    }

    // y 좌표값도 마찬가지로 해주기
    if (this.y < 0) {
      this.vy *= -1;
      this.y += 10;
    } else if (this.y > stageHeight) {
      this.vy *= -1;
      this.y -= 10;
    }
    // 이렇게 하면 전체적으로 원의 중심점이 스크린에 닿을 때마다 10씩 튕겨짐과 함께 방향을 바꿔서 움직이는 모습이겠지?

    ctx.beginPath();

    /**
     * CanvasRenderingContext2D.createRadialGradient() 
     * 이 메서드는 두 원의 크기와 좌표를 사용하여 반지름 상에 그라데이션을 만듦.
     * 
     * 이 메서드는 Canvas Gradient를 반환하며,
     * 도형에 적용하려면 먼저 fillStyle 또는 strokeStyle 속성에 그라데이션을 할당해줘야 함.
     * 
     * 이 그라데이션을 할당해주려고 쓰는 메소드가 CanvasGradient.addColorStop()임.
     * 이 메소드를 호출할때는 그라디언트가 create된 객체에서 호출해야 함.
     * 그래서 아래에서 g.addColorStop으로 그라디언트가 생성된 g에서 호출한거임.
     */
    const g = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius * 0.01,
      this.x,
      this.y,
      this.radius
    );
    // 안에 들어가는 파라미터들을 간단하게 좀 설명해주자면,
    // 앞에 3개는 그라데이션이 시작하는 원인 시작 원의 x, y 좌표값(즉, 중심점)과 반지름
    // 뒤의 3개는 그라데이션이 끝나는 원인 끝 원의 x, y좌표값(즉, 중심점)과 반지름을 의미함.
    // 우리는 현재 캔버스 상에 그려진 원을 기준으로, 같은 중심점에 위치하지만 반지름이 0.01배인 아주 작은 원에서
    // 현재 캔버스 상에 그려진 원까지 그라데이션을 주려고 한 것이기 때문에 
    // 중심점은 같으면서, 반지름만 다른 두 원 사이에서 그라데이션을 설정한 것

    /**
     * CanvasGradient.addColorStop()
     * 이 메소드는 주어진 canvas gradient에서 
     * '어떤 지점에서부터 어떤 컬러로 시작해서' '어떤 지점까지 어떤 컬러로 끝나는'
     * 일종의 그라데이션 상의 color stop을 새롭게 추가해 주는거.
     * 포토샵에서 그라데이션 줄 때 그라데이션 색상표 위에다가 점찍는 거 있지? 그 점을 colorStop에 해당함.
     * 
     * gradient.addColorStop(offset, color); 요런 문법을 사용하는데,
     * offset은 0 ~ 1사이의 숫자로 color stop의 위치를 지정해 줌. 
     * 0은 그라데이션의 시작점. 1은 그라데이션의 끝점
     * 
     * color는 당연히 그 지점에 어떤 컬러로 color stop을 찍을 것인가에 해당함. CSS 컬러값을 넣으면 됨.
     * 여기서는 시작원은 0 지점에서 같은 컬러인데 투명도가 1인 색깔로 그라데이션을 시작해서
     * 끝원은 1 지점에서 같은 컬러인데 투명도가 0인 색깔로 그라데이션을 끝냄. 
     * 그냥 투명도만 그라데이션을 조절해준 거임.
     */
    g.addColorStop(0, `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, 1)`);
    g.addColorStop(1, `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, 0)`)

    // 시작원과 끝원을 지정해서 두 원의 반지름 상에 그라데이션을 만들고,
    // 어떤 지점 어떤 컬러에서 어떤 지점 어떤 컬러까지 그라에이션을 줄 것인지 colorStop을 추가하면,
    // 그라데이션을 만들어냈기 때문에 이렇게 fillStyle에 할당하기만 하면 됨. 
    ctx.fillStyle = g;
    // ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, 1)`; // app.js의 COLOR 배열의 item들을 전달받아서 할당하는거겠지?

    ctx.arc(this.x, this.y, this.radius, 0, PI2, false)
    ctx.fill();
  }
  // 원의 전체적인 움직임은 원의 중심점이 스크린 끝에 맞닿을 때마다 10씩 튕겨지고 
  // 이동방향을 반대로 바꿔서 움직임과 동시에 반지름은 커졌다 작아졌다 하는 모습일거임.
}