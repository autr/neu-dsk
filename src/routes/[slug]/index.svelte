<script>
	import { store } from '$lib/store.js'

	$: info = $store.current.info



	$: buttons = [

		{
			url: info?.file,
			svg: `
				<g transform="rotate(90)">
					<path d="M0 50 L100 50" transform="translate(20, 0)" />
					<path d="M0 0 L70 50 L0 100" transform="translate(60, 0)" />
					<path d="M100 0 L100 100" transform="translate(55,0)" />
				</g>
			`
		},
		{
			url: `/${info.slug}/${$store.intro}`,
			svg: `
				<g transform="rotate(0)">
					<path transform="translate(0,0)" d="M0 0 L70 50 L0 100" />
					<path transform="translate(100,0)" d="M0 0 L0 100" />
					<path transform="translate(140,0)" d="M0 0 L0 100" />
				</g>
			`
		}
	]

</script>
<!-- {console.log(info)} -->

<div class="flex grow p2 column-stretch-stretch h100vh maxw38em">
	<div class="pb1 flex row-space-between-center">
		<div class="bold f4">{info.title}</div>
	</div>
	<div class="pb1 flex column-stretch-center grow">
		<div class="flex row-space-between-center">
			<div>{info.date}</div>
			<div>{info.location || ''}</div>
		</div>
		<div class="flex row-space-between-center">
			<div>{info.length}</div>
			<div>{info.format}</div>
		</div>
	</div>
	<div  class="pb1 flex column-stretch-center grow">
		{#each info.credits as credit }
			<div class="flex row-space-between-center">
				<div>{credit.name}</div>
				<div>{credit.role}</div>
			</div>
		{/each}
	</div>
	<div class="pb1 grow flex column-flex-start-center ">
		{info.description}
	</div>
	<div class="pb1 flex column-stretch-center grow">
		<div class="flex row-space-between-center">
			{#each buttons as o}
				<a 
					href={o.url} 
					class="icon button row-center-center flex b2-solid grow mr1">
					<div class="w2em h2em ">
						<svg class="icon w100pc h100pc clickable" viewBox="0 0 180 120">
							<g transform="translate(10,0)">
								{@html o.svg.replaceAll('<path', '<path vector-effect="non-scaling-stroke" ')}
							</g>
						</svg>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>