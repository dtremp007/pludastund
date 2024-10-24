<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { generateUsername } from '$lib';
	import logo from '/src/assets/output2.svg?raw';
	import { fade, fly } from 'svelte/transition';
	import { text } from '@sveltejs/kit';

	const { data } = $props();

	let colors = $state({
		puddle: '#472400',
		cupPrimary: '#C99862',
		cupSecondary: '#6B3800',
		shadow: '#000000',
		cupInside: '#C99862',
		cupInnerShadow: '#6B3800',
		foreground: '#FFFFFF',
		puddleOutline: '#000000',
		textColor: '#FFFFFF',
		cupRim: '#E9C092'
	});

	let variationName = $state(generateUsername());
	let saving = $state(false);
	let darkMode = $state(false);

	const formattedCss = $derived(
		Object.entries(colors)
			.map(([name, value]) => `    --ps-${formatCssVar(name)}: ${value};`)
			.join('\n')
	);

	$effect(() => {
		const svg = document.querySelector('svg');
		if (svg) {
			Object.entries(colors).forEach(([name, value]) => {
				svg.style.setProperty(`--ps-${formatCssVar(name)}`, value);
			});
		}
	});

	$effect(() => {
		document.documentElement.classList.toggle('dark', darkMode);
	});

	function formatLabel(name: string) {
		return name
			.replace(/([A-Z])/g, ' $1')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function formatCssVar(name: string) {
		return name.replace(/([A-Z])/g, '-$1').toLowerCase();
	}

	function validateHexColor(color: string): string {
		// Remove any spaces from the input
		color = color.trim();

		// If it's a valid hex color without #, add it
		if (/^[0-9A-Fa-f]{6}$/.test(color)) {
			return `#${color}`;
		}

		// If it's already a valid hex color with #, return it as is
		if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
			return color;
		}

		// If it's a 3-digit hex color without #, expand it to 6 digits and add #
		if (/^[0-9A-Fa-f]{3}$/.test(color)) {
			return `#${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
		}

		// If it's a 3-digit hex color with #, expand it to 6 digits
		if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
			return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
		}

		// Return the original color if it doesn't match any valid format
		// The color input will show red to indicate invalid value
		return color;
	}

	function updateColor(name: keyof typeof colors, event: Event) {
		colors[name] = (event.target as HTMLInputElement).value;
	}

	function handleColorInput(name: keyof typeof colors, event: Event) {
		const input = event.target as HTMLInputElement;
		const validatedColor = validateHexColor(input.value);
		colors[name] = validatedColor;

		// Update the color picker value if the input is valid
		if (/^#[0-9A-Fa-f]{6}$/.test(validatedColor)) {
			const colorPicker = document.getElementById(name) as HTMLInputElement;
			if (colorPicker) {
				colorPicker.value = validatedColor;
			}
		}
	}

	async function downloadSVG() {
		const svg = document.querySelector('svg');
		if (!svg) return;

		const svgData = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([svgData], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'logo.svg';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function pasteFromClipboard(name: keyof typeof colors) {
		try {
			const text = await navigator.clipboard.readText();
			const validatedColor = validateHexColor(text);
			colors[name] = validatedColor;

			// Update the color picker if valid
			if (/^#[0-9A-Fa-f]{6}$/.test(validatedColor)) {
				const colorPicker = document.getElementById(name) as HTMLInputElement;
				if (colorPicker) {
					colorPicker.value = validatedColor;
				}
			}
		} catch (err) {
			// Handle clipboard permission denied or other errors
			console.error('Failed to read clipboard:', err);
		}
	}

	function loadVariation(savedColors: string) {
		colors = JSON.parse(savedColors);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold">Coffee Cup Color Editor</h1>
		<button
			class="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
			onclick={() => (darkMode = !darkMode)}
		>
			{darkMode ? 'Light' : 'Dark'} Mode
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<div class="space-y-6">
			<div class="grid gap-4">
				{#each Object.entries(colors) as [name, color]}
					<div class="flex items-center gap-4 flex-wrap">
						<label class="w-1/3 font-medium" for={name}>{formatLabel(name)}</label>
						<input
							type="color"
							value={color}
							id={name}
							oninput={(e) => updateColor(name, e)}
							class="h-10 w-20 rounded-md border border-input bg-background text-foreground"
						/>
						<div class="flex flex-wrap items-center gap-2">
							<input
								type="text"
								bind:value={colors[name]}
								placeholder="#HEX"
								oninput={(e) => handleColorInput(name, e)}
								class="flex-1 p-2 rounded-md border border-input bg-background text-foreground"
							/>
							<button
								type="button"
								onclick={() => pasteFromClipboard(name)}
								class="px-2 py-2 border border-border rounded hover:bg-gray-100"
								title="Paste from clipboard"
							>
								Paste
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex gap-4 items-end">
				<form
					method="POST"
					action="?/save"
					use:enhance={() => {
						return async ({ update }) => {
							saving = true;
							await update();
							saving = false;
							variationName = generateUsername();
						};
					}}
					class="contents"
				>
					<input type="hidden" name="colors" value={JSON.stringify(colors)} />
					<div class="flex-1">
						<label class="block text-sm font-medium mb-1" for="variation-name">
							Variation Name
						</label>
						<input
							type="text"
							id="variation-name"
							name="name"
							required
							bind:value={variationName}
							class="w-full p-2 rounded-md border border-input bg-background"
							placeholder="Enter a name for this variation"
						/>
					</div>
					<button
						class="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						disabled={saving}
					>
						{#if saving}
							<span class="inline-block animate-spin mr-2">◠</span>
						{/if}
						Save
					</button>
				</form>
				<button
					onclick={downloadSVG}
					class="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
				>
					⬇︎ Download
				</button>
			</div>

			<div class="p-4 rounded-md bg-muted">
				<h2 class="font-bold mb-2">CSS Variables:</h2>
				<pre class="whitespace-pre-wrap text-sm">{`:root {\n${formattedCss}\n}`}</pre>
			</div>
		</div>

		<div class="flex flex-col items-center">
			<h2 class="text-2xl font-bold mb-6">Coffee Cup Logo</h2>
			<div class="w-full max-w-[400px]">
				{@html logo}
			</div>
		</div>
	</div>

	<div class="mt-12">
		<h2 class="text-2xl font-bold mb-6">Saved Variations Gallery</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.savedVariations as variation (variation.id)}
				<div
					class="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-card text-card-foreground"
					style={Object.entries(JSON.parse(variation.colors))
						.map(([name, value]) => `--ps-${formatCssVar(name)}: ${value};`)
						.join(' ')}
					in:fly={{ y: 20, opacity: 0 }}
					out:fade={{ duration: 200 }}
				>
					<div class="flex justify-between items-start mb-4">
						<h3 class="font-medium">{variation.name}</h3>
						<div class="flex gap-2">
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={variation.id} />
								<button
									type="submit"
									class="text-muted-foreground hover:text-destructive"
									aria-label="Delete variation"
								>
									🗑️
								</button>
							</form>
							<form method="POST" action="?/like" use:enhance>
								<input type="hidden" name="id" value={variation.id} />
								<button
									type="submit"
									class="text-muted-foreground hover:text-primary"
									aria-label="Like variation"
								>
									❤️ <span>{variation.likes}</span>
								</button>
							</form>
						</div>
					</div>
					<button
						onclick={() => loadVariation(variation.colors)}
						class="w-full aspect-square flex items-center justify-center border border-border rounded-md bg-background hover:bg-accent"
					>
						{@html logo}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>
