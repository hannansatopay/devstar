<div class="comp_front4" id="frontContainer">
    <div class="wwwgooglecom-wrapper">
      <div class="wwwgooglecom">www.google.com</div>
    </div>
    <div class="logo-parent">
      <img class="logo-icon" alt="" src="./public/logo@2x.png" />


      <div class="company">
        <p class="healthcare">
          <b>Healthcare</b>
        </p>
        <p class="medical-servics">Medical Servics</p>
      </div>
    </div>
    <div class="frame-parent">
      <div class="parent" data-animate-on-scroll>
        <img class="icon" alt="" src="./public/10-1@2x.png" />


        <div class="wwwgooglecom">Emergency</div>
      </div>
      <div class="group">
        <img class="icon" alt="" src="./public/11-1@2x.png" />


        <div class="wwwgooglecom">Vaccination</div>
      </div>
      <div class="group">
        <img class="icon" alt="" src="./public/12-1@2x.png" />


        <div class="wwwgooglecom">Blood Test</div>
      </div>
    </div>
  </div>
<style>

</style>

<html lang=”en’>


<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />


  <style>
    /* global css */
    body {
      margin: 0;
      line-height: normal;
      width: 300px;
    }


    :root {
      /* fonts */
      --font-amiko: Amiko;


      /* font sizes */
      --font-size-2xs-3: 10.3px;
      --font-size-lg-3: 18.3px;
      --font-size-3xs-1: 9.1px;


      /* Colors */
      --color-mediumseagreen: #1ca46f;
      --color-white: #fff;
      --color-darkslateblue: #3b308b;
      --color-gray: rgba(255, 255, 255, 0.1);


      /* Border radiuses */
      --br-11xs: 2px;
    }


    @keyframes flip-horizontal-bottom {
      0% {
        transform: rotateX(0);
      }


      to {
        transform: rotateX(-180deg);
      }
    }


    /* front css */
    .wwwgooglecom {
      position: relative;
    }


    .wwwgooglecom-wrapper {
      position: absolute;
      top: 159.67px;
      left: 0;
      border-radius: var(--br-11xs);
      background-color: var(--color-darkslateblue);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 300px;
      height: 25px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 4px 0;
    }


    .logo-icon {
      position: relative;
      width: 57.14px;
      height: 63.85px;
      object-fit: cover;
    }


    .healthcare {
      margin: 0;
    }


    .medical-servics {
      margin: 0;
      font-size: 10.29px;
    }


    .company {
      position: relative;
      display: inline-block;
      width: 99.14px;
      height: 10.29px;
      flex-shrink: 0;
    }


    .logo-parent {
      position: absolute;
      top: 25px;
      left: 41.23px;
      width: 99.14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      font-size: 18.29px;
    }


    .icon {
      position: relative;
      width: 22.86px;
      height: 22.86px;
      object-fit: cover;
    }


    .parent {
      opacity: 1;
    }


    .parent.animate {
      animation: 1s ease 200s 1 normal forwards flip-horizontal-bottom;
    }


    .frame-parent,
    .group,
    .parent {
      width: 96.29px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }


    .frame-parent {
      position: absolute;
      top: 27.67px;
      left: 179.14px;
      flex-direction: column;
      justify-content: center;
      gap: 15.43px;
    }


    .front4 {
      position: relative;
      background-color: var(--color-mediumseagreen);
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
      width: 100%;
      height: 200px;
      overflow: hidden;
      cursor: pointer;
      text-align: center;
      font-size: 10.29px;
      color: var(--color-white);
      font-family: var(--font-amiko);
    }


    @media screen and (max-width: 1200px) {
      .front4 {
        height: 600px;
        width: 1050px;
      }
    }


    /* back css */
    .icon3,
    .icon7 {
      position: relative;
      width: 17.14px;
      height: 17.14px;
      object-fit: cover;
    }


    .frame-div {
      position: absolute;
      top: 0;
      left: 137.14px;
      border-radius: var(--br-11xs);
      background-color: var(--color-darkslateblue);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 22.86px;
      height: 200px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 0 2.5869998931884766px 30.66699981689453px;
      gap: 11px;
    }


    .pranjal-padole {
      margin: 0;
    }


    .manager {
      margin: 0;
      font-size: 6.86px;
    }


    .pranjal-padole-manager-container {
      position: relative;
      font-size: 10.29px;
    }


    .div {
      position: relative;
    }


    .pranjal-padole-manager-parent {
      position: absolute;
      top: 0;
      left: 160px;
      border-radius: var(--br-11xs);
      background-color: var(--color-mediumseagreen);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 141.14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 40px 8px 34px;
      gap: 14px;
    }


    .icon8 {
      position: relative;
      width: 57.14px;
      height: 60.79px;
      object-fit: cover;
    }


    .medical-servics1 {
      margin: 0;
      font-size: 10.29px;
    }


    .healthcare-medical-servics-container {
      align-self: stretch;
      position: relative;
    }


    .parent1 {
      position: absolute;
      top: 41.14px;
      left: 26.86px;
      width: 99.14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: 18.29px;
      color: var(--color-darkslateblue);
    }


    .back4 {
      position: relative;
      background-color: var(--color-white);
      width: 300px;
      height: 200px;
      overflow: hidden;
      opacity: 0.8;
      cursor: pointer;
      text-align: center;
      font-size: 9.14px;
      color: var(--color-white);
      font-family: var(--font-amiko);
    }


    @media screen and (max-width: 300px) {
      .icon7 {
        height: 200px;
      }


      .back4 {
        width: 300px;
      }


      .icon7 {
        width: 300px;
      }


      .back4 {
        height: 200px;
      }
    }


    @media screen and (max-width: 300px) {
      .icon7 {
        width: 300px;
      }


      .back4 {
        height: 200px;
      }
    }
  </style>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiko:wght@400;700&display=swap" />
</head>


<body>
 


  <!-- back4 -->
  <div class="back4" id="backContainer">
    <div class="frame-div">
      <img class="icon3" alt="" src="./public/5-1@2x.png" />


      <img class="icon3" alt="" src="./public/4-1@2x.png" />


      <img class="icon3" alt="" src="./public/6-1@2x.png" />


      <img class="icon3" alt="" src="./public/8-1@2x.png" />


      <img class="icon7" alt="" src="./public/7-1@2x.png" />
    </div>
    <div class="pranjal-padole-manager-parent">
      <div class="pranjal-padole-manager-container">
        <p class="pranjal-padole">Pranjal Padole</p>
        <p class="manager">Manager</p>
      </div>
      <div class="div">+12-1234-5678</div>
      <div class="div">hellow@heathcare.com</div>
      <div class="div">www.google.com</div>
      <div class="div">Nagpur,Maharashtra,India</div>
    </div>
    <div class="parent1">
      <img class="icon8" alt="" src="./public/3-1@2x.png" />


      <div class="healthcare-medical-servics-container">
        <p class="pranjal-padole">
          <b>Healthcare</b>
        </p>
        <p class="medical-servics1">Medical Servics</p>
      </div>
    </div>
  </div>




  <script>
    var frontContainer = document.getElementById("frontContainer");
    frontContainer.style.display = "none";
    backContainer.style.display = "block";
    if (frontContainer) {
      frontContainer.addEventListener("click", function (e) {
        frontContainer.style.display = "none";
        backContainer.style.display = "block";
      });
    }
    var scrollAnimElements = document.querySelectorAll("[data-animate-on-scroll]");
    var observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add("animate");
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );


    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }
  </script>




  <script>
    var backContainer = document.getElementById("backContainer");
    if (backContainer) {
      backContainer.addEventListener("click", function (e) {
        backContainer.style.display = "none";
        frontContainer.style.display = "block";
      });
    }
  </script>


</body>


</html>
