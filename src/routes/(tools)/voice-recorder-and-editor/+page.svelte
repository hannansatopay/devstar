<script>
<<<<<<< Jatin-Sihag
    import Record from "./voiceRecord/record.svelte";
    import editor from "./voiceEditing/audio-trimmer/public/index.html";

    // Function to navigate to the record audio page
    function goToRecordAudio() {
        window.location.href = '#/record';
    }

    // Function to navigate to the edit audio page
    function goToEditAudio() {
        window.location.href = '#/edit';
    }
</script>       
<script>       
=======
</script>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<!-- Add tool here -->
</div>
>>>>>>> team-49
<main>
    <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
        <div class="hero">
            <video autoplay loop muted playsinline class="back-video">
                <source src="/bg_v.mp4" type="video/mp4" alt="video"/>
            </video>
            <nav>
                <img src="\logo1.png" class="logo" alt="logo"/>
                <ul>
                    <li><a href="Record">Record Audio</a></li>
                    <li><a href="editor">Edit Audio</a></li>
                </ul>
            </nav>
            <div class="content">
                <h1><i>AUDIO CRAFT</i></h1>
                <h2><i>Record. Edit. Save.</i></h2>
            </div>
        </div>
        <!-- Add tool here if needed -->
    </div>
</main>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
    }
    main {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .card {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        margin: 20px auto;
        width: 90%;
        background-color: #111522;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        overflow: hidden;
    }
    .hero {
        width: 90%;
        height: 100vh;
        background-image: linear-gradient(rgba(11, 2, 116, 0.3), rgba(128, 128, 128, 0.54));
        position: relative;
        padding: 0 5%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    nav {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        padding: 20px 8%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1;
    }
    nav .logo {
        width: 200px;
        position: relative;
        right: 80px;
    }
    nav ul {
        display: flex;
        list-style: none;
    }
    nav ul li {
        display: inline-block;
        margin-left: 40px;
    }
    nav ul li a {
        color: #fff;
        font-size: 17px;
        transition: color 0.3s;
    }
    nav ul li a:hover {
        color: #9D9CE9;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 5px 10px;
        border-radius: 5px;
        text-decoration: underline;
    }
    .content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        z-index: 1;
        white-space: nowrap;
    }
    .content h1 {
        font-size: 100px;
        color: #9D9CE9;
        font-weight: 600;
        transition: 0.5s;
    }
    .content h1:hover {
        -webkit-text-stroke: 2px #fff;
        color: transparent;
    }
    .content h2 {
        text-decoration: none;
        display: inline-block;
        color: #FFFFFF;
        font-size: 24px;
        padding: 14px 70px;
        margin-top: 20px;
    }
    .back-video {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
    @media(min-aspect-ratio: 16/9) {
        .back-video {
            width: 100%;
            height: auto;
        }
    }
    @media(max-aspect-ratio: 16/9) {
        .back-video {
            width: auto;
            height: 100%;
        }
    }
 </style>