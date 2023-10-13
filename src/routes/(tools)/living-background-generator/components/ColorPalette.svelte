<script>
  let hexValue = "#00AB6F";
  let hsbValue = "162, 100, 67";
  const script = document.createElement('script');
  script.src = "https://kit.fontawesome.com/26455efb4b.js";
  script.crossOrigin = "anonymous";
  document.body.appendChild(script);
</script>

<style>
  *{
    padding: 0px;
    margin: 0px;
    box-sizing: border-box;
}


#btnPalette{
    display: flex;
    
}
/* 391x748 */
#colorPaletee{
    height: 748px;
    width: 391px;
    background-color: #19242A;
    display: flex;  
    flex-direction: column;
    align-items: center;

    
}
#colorPaletee h4{
    color: white;
    text-align: center;
    margin: 20px;
    
}
#btnPaletter{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.btnPalette{
    margin: 10px;
    background-color: #B8DBD9;
    width: 240px;
    height: 32px;
    border-radius: 50px;
    border: none;
    color: #2F4550;
    font-size: 14px;
    cursor: pointer;
}

.colorsticker{
    width: 240px;
    height: 238px;
    margin: 20px 
}

.viewColor{
    width: 240px;
    height: 119px;
    background-color: #00AB6F;
    margin-bottom: 10px;
}

.viewColorInfo{
    color: #333333;
}
#hexValueSec{
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin: 15px;
}

#hsbValueSec{
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin: 15px;
}
</style>
<div id="colorPaletee">
    <h4>COLOR PALETTE</h4>
    <div class="colorsticker" style="background-color: white;">
        <div class="viewColor"></div>
        <div class="viewColorInfo">
            <i class="fa fa-circle " style="color: #00AB6F; margin-left: 13px;"></i> Style 2
            <i class="fa fa-bars" style="margin-left: 130px;"></i>
            <div class="colorValues">
                <div id="hexValueSec">
                    <i class="fa fa-refresh"></i>
                    <span>HEX</span>
                    <span id="hexValue">{hexValue}</span>
                    <span id="percent">100%</span>
                </div>
                <div id="hsbValueSec">
                    <i class="fa fa-refresh"></i>
                    <span>HSB</span>
                    <span id="hsbValue">{hsbValue}</span>
                    <span id="percent">100%</span>
                </div>
            </div>
        </div>
    </div>
    <div id="btnPaletter">
        <button class="btnPalette">Add Color</button>
        <button class="btnPalette">Random</button>
        <button class="btnPalette" style="width: 280px;">Choose the type of Gradient</button>
    </div>
</div>
