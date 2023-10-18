<script lang="ts">
	import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	
	export let data;

	// defaults
	let background = '#e0e0e0';
	let size = 250;
	let radius = 50;
	let distance = 20;
	let intensity = 0.15;
	let blur = 60;

	let inputSets: any[] = [];
	let index = -1;
	let showFirstPair = false;
	let moveDescription = false;
	let subtotal = 0;
	let tax = 0;
	let total = 0;
	let balanceDue = 0;

	function updateTotals() {
		subtotal = inputSets.reduce((acc, inputSet) => {
			return acc + (inputSet.quantity * inputSet.rate || 0);
		}, 0);

		tax = subtotal * 0.18;
		total = subtotal + tax;
		balanceDue = total;
	}

	function addInputSet() {
		index += 1;
		inputSets = [...inputSets, { id: index, item: '', rate: '', quantity: 1, additionalInfo: '' }];
		showFirstPair = true;
		moveDescription = true;
		updateTotals();
	}
	function deleteInputSet(idToDelete) {
		const indexToDelete = inputSets.findIndex((inputSet) => inputSet.id === idToDelete);
		if (indexToDelete !== -1) {
			index -= 1;
			inputSets.splice(indexToDelete, 1);
			updateTotals();
		}
	}
	//pdf
	import jsPDF from 'jspdf';

	let invoice = 'Invoice';
	let businessName = "";
	let businessEmail = "";
	let businessAddress = "";
	let businessPhone = "";
	let businessNumber = "";
	let businessOwner = "";
	let businessWebsite = "";
	let showAdditionalDetails = false;
	let ClientName="";
	let ClientEmail="";
	let ClientAddress="";
	let ClientPhone="";
	let ClientNumber="";
	let ClientFax="";	
	function showAdditionalDetailsFun() {
		showAdditionalDetails = true;
	}
	let selectedImage = null;

	function handleSubmit() {
	convertToPDF();
	}

	async function handleFileChange(event) {
	selectedImage = event.target.files[0];
	}

	async function convertToPDF() {
	const doc = new jsPDF();
	doc.setFontSize(30);
	let l = 4.75 * invoice.length;
	let y=0;
	doc.text((210-l)/2, y+=20, invoice);
	doc.line(10, y+=10, 195, y); 
	doc.setFontSize(20);
	doc.setTextColor(68,68,68);
	doc.text(20, y+=10, businessName);
	doc.setFontSize(12);
	if(businessOwner.length != 0){
		doc.text(20, y+=10, businessOwner);
	}
	if(businessNumber.length != 0){
		doc.text(20, y+=10, 'Business Number: ' + businessNumber);
	}
	if(businessAddress.length != 0){
		doc.text(20, y+=10, businessAddress);
	}
	if(businessPhone.length != 0){
		doc.text(20, y+=10, businessPhone);
	}
	if(businessWebsite.length != 0){
		doc.text(20, y+=10, businessWebsite);
	}
	if(businessEmail.length != 0){
		doc.text(20, y+=10, businessEmail)
	}
	if(selectedImage){
		const imageBlob = await fetch(URL.createObjectURL(selectedImage)).then((response) => response.blob());
		doc.addImage(URL.createObjectURL(imageBlob), 'JPEG', 150, 40, 40, 40);
	}
	else{
		const imgData = 'data:image/jpeg;base64,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';
		doc.addImage(imgData, 'JPEG', 150, 40, 40, 40);
	}
	if(ClientAddress.length!=0 || ClientEmail.length!=0 || ClientFax.length!=0 || ClientName.length!=0 || ClientNumber.length!=0 || ClientPhone.length!=0){
		doc.setLineDashPattern([1,1],0);
		if(y>=80)
			doc.line(20, y+=10, 193, y);
		else
			doc.line(20, y+=10, 140, y);
		doc.setLineDashPattern();
		doc.text(20, y+=10, 'BILL TO');
		if(ClientName.length != 0){
			doc.text(20, y+=10, ClientName);
		}
		if(ClientAddress.length != 0){
			doc.text(20, y+=10, ClientAddress);
		}
		if(ClientPhone.length != 0){
			doc.text(20, y+=10, ClientPhone);
		}
		if(ClientNumber.length != 0){
			doc.text(20, y+=10, ClientNumber);
		}
		if(ClientFax.length != 0){
			doc.text(20, y+=10, ClientFax);
		}
		if(ClientEmail.length != 0){
			doc.text(20, y+=10, ClientEmail);
		}
	}
	doc.setTextColor(0,0,0);
	doc.line(20, y+=10, 193, y);
	doc.setFont(undefined, 'bold');
	doc.text(20, y+=7, 'DESCRIPTION');
	doc.text(120, y, 'RATE');
	doc.text(145, y, 'QTY');
	doc.text(165, y, 'AMOUNT');
	doc.setFont(undefined, 'normal');
	doc.line(20, y+=3, 193, y);
	doc.setLineWidth(0.5);
	doc.setDrawColor(0, 0, 0);
	doc.line(15, 275, 190, 275); 
	doc.text(60, 285, '</Dev>star_Invoice-Generator - Copyright-2023');
	y+=10;
	let subtotal =0;
	let tax =0;
	const maxLength = inputSets.length;
	inputSets.forEach((inputSet, index) => {
		doc.setTextColor(68,68,68);
	  if(y>230 && y<270 && index<=maxLength){
		if (showFirstPair || index > 0) {
			doc.text(`${inputSet.item}`, 20, y);
			doc.text(`$${inputSet.rate}`, 120, y);
			doc.text(`${inputSet.quantity}`, 145, y);
			let amount=parseFloat(`${inputSet.rate}`)*parseFloat(`${inputSet.quantity}`);
			subtotal+=amount;
			doc.text('$'+amount.toString(), 165, y);
			y = y + 10;
			if (inputSet.tax == true){
				tax += (18/100)*amount;
			}
      	}
	  }	  
	  else if(y>230){
		doc.addPage();
		doc.setLineWidth(0.5);
		doc.setDrawColor(0, 0, 0);
		doc.line(15, 275, 190, 275); 
		doc.text(60, 285, '</Dev>star_Invoice-Generator - Copyright-2023');
		y=30;
		if (showFirstPair || index > 0) {
			doc.text(`${inputSet.item}`, 20, y);
			doc.text(`$${inputSet.rate}`, 120, y);
			doc.text(`${inputSet.quantity}`, 145, y);
			let amount=parseFloat(`${inputSet.rate}`)*parseFloat(`${inputSet.quantity}`);
			subtotal+=amount;
			doc.text('$'+amount.toString(), 165, y);
			y = y + 10;
			if (inputSet.tax == true){
				tax += (18/100)*amount;
			}
      	}
	  }
      else if (showFirstPair || index > 0) {
        doc.text(`${inputSet.item}`, 20, y);
        doc.text(`$${inputSet.rate}`, 120, y);
        doc.text(`${inputSet.quantity}`, 145, y);
		let amount=parseFloat(`${inputSet.rate}`)*parseFloat(`${inputSet.quantity}`);
		subtotal+=amount;
		doc.text('$'+amount.toString(), 165, y);
		y = y + 10;
		if (inputSet.tax == true){
    		tax += (18/100)*amount;
		}
      }

    });
	y+=5;
	doc.setTextColor(0,0,0);
	doc.line(20, y, 193, y);
	doc.text('SUBTOTAL', 100, y+=10);
	doc.text(`$${subtotal}`, 165, y);
	doc.text('TAX(18%)', 100, y+=10);
	tax = Math.round(tax*100)/100;
	doc.text(`$${tax}`, 165, y);
	y+=5;
	doc.line(100, y, 193, y);
	doc.setFontSize(14).setFont(undefined, 'bold');
	doc.text('TOTAL', 100, y+=10);
	let total = subtotal+tax;
	doc.text(`$${total}`, 165, y);
	y+=5;
	doc.line(100, y, 193, y);
	doc.save('Invoice.pdf');
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card px items-center mx-auto max-w-screen-xl lg:grid rounded-lg">
			<hr />
			<div id="invoice" class="w-full p-4 bg-white shadow sm:p-6 md:p-8 rounded-lg">
				<div class="sticky-outer-wrapper">
  					<div class="sticky-inner-wrapper" >
    					<div class="flow-root ">
      						<div class="float-left btn-group btn-group-edit" role="group" aria-label="View Edit Invoice" style="left:0%">
        						<button type="button" class="px-5 py-3 text-base my-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Preview</button>
      						</div>
      						<div class="float-right invoice-actions-export">
        						<button title="Download a PDF copy of the invoice to your device" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4" on:click={handleSubmit}>
          							<span>PDF</span>
        						</button>
        						<button class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800" title="Email the Invoice to your client" >
									<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
										Email Invoice
									</span>
								</button>
      						</div>
    					</div>
  					</div>
				</div>
				<br>
				<div class="block max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:border-gray-700 ">
					<form>
						<label for="invoice_header"></label>
						<input type="text" bind:value={invoice} placeholder="Invoice Header" required /><br><br>
						<label for="logo">Logo:</label>
						<input accept="image/*" on:change={handleFileChange} class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="user_avatar_help" id="user_avatar" type="file">
						<div class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="user_avatar_help">A logo of your company to be display over invoice.</div>
		  			</form>
					  <div class="invoice-container invoice-detail-body">
						<div class="lg:flex lg:space-x-4">
							<div class="lg:w-1/2">
								<h1 class="text-3xl text-gray-900">From</h1> <br/>
								<form>
								  <div class="input-with-label">
									<label for="invoice-company-name" class="dark:text-gray-900">Name:</label>
									<input
									  type="text"
									  bind:value={businessName}
									  id="invoice-company-name"
									  placeholder="Business Name"
									/>
								  </div>
								  <div class="input-with-label">
									<label for="invoice-company-email" class="text-gray-900">Email:</label>
									<input
									  type="email"
									  bind:value={businessEmail}
									  id="invoice-company-email"
									  placeholder="name@business.com"
									  maxlength="45"
									/>
								  </div>
								  <div class="input-with-label">
									<label for="invoice-company-address" class=" text-gray-900">Address:</label>
									<input
									  type="text"
									  bind:value={businessAddress}
									  id="invoice-company-address"
									  placeholder="Street"
									  maxlength="45"
									/>
								  </div>
								  <div class="input-with-label">
									<label for="invoice-company-phone" class="text-gray-900">Phone:</label>
									<input
									  type="text"
									  bind:value={businessPhone}
									  id="invoice-company-phone"
									  placeholder="(123) 456 789"
									/>
								  </div>
								  <div class="input-with-label">
									<label for="invoice-company-business-number" title="Business Number" class="text-gray-900">Business Number:</label>
									<input
									  type="text"
									  bind:value={businessNumber}
									  id="invoice-company-business-number"
									  placeholder="E.g. 123-45-6789"
									/>
								  </div>
								  {#if !showAdditionalDetails}
									  <a class="show-details-link" on:click={showAdditionalDetailsFun}>
									  Show additional business details
									  </a>
								  {/if}
								  {#if showAdditionalDetails}
									  <div class="input-with-label">
										  <label for="invoice-company-website" class="text-gray-900">Website:</label>
										  <input
										  type="text"
										  bind:value={businessWebsite}
										  id="invoice-company-website"
										  placeholder="https://example-website.com"
										  />
									  </div>
									  <div class="input-with-label">
										  <label for="invoice-company-owner" class="text-gray-900">Owner:</label>
										  <input
										  type="text"
										  bind:value={businessOwner}
										  id="invoice-company-owner"
										  placeholder="Business Owner Name"
										  />
									  </div>
								  {/if}
								</form>
							</div><br>
							<div class="lg:w-1/2">
							  <h1 class="text-3xl text-gray-900">To</h1> <br/>
						<form>
						  <div class="input-with-label">
							<label for="client-name" class="dark:text-gray-900">Name:</label>
							<input
							  type="text"
							  bind:value={ClientName}
							  id="invoice-company-name"
							  placeholder="Client Name"
							/>
						  </div>
						  <div class="input-with-label">
							<label for="client-email" class="text-gray-900">Email:</label>
							<input
							  type="email"
							  bind:value={ClientEmail}
							  id="invoice-company-email"
							  placeholder="name@client.com"
							/>
						  </div>
						  <div class="input-with-label">
							<label for="client-address" class=" text-gray-900">Address:</label>
							<input
							  type="text"
							  bind:value={ClientAddress}
							  id="invoice-company-address"
							  placeholder="Street"
							  maxlength="90"
							/>
						  </div>
						  <div class="input-with-label">
							<label for="client-phone" class="text-gray-900">Phone:</label>
							<input
							  type="tel"
							  bind:value={ClientPhone}
							  id="invoice-company-phone"
							  placeholder="(123) 456 789"
							/>
						  </div>
						  <div class="input-with-label">
							<label for="client-number" title="Mobile Number" class="text-gray-900">Mobile:</label>
							<input
							  type="tel"
							  bind:value={ClientNumber}
							  id="invoice-company-business-number"
							  placeholder="E.g. 123-45-6789"
							/>
						  </div>
						  <div class="input-with-label">
							<label for="client-fax" title="Fax Number" class="text-gray-900">Fax:</label>
							<input
							  type="tel"
							  bind:value={ClientFax}
							  id="invoice-company-business-number"
							  placeholder="E.g. 123-45-6789"
							/>
						  </div>
						</form>
							</div>
						</div>
					  </div><br>
					<hr/>
					<table class="w-full">
						<thead class="border-collapse border-b">
							<tr class="w-full">
								<th class="w-10" />
								<th class="text-start w-2/5">Item Description</th>
								<th class="text-end w-1/6 px-3">Rate</th>
								<th class="text-end w-1/6 px-3">Quantity</th>
								<th class="text-center w-fit">Amount</th>
								<th class="text-center w-fit">Tax (18%)</th>
							</tr>
						</thead>
						<tbody>
							{#each inputSets as inputSet}
								{#if showFirstPair || index > 0}
									<tr>
										<td>
											<button class=" w-10 h-10 border bg-sky-500 rounded m-3" on:click={() => deleteInputSet(inputSet.id)}>X</button>
										</td>
										<td>
											<input class="w-full rounded" type="text" min="0" placeholder="Item Description" bind:value={inputSet.item}/>
										</td>
										<td class="px-2">
											<input class="w-full rounded" type="number" min="0" placeholder="0.00" bind:value={inputSet.rate} on:change={updateTotals}/>
										</td>
										<td class="px-1">
											<input class="w-full rounded text-end" type="number" min="0" bind:value={inputSet.quantity} on:change={updateTotals}/>
										</td>
										<td>
											<p class="flex justify-center">{inputSet.quantity * inputSet.rate}</p>
										</td>
										<td class="text-center">
											<input class="mx-auto" type="checkbox" name="myCheck" id="myCheck" bind:checked={inputSet.tax}/>
										</td>
									</tr>
									<tr>
										<td colspan="6">
											<input class="w-2/5 py-12 ml-16 rounded" type="text" placeholder="Additional Details" bind:value={inputSet.additionalInfo} />
										</td>
									</tr>
									{#if index !== inputSets.length - 1}
										<tr>
											<td colspan="6">
												<hr />
											</td>
										</tr>
									{/if}
								{/if}
							{/each}
						</tbody>
					</table>
					<hr />
					<button class="w-10 h-10 border bg-sky-500 rounded m-3" on:click={addInputSet}>+</button>
					<div class="card gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg lg:grid lg:grid-cols-2">
						<div class="p-8 h-full" />
							<div class="mb-4 text-gray-700">
								<div class="invoice-summary-label">
									Subtotal: <span class="price">{subtotal.toFixed(2)}</span>
								</div>
								<div class="invoice-summary-label">
									Tax: <span class="price">{tax.toFixed(2)}</span>
								</div>
								<div class="invoice-summary-label">
									Total: <span class="price">{total.toFixed(2)}</span>
								</div>
								<div class="invoice-summary-label">
									Balance due: <span class="price">{balanceDue.toFixed(2)}</span>
								</div>
							</div>	
						</div>
					</div>
				</div>
		</div>
	</div>
</section>

<style>
	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
		background-color: white;
	}
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}
	.invoice-detail-body {
        padding: 10px 10px 10px 10px;
    }
    .input-with-label label {
      /* display: inline-block; */
      font-weight: 500;
      margin-bottom: 8px;
      white-space: normal;
      word-wrap: "break-word";
      width: 5%;
    }
  
    .input-with-label input {
      width: 40%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 16px;
    }
  
    .show-details-link {
      color: #007bff;
      text-decoration: underline;
      cursor: pointer;
    }
</style>