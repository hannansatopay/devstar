<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let poll = null;
    let totalVotes;
    let votes = [];
    let id = '';
    let loading = true;
    let error = false;
    let expirationMessage = '';

    async function fetchPoll(id) {
        try {
            const response = await fetch(`/online-poll-tool/api/get-poll/${id}`);
            if (response.ok) {
                poll = await response.json();
                setExpirationMessage()
                fetchResults(id);
            } else {
                console.error('Failed to fetch poll:', response.statusText);
                error = true;
            }
        } catch (error) {
            console.error('Error fetching poll:', error);
            error = true;
        } finally {
            loading = false;
        }
    }

    async function fetchResults(id) {
        try {
            const response = await fetch(`/online-poll-tool/api/get-results/${id}`);
            if (response.ok) {
                const results = await response.json();
                totalVotes = results.options.reduce((acc, option) => acc + option.votes, 0);

                votes = results.options.map(option => ({
                    option: option.text,
                    count: option.votes,
                    percentage: totalVotes === 0 ? 0 : (option.votes / totalVotes * 100).toFixed(1)
                }));

            } else {
                console.error('Failed to fetch results:', response.statusText);
                error = true;
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            error = true;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        id = $page.params.id;
        fetchPoll(id);
    });

    function share() {
        const resultsUrl = `${window.location.origin}/online-poll-tool/${id}`;
        if (navigator.share) {
            navigator.share({
                title: 'Online Poll Tool',
                text: 'Check out the results of this poll!',
                url: resultsUrl
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    }

    function setExpirationMessage() {
        const expirationTime = new Date(poll.expirationTime);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[expirationTime.getMonth()];
        const date = expirationTime.getDate();
        let hours = expirationTime.getHours();
        const minutes = expirationTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight (0 hours) as 12
        expirationMessage = `This poll will expire on ${month} ${date}, at ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    }
</script>

<div class="outer-container">
    <div class="inner-container">

        {#if loading}
            <div class="loading">
                Loading poll...
            </div>
        {:else}
            {#if error}
                <div class="error">
                    <h2>Error fetching poll data. Please try again later.</h2>
                </div>
            {:else}
                <div class="title">
                    {#if poll}
                        <h2>{poll.question}</h2>
                        <p class="expiration-message">{expirationMessage}</p>
                    {:else}
                        <h2>Poll not found or Poll Expired!</h2>
                    {/if}
                </div>

                {#if poll}
                    <div class="results">
                        <ul class="bar">
                            {#each votes as { option, count, percentage }}
                                <li class="options">
                                    <div class="info">
                                        <h1>{option}</h1>
                                        <h1 class="numbers">{percentage}% ({count} votes)</h1>
                                    </div>
                                    <div class="line">
                                        <div style="width: {percentage}%;"></div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </div>

                    <div class="title">
                        <p>Total votes: {totalVotes}</p>
                    </div>
                {/if}

            {/if}
        {/if}

        {#if poll && !loading && !error}
            <div class="button">
                <div class="btn">
                    <button class="btn2 live-result-btn" on:click={() => goto(`/online-poll-tool/${$page.params.id}`)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
                        </svg>
                        Back to Poll
                    </button>
                </div>
                <button class="btn2 live-result-btn" on:click={share}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z"/>
                    </svg>
                    Share
                </button>
            </div>
        {/if}

    </div>
</div>

<style>

svg path {
        fill: #fff; 
    }

    .outer-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .inner-container {
        width: 70%;
        border: 1px solid rgb(31, 41, 55);
        border-radius: 6px;
        background-color: rgb(31, 41, 55);
        padding: 24px;
        color: rgb(209, 213, 219);
        border-top-style: solid;
        border-top-width: 4px;
        border-top-color: rgb(56, 124, 228);
    }
    .title  {
        padding: 14px 16px;
    }
    .title h2 {
        color: #fff;
        font-size: 30px;
        font-weight: 300;
    }
    .title p {
        color: #fff;
        font-size: 15px;
        font-weight: 10px;
    }
    .results {
        padding: 14px 16px;
        color: #fff;
        font-size: 15px;
        font-weight: 10px;    
    }
    .numbers {
        position: relative;
        top: 27px;
    }
    .bar {
        display: block;
    }
    .options {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .info {
        display: flex;
        justify-content: space-between;
        color: #fff;
        font-size: 15px;
        font-weight: 10px;
    }
    .bar .line {
        margin-bottom: 15px;
        position: relative;
        width: 80%;
        height: 20px;
        background: #fff;
        border-radius: 10px;
    }
    .bar .line > div {
        height: 100%;
        background: linear-gradient(to right, #4a4ce2, #43a6e2);
        border-radius: 10px;
    }


    .button {
        display: flex;
        justify-content: space-between;
    }
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .live-result-btn {
        width: 120px;
        text-align: center;
        border-radius: 6px;
        color: rgb(233, 233, 233);
        padding: 8px;
        background-color: rgb(56, 124, 228);
        margin-top: 24px;
        font-size: 14px;
        font-weight: 500;
    }
    .btn2 {
        display: flex;
        justify-content: space-evenly;
    }

    .btn2 svg{
        color: #fff;
        width: 15px;
        height: 20px;
    }
    .title p {
        font-size: 14px;
        color: rgb(133, 133, 133);
        margin-top: 10px;
    }
    @media(max-width: 1250px) {
		.inner-container{
			width: 80%;
		}
        .button {
            display: flex;
            gap: 100px;
        }
		.bar .line{
			width: 90%;
		}
    }

    @media(max-width: 900px) {
		.inner-container{
			width: 90%;
		}
        .button {
            display: block;
            gap: 20px;
        }
        .live-result-btn {
            width: 100px;
        }
		.bar .line{
			width: 95%;
		}
    }
</style>