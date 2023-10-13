<script>
    import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { P } from 'flowbite-svelte';
	import { tools } from '../../tools';
	const title = tools['gradient-background-generator'].name;
	const description = tools['gradient-background-generator'].description;

	let clrList = ['#fff', '#000', '#f00'];

	$: clrStyle = clrList.map((x) => {
		return `background: ${x};`;
	});

	console.log(clrStyle);

	const pushArr = () => {
		clrList = [...clrList, clrVal];
	};

	let clrVal = '';

	const updateClrVal1 = () => {
		clrVal = '#0f0';
	};
	const updateClrVal2 = () => {
		clrVal = '#00f';
	};

	$: bgGradient = `background-image: linear-gradient(${angle}deg, ${clrList});`;

    let angle = 0

    let speed = 1

    $: gradientSpeed = `animation-duration: ${speed};`;

    let root;

    console.log(root)

</script>

<section class="" bind:this={root}>
	<Intro heading={title} {description} />
    <div class="grid grid-cols-2 content-center">
        <div>
            <div class="color-div mx-auto w-fit flex">
                {#each [...clrStyle] as clr}
                    <div class="aspect-square h-[50px] mx-4" style={clr} />
                {/each}
            </div>
        
            <div class="my-8 w-fit mx-auto">
                <button class="text-white border-2 border-yellow p-4 rounded-lg" on:click={updateClrVal1}>
                    Add Green
                </button>
                <button class="text-white border-2 border-yellow p-4 rounded-lg" on:click={updateClrVal2}>
                    Add Blue
                </button>
            </div>
        
            <div class="my-8 w-fit mx-auto">
                <button class="text-white border-2 border-yellow p-4 rounded-lg" on:click={pushArr}>
                    Add Color
                </button>
            </div>

            <Label class="mt-3">Angle</Label>
            <Range bind:value={angle}  min="0" max="360" on:change={() => {console.log(angle)}}/>
            <Label class="mt-3">Spped</Label>
            <Range bind:value={speed}  min="1" max="15" on:change={() => {console.log(speed)}}/>

        </div>
        <div class="output h-96 m-8 aspect-square" style={bgGradient + gradientSpeed} />
    </div>



	<!-- example with the default display and a custom Input component -->
	<!-- example with the ChromeVariant -->
	<!-- <ColorPicker bind:rgb components={ChromeVariant} isRight /> -->
</section>

<style>
	.output {
		background-size: 400% 400%;
		animation: gradient ease infinite;
		animation-duration: 15s;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
