<script>
    import { Avatar } from "flowbite-svelte"

    let launched = [
        {
            name: 'Neumorphism Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }, {
                name: 'Abhishek Jadhav',
                githubId: 'AbhishekJadhav2002'
            },
            {
                name: 'Vikas Kushwaha',
                githubId: 'Vikas350'
            }]
        },
        {
            name: 'Password Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Image Color Picker',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Dummy Text Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            },
            {
                name: 'Vikas Kushwaha',
                githubId: 'Vikas350'
            }]
        },
        {
            name: 'Random Image Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Screen Video Recorder',
            contributors: [{
                name: 'Rifat Perween',
                githubId: 'rifatperween'
            },
            {
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Unit Converter',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            },
            {
                name: 'Munsif Satopay',
                githubId: 'munsifsatopay'
            }]
        },
        {
            name: 'Image Base64 Encoder',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Image Base64 Decoder',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'CSS Animator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            },
            {
                name: 'Munsif Satopay',
                githubId: 'munsifsatopay'
            }]
        },
        {
            name: 'Pomodoro Timer',
            contributors: [{
                name: 'Rifat Perween',
                githubId: 'rifatperween'
            }]
        },
        {
            name: 'Advice Generator',
            contributors: [{
                name: 'Rifat Perween',
                githubId: 'rifatperween'
            }]
        },
        {
            name: 'WhatsApp API Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Device Details',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'Robots.txt Generator',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            }]
        },
        {
            name: 'File Examples',
            contributors: [{
                name: 'Hannan Satopay',
                githubId: 'hannansatopay'
            },
            {
                name: 'Munsif Satopay',
                githubId: 'munsifsatopay'
            }]
        },
    ];
</script>
<section class="bg-white dark:bg-gray-900 p-3 sm:p-5">
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
        <h2 class="mb-8 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
            Launched
        </h2>
        <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-4 py-3">Feature</th>
                            <th scope="col" class="px-4 py-3">Contributors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each launched as l}
                            <tr class="border-b dark:border-gray-700">
                                <td scope="row" class="px-4 py-3 text-gray-900 dark:text-white">{l.name}</td>
                                <td scope="row" class="px-4 py-3 text-gray-900 dark:text-white">
                                    <div class="flex items-center space-x-2">
                                        {#each l.contributors as contributor}
                                            <a href="https://github.com/{contributor.githubId}" target="_blank" class="flex items-center space-x-1 font-medium inline-flex items-center justify-center px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 border-primary-400 hover:bg-gray-200 rounded">
                                                <Avatar src="https://github.com/{contributor.githubId}.png" size="xs"/>
                                                <div>{contributor.name}</div>
                                            </a>
                                        {/each}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
