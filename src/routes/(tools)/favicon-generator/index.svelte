<script>
    // JavaScript logic 
  </script>
  
  <main>
    <h1>Favicon Generator</h1>
    <hr>
    <p class="intro">
      A favicon generator is a versatile online tool that simplifies the process of creating custom icons for websites. 
      This website offers a range of conversion options, including the ability to transform PNG images into the 
      favicon-friendly ICO format. Additionally, it provides the convenience of converting text into icons, 
      allowing users to personalize their website's favicon with text-based elements. Furthermore, the emoji to 
      ICO converter feature is a fun and creative way to add a touch of personality to your website's icon, 
      utilizing popular emojis to represent your site. With these converters at your disposal, you can effortlessly 
      generate eye-catching and unique favicons to enhance your web presence and make your site more memorable.
    </p>

    <div class="container">
      <div class="convbuttons">
        <button class="pngbutton" >PNG to ICO</button>
        <button class="textbutton" >Text to ICO</button>
        <button class="emojibutton" >Emoji to ICO</button>
      </div>
    </div>
  
    <hr>
  </main>
  
  <style>
    h1 {
      text-align: center;
    }
    .convbuttons {
      display: flex;
      justify-content: space-around;
      width: 100%;
    }
    .pngbutton,
    .textbutton,
    .emojibutton {
      flex: 1;
      height: 300px;
      width: auto;
      margin-bottom: 80px;
      margin-top: 50px;
      margin-inline: 100px;
      cursor: pointer;
      background-size: cover;
      background-repeat: no-repeat;
      border: none;
      box-shadow: 4px 4px 5px grey;
    }
    .pngbutton:active,
    .textbutton:active,
    .emojibutton:active {
      border: none;
      box-shadow: 2px 2px 4px grey;
    }
    .pngbutton {
      background-image: url("PNG to ICO Converter.png");
    }
    .textbutton {
      background-image: url("Text to ICO Converter.png");
    }
    .emojibutton {
      background-image: url("Emoji to ICO Converter.png");
    }
    .intro {
      text-align: center;
      font-weight: bold;
      margin-top: 50px;
      margin-inline: 80px;
    }
  </style>
  
