<script>
	import { Heading, Input, NumberInput, Span, Label, Select } from 'flowbite-svelte';
	import { Checkbox } from 'flowbite-svelte';
	import { faker } from '@faker-js/faker';

	export let testData = [];
	let FormatTypes = [
		//{ value: 'html', name: 'HTML' },
		{ value: 'csv', name: 'CSV' }
		//{ value: 'json', name: 'JSON' }
	];
	let FormatType = 'csv';
	let DataCount = '10';
	let form = {
		person: {
			fullName: false,
			firstName: false,
			lastName: false,
			gender: false,
			phoneNumber: false,
			zodiacSign: false
		},
		finance: {
			accountName: false,
			accountNumber: false,
			amount: false,
			currencySymbol: false
		},
		commerce: {
			department: false,
			price: false,
			product: false,
			productDescription: false
		},
		vehicle: {
			type: false,
			color: false,
			manufacturer: false,
			model: false,
			fuel: false
		},
		location: {
			street: false,
			cityName: false,
			state: false,
			country: false
		},
		Misc: {
			genre: false,
			songName: false,
			adverb: false,
			userName: false,
			emoji: false
			
		}
	};
	console.info(form);
	function generate() {
		let [key, value] = Object.entries(form);
		let [entry, data] = Object.entries(value);
		for ([key, value] of Object.entries(form)) {
			for ([entry, data] of Object.entries(value)) {
				if (data === true) {
					const sub = entry;
					for (let i = 1; i <= DataCount; i++) {
						function valueReturn(key, sub) {
							//console.info(key, Object.entries(form)=={sub,value});
							switch (key) {
								case 'firstName':
									return faker.person.firstName();

								case 'lastName':
									return faker.person.lastName();

								case 'fullName':
									return faker.person.fullName();

								case 'phoneNumber':
									return faker.phone.number();

								case 'gender':
									return faker.person.sex();

								case 'zodiacSign':
									return faker.person.zodiacSign();

								case 'accountName':
									return faker.finance.accountName();

								case 'accountNumber':
									return faker.finance.accountNumber();

								case 'amount':
									return faker.finance.amount();

								case 'currencySymbol':
									return faker.finance.currencySymbol();

								case 'department':
									return faker.commerce.department();

								case 'price':
									return faker.commerce.price();

								case 'product':
									return faker.commerce.product();

								case 'productDescription':
									return faker.commerce.productDescription();

								case 'type':
									return faker.vehicle.type();

								case 'color':
									return faker.vehicle.color();

								case 'manufacturer':
									return faker.vehicle.manufacturer();

								case 'model':
									return faker.vehicle.model();

								case 'fuel':
									return faker.vehicle.fuel();

								case 'street':
									return faker.location.street();

								case 'cityName':
									return faker.location.city();

								case 'state':
									return faker.location.state();

								case 'country':
									return faker.location.country();

								case 'songName':
									return faker.music.songName();

								case 'genre':
									return faker.music.genre();

								case 'adverb':
									return faker.word.adverb();

								case 'userName':
									return faker.internet.userName();

								case 'emoji':
									return faker.internet.emoji();

								default:
									return 'New Data';
							}
						}
						let newData = [i];
						newData[i] = valueReturn(sub, key);
						testData[entry] += ","+ newData[i] + "","";
					}
					// testData = [valueReturn(sub, key)];
				}
			}
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		generate();
		console.log(testData);
		// Form submission logic here for faker.{field}.{entry}();
		// You can use the 'fields', 'count', and 'format' variables
	}
	
</script>

<Heading tag="h3" class="mb-2 p-3 py-8 text-center"
	>Generate Data <Span highlight><br /></Span><Span gradient /></Heading
>
<div>
	<form id="inputForm" on:submit={handleSubmit}>
		<div
			class="py-8 px-4 mx-auto max-w-screen-xl items-center text-left grid gap-6 xs:grid-cols-1 sm:grid-cols-3 grid-cols-2 space-y-0"
		>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Person</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.person.fullName}
							name="fields"
							value="full_name"
							id="full_name"
							class="p-1.5">Full Name</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.person.firstName}
							name="fields"
							value="first_name"
							id="first_name"
							class="p-1.5">First Name</Checkbox
						>
					</li>
					<li>
						<!--		<Checkbox
							bind:checked={form.person.middleName}
							name="fields"
							value="middle_name"
							id="middle_name"
							class="p-1.5">Middle Name</Checkbox
						>  -->
					</li>
					<li>
						<Checkbox
							bind:checked={form.person.lastName}
							name="fields"
							value="last_name"
							id="last_name"
							class="p-1.5">Last Name</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.person.gender}
							name="fields"
							value="gender"
							id="gender"
							class="p-1.5">Gender</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.person.phoneNumber}
							name="fields"
							value="phone_number"
							id="phone_number"
							class="p-1.5">Phone Number</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.person.zodiacSign}
							name="fields"
							value="zodiac_sign"
							id="zodiac_sign"
							class="p-1.5">Zodiac Sign</Checkbox
						>
					</li>
				</ul>
			</div>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Finance</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.finance.accountName}
							name="fields"
							value="accountName"
							id="accountName"
							class="p-1.5">Account Name</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.finance.accountNumber}
							name="fields"
							value="accountNumber"
							id="accountNumber"
							class="p-1.5">accountNumber</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.finance.amount}
							name="fields"
							value="amount"
							id="amount"
							class="p-1.5">Amount</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.finance.currencySymbol}
							name="fields"
							value="currencySymbol"
							id="currencySymbol"
							class="p-1.5">Currency Symbol</Checkbox
						>
					</li>
				</ul>
			</div>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Commerce</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.commerce.department}
							name="fields"
							value="department"
							id="department"
							class="p-1.5">Department</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.commerce.price}
							name="fields"
							value="price"
							id="price"
							class="p-1.5">Price</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.commerce.product}
							name="fields"
							value="product"
							id="product"
							class="p-1.5">Product</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.commerce.productDescription}
							name="fields"
							value="productDescription"
							id="productDescription"
							class="p-1.5">ProductD escription</Checkbox
						>
					</li>
				</ul>
			</div>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Vehicle</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.vehicle.type}
							name="fields"
							value="type"
							id="type"
							class="p-1.5">Type</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.vehicle.color}
							name="fields"
							value="color"
							id="color"
							class="p-1.5">Color</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.vehicle.manufacturer}
							name="fields"
							value="manufacturer"
							id="manufacturer"
							class="p-1.5">Manufacturer</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.vehicle.model}
							name="fields"
							value="model"
							id="model"
							class="p-1.5">Model</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.vehicle.fuel}
							name="fields"
							value="fuel"
							id="fuel"
							class="p-1.5">Fuel</Checkbox
						>
					</li>
				</ul>
			</div>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Location</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.location.street}
							name="fields"
							value="street"
							id="street"
							class="p-1.5">Street</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.location.cityName}
							name="fields"
							value="CityName"
							id="CityName"
							class="p-1.5">City Name</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.location.state}
							name="fields"
							value="state"
							id="state"
							class="p-1.5">State</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.location.country}
							name="fields"
							value="country"
							id="country"
							class="p-1.5">Country</Checkbox
						>
					</li>
				</ul>
			</div>
			<div>
				<p class="mb-4 font-semibold text-gray-900 dark:text-white">Misc</p>
				<ul
					class="w-48 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600"
				>
					<li>
						<Checkbox
							bind:checked={form.Misc.genre}
							name="fields"
							value="genre"
							id="genre"
							class="p-1.5">genre</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.Misc.songName}
							name="fields"
							value="songName"
							id="songName"
							class="p-1.5">songName</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.Misc.adverb}
							name="fields"
							value="adverb"
							id="adverb"
							class="p-1.5">adverb</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.Misc.userName}
							name="fields"
							value="userName"
							id="userName"
							class="p-1.5">userName</Checkbox
						>
					</li>
					<li>
						<Checkbox
							bind:checked={form.Misc.emoji}
							name="fields"
							value="emoji"
							id="emoji"
							class="p-1.5">emoji</Checkbox
						>
					</li>
				</ul>
			</div>

			<div class="mb-6">
				<Label class="block mb-2">
					<span>Count of Data</span>
					<NumberInput bind:value={DataCount} />
				</Label>
				<br />
				<Label
					>Select a Format
					<Select items={FormatTypes} bind:value={FormatType} />
					<!-- on:change={handleSubmit(event)  -->
				</Label>
			</div>
			<Input
				class="border-2 border-gray-500 rounded-lg"
				id="submit"
				type="submit"
				value="GENERATE DATA"
			/>
		</div>
	</form>
	<br />
	<div>
		{#each Object.entries(testData) as [field, stat]}
			<pre class="custom-scrollbar focus:outline-0 focus:shadow-none dark:text-gray-500 block p-2.5 bg-white bg-transparent w-full h-full text-sm text-gray-500 border-0" >{field},{stat}</pre>
			
		{/each}
		<textarea 
		placeholder= "Generated Data"
		readonly 
		class="custom-scrollbar focus:outline-0 focus:shadow-none dark:text-gray-500 block p-2.5 bg-white bg-transparent w-full h-full text-sm text-gray-500 border-0" 
		> {testData} </textarea>
		
		
	</div>
	<br />
</div>
