<script>
	import PlusIcon from "./components/Plus-icon.svelte"
	import CrossIcon from "./components/Cross-icon.svelte"
	import TickIcon from "./components/Tick-icon.svelte";
</script>

<div class="outer-container">
		<div class="inner-container">
			<div class="question flex flex-col">
				<label for="">Title</label>
				<input type="text" placeholder="Type your question here">
			</div>
			<div class="poll-type flex flex-col">
				<label for="">Poll type</label>
				<div class="select-poll-type flex items-center">
					<TickIcon />
					<select class="w-1/2 pl-10">
						<option selected value="Multiple-choice">Multiple choice</option>
					</select>
				</div>
			</div>
			<div class="answers flex flex-col">
				<label for="">Answer Options</label>
				<div class="option relative flex items-center">
					<input type="text" class="mb-2  w-full" placeholder="Option 1">
					<button class="absolute right-3"><CrossIcon /></button>
				</div>
				<div class="option relative flex items-center">
					<input type="text" class="mb-2  w-full" placeholder="Option 1">
					<button class="absolute right-3"><CrossIcon /></button>
				</div>
				<div class="add-option flex items-center gap-x-2">
					<button class="add-option-button flex"><PlusIcon />Add option</button>
					<p>or <button class="add-other-button">Add "Other"</button></p>
				</div>
			</div>
			<button class="create-poll-button">Create poll</button>
		</div>
</div>

<style>
	.outer-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.inner-container {
		width: 60%;
		border: 1px solid rgb(31, 41, 55);
		border-radius: 6px;
		background-color: rgb(31, 41, 55);
		padding: 24px;
		color: rgb(209, 213, 219);
		border-top-style: solid;
		border-top-width: 4px;
		border-top-color: rgb(56, 124, 228);
	}
	.question input {
		padding: 14px 16px;
	}
	.answers, .poll-type{
		margin-top: 24px;
	}
	label {
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 2px;
	}
	input, select {
		appearance: none;
		background-color: rgba(255, 255, 255, 0.05);
		border: none;
		box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
		border-radius: 6px;
	}
	input:focus, select:focus {
    outline: none;
    box-shadow: 0 0 0 1px rgb(56, 124, 228);
  }
	.add-option-button {
		align-self: baseline;
		color: rgb(229, 231, 235);
		background-color: rgb(55, 65, 81);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		padding: 8px 16px;
	}
	.add-other-button {
		color: rgb(129, 181, 248);
		font-size: 14px;
	}
	.create-poll-button {
		width: 100%;
		text-align: center;
		border-radius: 6px;
		color: white;
		padding: 8px;
		background-color: rgb(56, 124, 228);
		margin-top: 24px;
		font-size: 14px;
		font-weight: 500;
	}
</style>