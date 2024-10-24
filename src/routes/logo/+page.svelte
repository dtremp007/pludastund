<script lang="ts">
	import { onMount } from 'svelte';
	const { data } = $props();
	import { enhance } from '$app/forms';

	let colors = $state({
		puddle: 'rgb(71,36,0)',
		cupPrimary: 'rgb(201,152,98)',
		cupSecondary: 'rgb(107,56,0)',
		shadow: 'rgb(0,0,0)',
        cupInside: 'rgb(201,152,98)',
		cupInnerShadow: 'rgb(107,56,0)',
		foreground: 'rgb(255,255,255)',
		puddleOutline: 'rgb(0,0,0)',
		textColor: 'rgb(255,255,255)',
		cupRim: 'rgb(233,192,146)'
	});

	let variationName = $state('');

	import logo from '/src/assets/output2.svg?raw';

	let formattedCss = $derived.by(() => {
		return Object.entries(colors)
			.map(([name, value]) => `    --ps-${formatCssVar(name)}: ${value};`)
			.join('\n');
	});

    const formatCss = (colors: Record<string, string>) => {
        return Object.entries(colors)
            .map(([name, value]) => `    --ps-${formatCssVar(name)}: ${value};`)
            .join('');
    };

	$effect(() => {
		const svg = document.querySelector('svg') as SVGElement;
		for (const [name, value] of Object.entries(colors)) {
			svg.style.setProperty(`--ps-${formatCssVar(name)}`, value);
		}
	});

	// Helper functions
	function rgbToHex(rgb: string) {
		const match = rgb.match(/\d+/g);
		if (!match) return '#000000';
		const [r, g, b] = match.map(Number);
		return (
			'#' +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				})
				.join('')
		);
	}

	function hexToRgb(hex: string) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgb(${r},${g},${b})`;
	}

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

	function updateColor(name: keyof typeof colors, event: InputEvent) {
		colors[name] = hexToRgb(event.target?.value);
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

	function loadVariation(savedColors: string) {
		colors = JSON.parse(savedColors);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	onMount(() => {
		console.log('mounted');
		console.dir(data);
	});
</script>

<div class="grid grid-cols-1 lg:grid-cols-2">
	<div class="p-6 max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold mb-6">Coffee Cup Color Editor</h1>

		<div class="grid gap-4">
			{#each Object.entries(colors) as [name, color]}
				<div class="flex items-center gap-4">
					<div class="w-1/3">
						<label class="font-medium" for={name}>{formatLabel(name)}</label>
					</div>

					<input
						type="color"
						value={rgbToHex(color)}
						id={name}
						oninput={(e) => updateColor(name, e)}
						class="h-10 w-20"
					/>

					<input
						type="text"
						bind:value={colors[name]}
						placeholder="rgb(R,G,B) or #HEX"
						class="flex-1 p-2 border rounded"
					/>
				</div>
			{/each}
		</div>

		<div class="mt-6 flex gap-4 items-end">
			<form method="POST" action="?/save" use:enhance class="contents">
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
						class="w-full p-2 border rounded"
						placeholder="Enter a name for this variation"
					/>
				</div>
				<button
					class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Save
				</button>
			</form>
			<button
				onclick={downloadSVG}
				class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
			>
				⬇︎ Download
			</button>
		</div>

		<div class="mt-8 p-4 bg-gray-100 rounded">
			<h2 class="font-bold mb-2">CSS Variables:</h2>
			<pre class="whitespace-pre-wrap text-sm">{`:root {\n${formattedCss}\n}`}</pre>
		</div>
	</div>

	<div class="p-6 w-full max-w-[700px] mx-auto"
    >
		<h1 class="text-2xl font-bold mb-6">Coffee Cup Logo</h1>
		<div class="flex justify-center">
			{@html logo}
		</div>
	</div>
</div>

<div class="max-w-7xl mx-auto px-6 py-12">
	<h2 class="text-2xl font-bold mb-6">Saved Variations Gallery</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.savedVariations as variation}
			<div class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            style={formatCss(JSON.parse(variation.colors))}
            >
				<div class="flex justify-between items-start mb-4">
					<h3 class="font-medium">{variation.name}</h3>
					<form method="POST" action="?/like" use:enhance>
						<input type="hidden" name="id" value={variation.id} />
						<button type="submit" class="text-gray-600 hover:text-red-500">
							❤️
							<span>{variation.likes}</span>
						</button>
					</form>
				</div>
				<button
					onclick={() => loadVariation(variation.colors)}
					class="w-full aspect-square flex items-center justify-center border rounded bg-gray-50 hover:bg-gray-100"
				>
					{@html logo}
				</button>
			</div>
		{/each}
	</div>
</div>
