  

    <script>

        import Counter from './Counter.svelte';
        
               
        </script>
        
        <!-- ================================================= -->
      
        <!-- for Heading container Box  -->
        <center>
            <div class="Heading_container">
                <center>
                    <h2>Bulk Resize Images</h2>
                </center>
            </div>
        
            <!-- for get a padding  -->
            <br /><br />
            <br /><br />
            <br /><br />
        
            <!-- Drop image here or image choose  -->
            <div class="drop_image" >
                <p>Drop images here <br /> or</p>
                
                 <section>
                     
                    <Counter />
                </section>
   
            </div> 
        </center>
        
        
    

<!-- CSS style section -->

 <head>
    <title>File Choose </title>
 </head>
  <style>


section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        flex: 0.6;
    }
    h1 {
        width: 100%;
    }

        /* heading Style */
        .Heading_container {
            /* border: 2px solid red; */
            height: 40opx;
            width: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
            align-content: flex-end;
            background-color: #aebdca;
            border-radius: 8px;
                 
            /* box-shadow: 0px 20px 50px grey  ; */
            box-shadow: 0 8px 6px -6px rgb(36, 35, 35);
            /* object-fit: ; */
        }
        h2 {
            font-size: 30px;
        }
    
        /* drop image container style */
        .drop_image {
            pointer-events: auto;
            height: 500px;
            width: 1200px;
            background-color: #aebdca;
            border-radius: 8px;
            box-shadow: 0 8px 6px -6px rgb(36, 35, 35);
            align-content: flex-end;
            justify-content: center;
            align-items: center;
            font-size: 28px;
            padding-top: 1%;
        }
    
        /* choose button style */
        #bn {
            height: 20%;
            width: 20%;
            font-size: medium;
            color: white;
            font-weight: 700;
    
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 15px;
            gap: 15px;
            background-color: #181717;
            outline: 3px #181717 solid;
            outline-offset: -3px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            transition: 400ms;
        }
    
    

  
       
    </style>

