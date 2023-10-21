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
	let pdfContainer="";
	let pdfDataUrl = null;
	function showAdditionalDetailsFun() {
		showAdditionalDetails = true;
	}
	let selectedImage = null;

	function handleSubmit() {
	convertToPDF(1);
	}

	async function handleFileChange(event) {
	selectedImage = event.target.files[0];
	}

	async function convertToPDF(pdf) {
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
		const imgData = 'https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/df/8a/8f/df8a8fab-91e6-7781-529d-bf4ca601b64f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.jpeg/256x256bb.jpg';
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
	if(y<80){
		y=80;
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
	if(pdf == 1){
		doc.save('Invoice.pdf');
	}
	else{
		enableButton(2)
		pdfDataUrl = doc.output('datauristring');
		const previewIframe = document.getElementById('preview-iframe');
		if (previewIframe) {
		previewIframe.remove();
		}

		const iframe = document.createElement('iframe');
		iframe.id = 'preview-iframe';
		iframe.width = '100%';
		iframe.height = '600px';
		iframe.src = pdfDataUrl;

		pdfContainer = document.getElementById('pdf-container');
		pdfContainer.appendChild(iframe);

		const otherElements = document.querySelectorAll('.box1');
		otherElements.forEach((element) => {
		element.style.display = 'none';
		});
		pdfContainer.style.display = 'block';
	}
	function enableButton(buttonNumber) {
		const button1 = document.getElementById('button1');
		const button2 = document.getElementById('button2');

		if (buttonNumber === 1) {
		button1.classList.remove('cursor-not-allowed');
		button2.classList.add('cursor-not-allowed');
		button1.addEventListener('click', () => enableButton(2));
		button2.removeEventListener('click', () => enableButton(1));
		} 
		else {
		button1.classList.add('cursor-not-allowed');
		button2.classList.remove('cursor-not-allowed');
		button1.removeEventListener('click', () => enableButton(2));
		button2.addEventListener('click', () => enableButton(1));
		}
	}
	}
	async function visibility(){
		const otherElements = document.querySelectorAll('.box1');
		otherElements.forEach((element) => {
		element.style.display = 'block';
		});
		pdfContainer.style.display = 'none';
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
        						<button type="button" id="button1" class="px-5 py-2.5 text-base my-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" on:click={convertToPDF}>Preview</button>
								<button type="button" id="button2" class="px-5 py-2.5 text-base my-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-not-allowed" on:click={visibility}>Edit</button>
      						</div>
      						<div class="float-right invoice-actions-export">
        						<button title="Download a PDF copy of the invoice to your device" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4" on:click={handleSubmit}>
          							<span>PDF</span>
        						</button>
        						<button class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800" title="Email the Invoice to your client" >
									<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
										<a href="mailto:{ClientEmail}?&subject={invoice}&body=The%20body%20of%20the%20email%0D%0A{pdfDataUrl}">
											Email Invoice
										</a>
									</span>
								</button>
      						</div>
    					</div>
  					</div>
				</div>
				<br>
				<div class="box1 block max-w p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:border-gray-700 ">
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
									  maxlength="60"
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
							  maxlength="60"
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
				<div id="pdf-container" style="display: none;">
					<!-- PDF content will be displayed here -->
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